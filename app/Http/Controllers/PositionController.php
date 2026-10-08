<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PositionController extends Controller
{
    private const WITH = 'department:DepartmentID,DepartmentName,DepartmentType';

    public function index(Request $request)
    {
        $query = Position::with(self::WITH)->orderByDesc('PositionID');

        if (! $request->has('page')) {
            return $query->get();
        }

        if ($st = $request->query('status')) {
            $query->where('Status', $st);
        }
        
        if ($s = trim((string) $request->query('search', ''))) {
            $query->where(fn($q) => $q
                ->where('PositionTitle', 'like', "%{$s}%")
                ->orWhereHas('department', fn($d) => $d
                    ->where('DepartmentName', 'like', "%{$s}%")
                    ->orWhere('DepartmentType', 'like', "%{$s}%")));
        }

        return $query->paginate(min((int) $request->query('per_page', 10), 100));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'PositionTitle' => [
                'required',
                'string',
                'max:150',
                Rule::unique('positions', 'PositionTitle')
                    ->where('DepartmentID', $request->input('DepartmentID')),
            ],
            'DepartmentID' => 'required|integer|exists:departments,DepartmentID',
        ]);

        return response()->json(Position::create($data)->load(self::WITH), 201);
    }

    public function show(Position $position)
    {
        return $position->load(self::WITH);
    }

    public function update(Request $request, Position $position)
    {
        $departmentId = $request->input('DepartmentID', $position->DepartmentID);

        $data = $request->validate([
            'PositionTitle' => [
                'sometimes',
                'required',
                'string',
                'max:150',
                Rule::unique('positions', 'PositionTitle')
                    ->where('DepartmentID', $departmentId)
                    ->ignore($position->PositionID, 'PositionID'),
            ],
            'DepartmentID' => 'sometimes|required|integer|exists:departments,DepartmentID',
            'Status'       => 'sometimes|in:Active,Inactive',
        ]);

        $position->update($data);

        return $position->load(self::WITH);
    }

    public function destroy(Position $position)
    {
        if ($position->employees()->exists()) {
            return response()->json(
                ['message' => 'Cannot delete a position that still has employees.'],
                409
            );
        }

        $position->delete();

        return response()->noContent();
    }
}
