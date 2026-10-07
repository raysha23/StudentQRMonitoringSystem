<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{
    public function index()
    {
        return Course::withCount('sections')->orderBy('CourseCode')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'CourseCode'  => 'required|string|max:50|unique:courses,CourseCode',
            'CourseName'  => 'required|string|max:150',
            'Description' => 'nullable|string|max:255',
            'Majors'      => 'nullable|array',
            'Majors.*'    => 'string|max:100',
        ]);

        $data['Status'] = 'Active';

        return response()->json(Course::create($data), 201);
    }

    public function show(Course $course)
    {
        return $course->loadCount('sections');
    }

    public function update(Request $request, Course $course)
    {
        $data = $request->validate([
            'CourseCode'  => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('courses', 'CourseCode')->ignore($course->CourseID, 'CourseID')
            ],
            'CourseName'  => 'sometimes|required|string|max:150',
            'Description' => 'nullable|string|max:255',
            'Majors'      => 'nullable|array',
            'Majors.*'    => 'string|max:100',
            'Status'      => 'sometimes|in:Active,Inactive',
        ]);

        $course->update($data);

        return $course->loadCount('sections');
    }

    public function destroy(Course $course)
    {
        if ($course->sections()->exists() || $course->subjects()->exists()) {
            return response()->json(
                ['message' => 'Cannot delete a program that still has sections or subjects.'],
                409
            );
        }

        $course->delete();

        return response()->noContent();
    }
}
