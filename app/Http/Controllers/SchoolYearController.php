<?php

namespace App\Http\Controllers;

use App\Models\SchoolYear;
use Illuminate\Http\Request;

class SchoolYearController extends Controller
{
    public function index()
    {
        return SchoolYear::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'SchoolYearName' => 'required|string|max:20|unique:school_years,SchoolYearName',
            'StartDate' => 'nullable|date',
            'EndDate' => 'nullable|date',
            'Status' => 'required|string|max:20',
        ]);

        $schoolYear = SchoolYear::create($validated);

        return response()->json($schoolYear, 201);
    }

    public function show(SchoolYear $schoolYear)
    {
        return $schoolYear;
    }

    public function update(Request $request, SchoolYear $schoolYear)
    {
        $validated = $request->validate([
            'SchoolYearName' => 'required|string|max:20|unique:school_years,SchoolYearName,' . $schoolYear->SchoolYearID . ',SchoolYearID',
            'StartDate' => 'nullable|date',
            'EndDate' => 'nullable|date',
            'Status' => 'required|string|max:20',
        ]);

        $schoolYear->update($validated);

        return response()->json($schoolYear);
    }

    public function destroy(SchoolYear $schoolYear)
    {
        $schoolYear->delete();

        return response()->json(['message' => 'School year deleted']);
    }
}
