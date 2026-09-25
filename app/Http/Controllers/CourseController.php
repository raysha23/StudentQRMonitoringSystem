<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index()
    {
        return Course::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'CourseCode' => 'required|string|max:50|unique:courses,CourseCode',
            'CourseName' => 'required|string|max:150',
            'Description' => 'nullable|string|max:255',
            'Status' => 'required|string|max:20',
        ]);

        $course = Course::create($validated);

        return response()->json($course, 201);
    }

    public function show(Course $course)
    {
        return $course;
    }

    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'CourseCode' => 'required|string|max:50|unique:courses,CourseCode,' . $course->CourseID . ',CourseID',
            'CourseName' => 'required|string|max:150',
            'Description' => 'nullable|string|max:255',
            'Status' => 'required|string|max:20',
        ]);

        $course->update($validated);

        return response()->json($course);
    }

    public function destroy(Course $course)
    {
        $course->delete();

        return response()->json(['message' => 'Course deleted']);
    }
}
