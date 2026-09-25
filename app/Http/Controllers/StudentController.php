<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index()
    {
        return Student::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'StudentNumber' => 'required|string|max:50|unique:students,StudentNumber',
            'FirstName' => 'required|string|max:100',
            'MiddleName' => 'nullable|string|max:100',
            'LastName' => 'required|string|max:100',
            'Suffix' => 'nullable|string|max:20',
            'DateOfBirth' => 'nullable|date',
            'Gender' => 'nullable|string|max:20',
            'Address' => 'nullable|string|max:255',
            'ContactNumber' => 'nullable|string|max:30',
            'Email' => 'nullable|email|max:150',
            'CourseID' => 'required|integer|exists:courses,CourseID',
            'SectionID' => 'required|integer|exists:sections,SectionID',
            'YearLevel' => 'nullable|integer',
            'SchoolYearID' => 'required|integer|exists:school_years,SchoolYearID',
            'Status' => 'required|string|max:20',
        ]);

        $student = Student::create($validated);

        return response()->json($student, 201);
    }

    public function show(Student $student)
    {
        return $student;
    }

    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'StudentNumber' => 'required|string|max:50|unique:students,StudentNumber,' . $student->StudentID . ',StudentID',
            'FirstName' => 'required|string|max:100',
            'MiddleName' => 'nullable|string|max:100',
            'LastName' => 'required|string|max:100',
            'Suffix' => 'nullable|string|max:20',
            'DateOfBirth' => 'nullable|date',
            'Gender' => 'nullable|string|max:20',
            'Address' => 'nullable|string|max:255',
            'ContactNumber' => 'nullable|string|max:30',
            'Email' => 'nullable|email|max:150',
            'CourseID' => 'required|integer|exists:courses,CourseID',
            'SectionID' => 'required|integer|exists:sections,SectionID',
            'YearLevel' => 'nullable|integer',
            'SchoolYearID' => 'required|integer|exists:school_years,SchoolYearID',
            'Status' => 'required|string|max:20',
        ]);

        $student->update($validated);

        return response()->json($student);
    }

    public function destroy(Student $student)
    {
        $student->delete();

        return response()->json(['message' => 'Student deleted']);
    }
}
