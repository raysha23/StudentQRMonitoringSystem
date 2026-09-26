// File Path: Frontend\src\layout\layout.jsx
import React, { useState } from "react";
import { GraduationCap, Menu, X, LogOut } from "lucide-react";
import { routes } from "../routes/routes";

export default function Layout({
    children,
    activeTab,
    setActiveTab,
    user,
    onLogout,
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-[#f1f5f9] font-sans antialiased overflow-hidden">
            {/* Sidebar — width animates between full (w-64) and icon-only (w-20) */}
            <aside
                className={`bg-[#1b2537] text-slate-300 flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? "w-64" : "w-20"
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div
                        className={`p-5 flex items-center ${isSidebarOpen ? "space-x-3" : "justify-center"}`}
                    >
                        <div className="bg-[#2a3854] p-2 rounded-md text-white flex items-center justify-center shrink-0">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        {isSidebarOpen && (
                            <div className="whitespace-nowrap">
                                <h1 className="text-sm font-bold text-white tracking-wide leading-tight">
                                    School
                                </h1>
                                <p className="text-[11px] text-slate-400 font-medium">
                                    Monitoring System
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Nav */}
                    <div
                        className={`mt-4 flex-1 ${isSidebarOpen ? "px-4" : "px-2"}`}
                    >
                        <nav className="space-y-1">
                            {routes.map(
                                ({ id, label, sublabel, icon: Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => setActiveTab(id)}
                                        title={
                                            !isSidebarOpen ? label : undefined
                                        }
                                        className={`w-full flex items-center rounded-lg text-xs font-semibold transition-all ${
                                            isSidebarOpen
                                                ? "justify-between px-3 py-2.5"
                                                : "justify-center py-2.5"
                                        } ${
                                            activeTab === id
                                                ? "bg-[#2a3a5c] text-white shadow-sm"
                                                : "hover:bg-[#25324c] text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        <div
                                            className={`flex items-center ${isSidebarOpen ? "space-x-3" : ""}`}
                                        >
                                            <Icon className="w-5 h-5 shrink-0" />
                                            {isSidebarOpen &&
                                                (sublabel ? (
                                                    <div className="text-left whitespace-nowrap">
                                                        <div>{label}</div>
                                                        <div className="text-[10px] font-normal text-slate-400 -mt-0.5">
                                                            {sublabel}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="whitespace-nowrap">
                                                        {label}
                                                    </span>
                                                ))}
                                        </div>
                                        {isSidebarOpen && activeTab === id && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                                        )}
                                    </button>
                                ),
                            )}
                        </nav>
                    </div>

                    {/* Footer */}
                    {isSidebarOpen && (
                        <div className="p-4 border-t border-slate-700/50 text-[11px] text-slate-400 font-medium whitespace-nowrap">
                            School Year 2024–2025
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Container */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200/80 px-2 flex items-center justify-between shrink-0">
                    {/* Hamburger toggle */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                        title={
                            isSidebarOpen
                                ? "Collapse sidebar"
                                : "Expand sidebar"
                        }
                    >
                        {isSidebarOpen ? (
                            <Menu className="w-7 h-7" />
                        ) : (
                            <Menu className="w-7 h-7" />
                        )}
                    </button>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full text-emerald-600 text-xs font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>System Online</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-[#1b2537] text-white font-bold flex items-center justify-center text-xs shadow-sm">
                                {user?.FirstName?.[0] ||
                                    user?.Username?.[0] ||
                                    "A"}
                            </div>
                            <span className="text-xs font-semibold text-slate-600 hidden sm:block">
                                {user
                                    ? `${user.FirstName} ${user.LastName}`
                                    : ""}
                            </span>
                            <button
                                onClick={onLogout}
                                title="Logout"
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-red-500"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4">{children}</main>
            </div>
        </div>
    );
}
