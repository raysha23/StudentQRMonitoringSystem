<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{
    private const WITH = 'department:DepartmentID,DepartmentCode,DepartmentName';

    // Programs can only belong to an existing Teaching department
    private function departmentRule(): array
    {
        return [
            'integer',
            Rule::exists('departments', 'DepartmentID')
                ->where('DepartmentType', 'Teaching'),
        ];
    }

    public function index(Request $request)
    {
        $query = Course::with(self::WITH)
            ->withCount('sections')
            ->orderByDesc('CourseID');

        if (! $request->has('page')) {
            return $query->get();
        }
        if ($st = $request->query('status')) {
            $query->where('Status', $st);
        }
        if ($s = trim((string) $request->query('search', ''))) {
            $query->where(fn($q) => $q
                ->where('CourseCode', 'like', "%{$s}%")
                ->orWhere('CourseName', 'like', "%{$s}%")
                ->orWhere('Description', 'like', "%{$s}%")
                ->orWhereHas('department', fn($d) => $d
                    ->where('DepartmentName', 'like', "%{$s}%")));
        }

        return $query->paginate(min((int) $request->query('per_page', 9), 100));
    }
    public function store(Request $request)
    {
        $data = $request->validate([
            'CourseCode'   => 'required|string|max:50|unique:courses,CourseCode',
            'CourseName'   => 'required|string|max:150',
            'DepartmentID' => array_merge(['required'], $this->departmentRule()),
            'Description'  => 'nullable|string|max:255',
            'Majors'       => 'nullable|array',
            'Majors.*'     => 'string|max:100',
        ]);

        $data['Status'] = 'Active';

        $course = Course::create($data);

        return response()->json(
            $course->load(self::WITH)->loadCount('sections'),
            201
        );
    }

    public function show(Course $course)
    {
        return $course->load(self::WITH)->loadCount('sections');
    }

    public function update(Request $request, Course $course)
    {
        $data = $request->validate([
            'CourseCode'   => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('courses', 'CourseCode')
                    ->ignore($course->CourseID, 'CourseID'),
            ],
            'CourseName'   => 'sometimes|required|string|max:150',
            'DepartmentID' => array_merge(['sometimes', 'required'], $this->departmentRule()),
            'Description'  => 'nullable|string|max:255',
            'Majors'       => 'nullable|array',
            'Majors.*'     => 'string|max:100',
            'Status'       => 'sometimes|in:Active,Inactive',
        ]);

        $course->update($data);

        return $course->load(self::WITH)->loadCount('sections');
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
