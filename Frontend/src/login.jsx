// File path: Frontend\src\login.jsx
import React, { useState } from "react";
import { GraduationCap, Lock, User } from "lucide-react";
import { login } from "./api/auth-api";

export default function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await login(username, password);
            localStorage.setItem("token", data.token);
            onLoginSuccess?.(data.user);
        } catch (err) {
            setError(err.message || "Invalid username or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-[#f1f5f9] font-sans antialiased">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-slate-200/80 p-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-[#1b2537] p-3 rounded-md text-white flex items-center justify-center mb-3">
                        <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-sm font-bold text-[#1b2537] tracking-wide">
                        School
                    </h1>
                    <p className="text-[11px] text-slate-400 font-medium">
                        Monitoring System
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-600">
                            Username
                        </label>
                        <div className="mt-1 flex items-center border border-slate-200 rounded-lg px-3 py-2 focus-within:border-[#2a3a5c] focus-within:ring-1 focus-within:ring-[#2a3a5c]">
                            <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full text-sm outline-none text-slate-700"
                                placeholder="Enter username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-600">
                            Password
                        </label>
                        <div className="mt-1 flex items-center border border-slate-200 rounded-lg px-3 py-2 focus-within:border-[#2a3a5c] focus-within:ring-1 focus-within:ring-[#2a3a5c]">
                            <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full text-sm outline-none text-slate-700"
                                placeholder="Enter password"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs text-red-500 font-medium">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1b2537] hover:bg-[#25324c] text-white text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}
