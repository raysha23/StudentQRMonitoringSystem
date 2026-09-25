<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return User::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'Username' => 'required|string|max:100|unique:users_custom,Username',
            'PasswordHash' => 'required|string|min:6',
            'FirstName' => 'required|string|max:100',
            'LastName' => 'required|string|max:100',
            'Status' => 'required|string|max:20',
        ]);

        $user = User::create($validated);

        return response()->json($user, 201);
    }

    public function show(User $user)
    {
        return $user;
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'Username' => 'required|string|max:100|unique:users_custom,Username,' . $user->UserID . ',UserID',
            'PasswordHash' => 'nullable|string|min:6',
            'FirstName' => 'required|string|max:100',
            'LastName' => 'required|string|max:100',
            'Status' => 'required|string|max:20',
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }
}
