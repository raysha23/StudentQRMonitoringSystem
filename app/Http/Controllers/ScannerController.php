<?php

namespace App\Http\Controllers;

use App\Models\Scanner;
use Illuminate\Http\Request;

class ScannerController extends Controller
{
    public function index()
    {
        return Scanner::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ScannerName' => 'required|string|max:100',
            'DeviceName' => 'required|string|max:100',
            'Location' => 'nullable|string|max:150',
            'ScannerType' => 'required|string|max:20',
            'Status' => 'required|string|max:20',
        ]);

        $scanner = Scanner::create($validated);

        return response()->json($scanner, 201);
    }

    public function show(Scanner $scanner)
    {
        return $scanner;
    }

    public function update(Request $request, Scanner $scanner)
    {
        $validated = $request->validate([
            'ScannerName' => 'required|string|max:100',
            'DeviceName' => 'required|string|max:100',
            'Location' => 'nullable|string|max:150',
            'ScannerType' => 'required|string|max:20',
            'Status' => 'required|string|max:20',
        ]);

        $scanner->update($validated);

        return response()->json($scanner);
    }

    public function destroy(Scanner $scanner)
    {
        $scanner->delete();

        return response()->json(['message' => 'Scanner deleted']);
    }
}
