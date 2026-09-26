<?php

namespace App\Http\Controllers;

use App\Models\StudentLog;
use Illuminate\Http\Request;
use App\Models\StudentBarcode;
use Illuminate\Support\Facades\DB;

class StudentLogController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'FromDate' => 'nullable|date',
            'ToDate' => 'nullable|date',
        ]);

        $fromDate = $validated['FromDate'] ?? today()->toDateString();
        $toDate = $validated['ToDate'] ?? today()->toDateString();

        return StudentLog::with(['student.course', 'student.section', 'student.schoolYear'])
            ->whereDate('ScannedAt', '>=', $fromDate)
            ->whereDate('ScannedAt', '<=', $toDate)
            ->orderByDesc('ScannedAt')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'StudentID' => 'required|integer|exists:students,StudentID',
            'BarcodeID' => 'required|integer|exists:student_barcodes,BarcodeID',
            'LogType' => 'required|string|max:20',
            'ScannedAt' => 'required|date',
            'ScannerID' => 'required|integer|exists:scanners,ScannerID',
            'Remarks' => 'nullable|string|max:255',
        ]);

        $log = StudentLog::create($validated);

        return response()->json($log, 201);
    }

    public function show(StudentLog $studentLog)
    {
        return $studentLog;
    }

    public function update(Request $request, StudentLog $studentLog)
    {
        $validated = $request->validate([
            'StudentID' => 'required|integer|exists:students,StudentID',
            'BarcodeID' => 'required|integer|exists:student_barcodes,BarcodeID',
            'LogType' => 'required|string|max:20',
            'ScannedAt' => 'required|date',
            'ScannerID' => 'required|integer|exists:scanners,ScannerID',
            'Remarks' => 'nullable|string|max:255',
        ]);

        $studentLog->update($validated);

        return response()->json($studentLog);
    }

    public function destroy(StudentLog $studentLog)
    {
        $studentLog->delete();

        return response()->json(['message' => 'Log deleted']);
    }

    public function scan(Request $request)
    {
        $validated = $request->validate([
            'BarcodeValue' => 'required|string',
            'ScannerID' => 'required|integer|exists:scanners,ScannerID',
        ]);

        $barcode = StudentBarcode::where('BarcodeValue', $validated['BarcodeValue'])
            ->where('Status', 'Active')
            ->first();

        if (!$barcode) {
            return response()->json([
                'message' => 'Barcode not recognized or inactive.',
            ], 404);
        }

        if (!$barcode->student) {
            return response()->json([
                'message' => 'Barcode is not linked to a student record.',
            ], 422);
        }

        // // Guard against the same physical tap/scan firing twice in a row
        // $recentAny = StudentLog::where('StudentID', $barcode->StudentID)
        //     ->where('ScannedAt', '>=', now()->subSeconds(60))
        //     ->exists();

        // if ($recentAny) {
        //     return response()->json([
        //         'message' => "{$barcode->student->FirstName} was already scanned moments ago.",
        //     ], 409);
        // }

        // Auto-determine Time In vs Time Out from this student's most recent
        // log today: no log yet, or last log was a Time Out, means this scan
        // is a Time In. Otherwise it's a Time Out.
        $lastLogToday = StudentLog::where('StudentID', $barcode->StudentID)
            ->whereDate('ScannedAt', today())
            ->orderByDesc('ScannedAt')
            ->first();

        $logType = (!$lastLogToday || $lastLogToday->LogType === 'TIME OUT')
            ? 'TIME IN'
            : 'TIME OUT';

        $log = DB::transaction(function () use ($barcode, $validated, $logType) {
            return StudentLog::create([
                'StudentID' => $barcode->StudentID,
                'BarcodeID' => $barcode->BarcodeID,
                'LogType' => $logType,
                'ScannedAt' => now(),
                'ScannerID' => $validated['ScannerID'],
            ]);
        });

        $log->load(['student.course', 'student.section', 'student.schoolYear']);

        return response()->json($log, 201);
    }

    public function today(Request $request)
    {
        $validated = $request->validate([
            'LogType' => 'required|string|in:TIME IN,TIME OUT',
        ]);

        $logs = StudentLog::where('LogType', $validated['LogType'])
            ->whereDate('ScannedAt', today())
            ->with(['student.course', 'student.section', 'student.schoolYear'])
            ->orderByDesc('ScannedAt')
            ->limit(50)
            ->get();

        return response()->json($logs);
    }
}
