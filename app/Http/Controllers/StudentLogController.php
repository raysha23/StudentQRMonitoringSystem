<?php

namespace App\Http\Controllers;

use App\Models\StudentLog;
use Illuminate\Http\Request;

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
}
