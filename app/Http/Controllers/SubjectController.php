<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubjectController extends Controller
{
    private const WITH = [
        'course:CourseID,CourseCode,CourseName,DepartmentID',
        'course.department:DepartmentID,DepartmentName',
    ];

    public function index(Request $request)
    {
        $query = Subject::with(self::WITH)->orderByDesc('SubjectID');

        if (! $request->has('page')) {
            return $query->get();
        }
        if ($st = $request->query('status')) {
            $query->where('Status', $st);
        }
        if ($s = trim((string) $request->query('search', ''))) {
            $query->where(fn($q) => $q
                ->where('SubjectCode', 'like', "%{$s}%")
                ->orWhere('SubjectTitle', 'like', "%{$s}%")
                ->orWhereHas('course', fn($c) => $c
                    ->where('CourseCode', 'like', "%{$s}%")
                    ->orWhere('CourseName', 'like', "%{$s}%")));
        }

        return $query->paginate(min((int) $request->query('per_page', 10), 100));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'SubjectCode'  => 'required|string|max:30|unique:subjects,SubjectCode',
            'SubjectTitle' => 'required|string|max:150',
            'CourseID'     => 'required|exists:courses,CourseID',
            'Units'        => 'nullable|integer|min:0|max:12',
        ]);

        return response()->json(
            Subject::create($data)->load(self::WITH),
            201
        );
    }

    public function show(Subject $subject)
    {
        return $subject->load(self::WITH);
    }

    public function update(Request $request, Subject $subject)
    {
        $data = $request->validate([
            'SubjectCode'  => [
                'sometimes',
                'required',
                'string',
                'max:30',
                Rule::unique('subjects', 'SubjectCode')
                    ->ignore($subject->SubjectID, 'SubjectID'),
            ],
            'SubjectTitle' => 'sometimes|required|string|max:150',
            'CourseID'     => 'sometimes|required|exists:courses,CourseID',
            'Units'        => 'nullable|integer|min:0|max:12',
            'Status'       => 'sometimes|in:Active,Inactive',
        ]);

        $subject->update($data);

        return $subject->load(self::WITH);
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();

        return response()->noContent();
    }
}
