<?php

namespace App\Http\Controllers;

use App\Models\Section;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    public function index()
    {
        return Section::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'SectionName' => 'required|string|max:100',
            'CourseID' => 'required|integer|exists:courses,CourseID',
            'YearLevel' => 'nullable|integer',
            'SchoolYearID' => 'required|integer|exists:school_years,SchoolYearID',
            'Adviser' => 'nullable|string|max:150',
            'Status' => 'required|string|max:20',
        ]);

        $section = Section::create($validated);

        return response()->json($section, 201);
    }

    public function show(Section $section)
    {
        return $section;
    }

    public function update(Request $request, Section $section)
    {
        $validated = $request->validate([
            'SectionName' => 'required|string|max:100',
            'CourseID' => 'required|integer|exists:courses,CourseID',
            'YearLevel' => 'nullable|integer',
            'SchoolYearID' => 'required|integer|exists:school_years,SchoolYearID',
            'Adviser' => 'nullable|string|max:150',
            'Status' => 'required|string|max:20',
        ]);

        $section->update($validated);

        return response()->json($section);
    }

    public function destroy(Section $section)
    {
        $section->delete();

        return response()->json(['message' => 'Section deleted']);
    }
}
