<?php

namespace App\Http\Controllers;

use App\Models\StudentBarcode;
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
}
