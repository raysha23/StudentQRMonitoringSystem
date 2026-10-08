<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PositionController extends Controller
{
    public function index()
    {
        return Position::orderByDesc('PositionTitle')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'PositionTitle' => 'required|string|max:150|unique:positions,PositionTitle',
            'PositionType'  => 'required|in:Teaching,Non-Teaching',
        ]);

        return response()->json(Position::create($data), 201);
    }

    public function show(Position $position)
    {
        return $position;
    }

    public function update(Request $request, Position $position)
    {
        $data = $request->validate([
            'PositionTitle' => [
                'sometimes',
                'required',
                'string',
                'max:150',
                Rule::unique('positions', 'PositionTitle')
                    ->ignore($position->PositionID, 'PositionID')
            ],
            'PositionType'  => 'sometimes|required|in:Teaching,Non-Teaching',
            'Status'        => 'sometimes|in:Active,Inactive',
        ]);

        $position->update($data);

        return $position;
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
