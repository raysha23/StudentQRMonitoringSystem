<?php

namespace App\Http\Controllers;

use App\Models\SchoolYear;
use App\Models\Section;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    public function index()
    {
        return Section::with('course:CourseID,CourseCode')->orderBy('SectionName')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'SectionName'  => 'required|string|max:100',
            'CourseID'     => 'required|exists:courses,CourseID',
            'YearLevel'    => 'nullable|integer|between:1,6',
            'Adviser'      => 'nullable|string|max:150',
            'SchoolYearID' => 'nullable|exists:school_years,SchoolYearID',
        ]);

        // SchoolYearID is NOT NULL in your table, so fall back to the active year
        $data['SchoolYearID'] ??= SchoolYear::where('Status', 'Active')->value('SchoolYearID');

        if (!$data['SchoolYearID']) {
            return response()->json(['message' => 'No active school year found.'], 422);
        }

        $data['Status'] = 'Active';

        return response()->json(
            Section::create($data)->load('course:CourseID,CourseCode'),
            201
        );
    }

    public function show(Section $section)
    {
        return $section->load('course:CourseID,CourseCode');
    }

    public function update(Request $request, Section $section)
    {
        $data = $request->validate([
            'SectionName' => 'sometimes|required|string|max:100',
            'CourseID'    => 'sometimes|required|exists:courses,CourseID',
            'YearLevel'   => 'nullable|integer|between:1,6',
            'Adviser'     => 'nullable|string|max:150',
            'Status'      => 'sometimes|in:Active,Inactive',
        ]);

        $section->update($data);

        return $section->load('course:CourseID,CourseCode');
    }

    public function destroy(Section $section)
    {
        $section->delete();

        return response()->noContent();
    }
}
