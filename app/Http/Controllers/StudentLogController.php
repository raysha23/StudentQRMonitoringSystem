<?php

namespace App\Http\Controllers;

use App\Models\StudentLog;
use Illuminate\Http\Request;
use App\Models\StudentBarcode;
use Illuminate\Support\Facades\DB;

class StudentLogController extends Controller
{
    public function index()
    {
        return StudentLog::all();
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
            'LogType' => 'required|string|in:TIME IN,TIME OUT',
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

        $recentDuplicate = StudentLog::where('StudentID', $barcode->StudentID)
            ->where('LogType', $validated['LogType'])
            ->where('ScannedAt', '>=', now()->subSeconds(60))
            ->exists();

        if ($recentDuplicate) {
            return response()->json([
                'message' => "{$barcode->student->FirstName} was already scanned for {$validated['LogType']} moments ago.",
            ], 409);
        }

        $log = DB::transaction(function () use ($barcode, $validated) {
            return StudentLog::create([
                'StudentID' => $barcode->StudentID,
                'BarcodeID' => $barcode->BarcodeID,
                'LogType' => $validated['LogType'],
                'ScannedAt' => now(),
                'ScannerID' => $validated['ScannerID'],
            ]);
        });

        $log->load(['student.course', 'student.section']);

        return response()->json($log, 201);
    }

    public function today(Request $request)
    {
        $validated = $request->validate([
            'LogType' => 'required|string|in:TIME IN,TIME OUT',
        ]);

        $logs = StudentLog::where('LogType', $validated['LogType'])
            ->whereDate('ScannedAt', today())
            ->with(['student.course', 'student.section'])
            ->orderByDesc('ScannedAt')
            ->limit(50)
            ->get();

        return response()->json($logs);
    }
}
