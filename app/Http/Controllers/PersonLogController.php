<?php

namespace App\Http\Controllers;

use App\Models\PersonBarcode;
use App\Models\PersonLog;
use Illuminate\Http\Request;

class PersonLogController extends Controller
{
    private const WITH = [
        'student.course',
        'student.section',
        'student.schoolYear',
        'employee.position',
        'employee.department',
    ];

    // GET /person-logs?from=2026-10-01&to=2026-10-07
    public function index(Request $request)
    {
        $request->validate([
            'from' => 'nullable|date',
            'to'   => 'nullable|date|after_or_equal:from',
        ]);

        $from = $request->query('from', today()->toDateString());
        $to   = $request->query('to', $from);

        return PersonLog::with(self::WITH)
            ->whereDate('ScannedAt', '>=', $from)
            ->whereDate('ScannedAt', '<=', $to)
            ->orderByDesc('ScannedAt')
            ->get();
    }

    // GET /person-logs/today
    public function today()
    {
        return PersonLog::with(self::WITH)
            ->whereDate('ScannedAt', today())
            ->orderByDesc('ScannedAt')
            ->get();
    }

    // POST /scan
    public function scan(Request $request)
    {
        $data = $request->validate([
            'BarcodeValue' => 'required|string|max:255',
            'ScannerID'    => 'required|integer|exists:scanners,ScannerID',
        ]);

        $barcode = PersonBarcode::where('BarcodeValue', $data['BarcodeValue'])
            ->where('Status', 'Active')
            ->first();

        if (!$barcode) {
            return response()->json(['message' => 'Barcode not recognized or inactive.'], 404);
        }

        // Whoever owns the barcode: a student or an employee
        $personKey = $barcode->StudentID
            ? ['StudentID' => $barcode->StudentID]
            : ['EmployeeID' => $barcode->EmployeeID];

        $lastLog = PersonLog::where($personKey)
            ->whereDate('ScannedAt', today())
            ->orderByDesc('ScannedAt')
            ->orderByDesc('LogID')
            ->first();

        // First scan of the day = TIME IN, then alternate
        $logType = (!$lastLog || $lastLog->LogType === 'TIME OUT') ? 'TIME IN' : 'TIME OUT';

        $log = PersonLog::create($personKey + [
            'BarcodeID' => $barcode->BarcodeID,
            'LogType'   => $logType,
            'ScannedAt' => now(),
            'ScannerID' => $data['ScannerID'],
        ]);

        return response()->json([
            'message' => $logType . ' recorded.',
            'log'     => $log->load(self::WITH),
        ], 201);
    }

    public function show(PersonLog $personLog)
    {
        return $personLog->load(self::WITH);
    }

    public function destroy(PersonLog $personLog)
    {
        $personLog->delete();

        return response()->noContent();
    }
}
