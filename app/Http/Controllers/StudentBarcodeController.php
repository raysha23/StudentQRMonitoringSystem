<?php

namespace App\Http\Controllers;

use App\Models\StudentBarcode;
use App\Models\Student;

use Illuminate\Http\Request;

class StudentBarcodeController extends Controller
{
    public function index()
    {
        return StudentBarcode::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'StudentID' => 'required|integer|exists:students,StudentID',
            'BarcodeValue' => 'required|string|max:255|unique:student_barcodes,BarcodeValue',
            'BarcodeFormat' => 'required|string|max:20',
            'Status' => 'required|string|max:20',
            'GeneratedAt' => 'nullable|date',
            'DeactivatedAt' => 'nullable|date',
        ]);

        $barcode = StudentBarcode::create($validated);

        return response()->json($barcode, 201);
    }

    public function show(StudentBarcode $studentBarcode)
    {
        return $studentBarcode;
    }

    public function update(Request $request, StudentBarcode $studentBarcode)
    {
        $validated = $request->validate([
            'StudentID' => 'required|integer|exists:students,StudentID',
            'BarcodeValue' => 'required|string|max:255|unique:student_barcodes,BarcodeValue,' . $studentBarcode->BarcodeID . ',BarcodeID',
            'BarcodeFormat' => 'required|string|max:20',
            'Status' => 'required|string|max:20',
            'GeneratedAt' => 'nullable|date',
            'DeactivatedAt' => 'nullable|date',
        ]);

        $studentBarcode->update($validated);

        return response()->json($studentBarcode);
    }

    public function destroy(StudentBarcode $studentBarcode)
    {
        $studentBarcode->delete();

        return response()->json(['message' => 'Barcode deleted']);
    }


    /**
     * GET /students/{student}/barcode
     * Return the active barcode for a student.
     * If none exists, generate one on the fly.
     */
    public function forStudent(Student $student)
    {
        $barcode = StudentBarcode::where('StudentID', $student->StudentID)
            ->where('Status', 'Active')
            ->latest('BarcodeID')
            ->first();

        if (!$barcode) {
            $barcode = StudentBarcode::generateFor($student);
        }

        return response()->json([
            'BarcodeID'     => $barcode->BarcodeID,
            'StudentID'     => $barcode->StudentID,
            'BarcodeValue'  => $barcode->BarcodeValue,
            'BarcodeFormat' => $barcode->BarcodeFormat,
            'Status'        => $barcode->Status,
            'GeneratedAt'   => $barcode->GeneratedAt,
            'DeactivatedAt' => $barcode->DeactivatedAt,
        ]);
    }

    /**
     * POST /students/{student}/barcode/reissue
     * Deactivate old barcodes and issue a fresh one.
     */
    public function reissue(Student $student)
    {
        StudentBarcode::where('StudentID', $student->StudentID)
            ->where('Status', 'Active')
            ->update([
                'Status'        => 'Inactive',
                'DeactivatedAt' => now(),
            ]);

        $barcode = StudentBarcode::generateFor($student);

        return response()->json($barcode, 201);
    }
}
