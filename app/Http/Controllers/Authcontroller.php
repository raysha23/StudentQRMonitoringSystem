<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'Username' => 'required|string',
            'Password' => 'required|string',
        ]);

        $user = User::where('Username', $validated['Username'])->first();

        if (!$user || !password_verify($validated['Password'], $user->PasswordHash)) {
            return response()->json([
                'message' => 'Invalid username or password.',
            ], 401);
        }

        if ($user->Status !== 'Active') {
            return response()->json([
                'message' => 'This account is not active.',
            ], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => [
                'UserID' => $user->UserID,
                'Username' => $user->Username,
                'FirstName' => $user->FirstName,
                'LastName' => $user->LastName,
            ],
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'UserID' => $user->UserID,
            'Username' => $user->Username,
            'FirstName' => $user->FirstName,
            'LastName' => $user->LastName,
        ]);
    }
}
