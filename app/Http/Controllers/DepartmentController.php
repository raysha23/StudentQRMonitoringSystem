<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Department::orderByDesc('DepartmentID');

        if (! $request->has('page')) {
            return $query->get();
        }
        if ($st = $request->query('status')) {
            $query->where('Status', $st);
        }
        if ($s = trim((string) $request->query('search', ''))) {
            $query->where(fn($q) => $q
                ->where('DepartmentCode', 'like', "%{$s}%")
                ->orWhere('DepartmentName', 'like', "%{$s}%")
                ->orWhere('DepartmentType', 'like', "%{$s}%"));
        }

        return $query->paginate(min((int) $request->query('per_page', 10), 100));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'DepartmentCode' => 'required|string|max:20|unique:departments,DepartmentCode',
            'DepartmentName' => 'required|string|max:150',
            'DepartmentType' => 'required|in:Teaching,Non-Teaching',
        ]);

        return response()->json(Department::create($data), 201);
    }

    public function show(Department $department)
    {
        return $department;
    }

    public function update(Request $request, Department $department)
    {
        $data = $request->validate([
            'DepartmentCode' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('departments', 'DepartmentCode')
                    ->ignore($department->DepartmentID, 'DepartmentID'),
            ],
            'DepartmentName' => 'sometimes|required|string|max:150',
            'DepartmentType' => 'sometimes|required|in:Teaching,Non-Teaching',
            'Status'         => 'sometimes|in:Active,Inactive',
        ]);

        $department->update($data);

        return $department;
    }

    public function destroy(Department $department)
    {
        if ($department->positions()->exists() || $department->courses()->exists()) {
            return response()->json(
                ['message' => 'Cannot delete a department that still has positions or programs.'],
                409
            );
        }

        $department->delete();

        return response()->noContent();
    }
}
