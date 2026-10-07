<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{
    public function index()
    {
        return Department::orderBy('DepartmentName')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'DepartmentCode' => 'required|string|max:20|unique:departments,DepartmentCode',
            'DepartmentName' => 'required|string|max:150',
            'DepartmentHead' => 'nullable|string|max:150',
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
                    ->ignore($department->DepartmentID, 'DepartmentID')
            ],
            'DepartmentName' => 'sometimes|required|string|max:150',
            'DepartmentHead' => 'nullable|string|max:150',
            'Status'         => 'sometimes|in:Active,Inactive',
        ]);

        $department->update($data);

        return $department;
    }

    public function destroy(Department $department)
    {
        if ($department->employees()->exists()) {
            return response()->json(
                ['message' => 'Cannot delete a department that still has employees.'],
                409
            );
        }

        $department->delete();

        return response()->noContent();
    }
}
