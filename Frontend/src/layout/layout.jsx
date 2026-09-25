// File Path: Frontend\src\layout\layout.jsx
import React, { useState } from 'react';
import { GraduationCap, Menu, X } from 'lucide-react';
import { routes } from '../routes/routes';

export default function Layout({ children, activeTab, setActiveTab }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-[#f1f5f9] font-sans antialiased overflow-hidden">
            {/* Sidebar — width animates open/closed */}
            <aside
                className={`bg-[#1b2537] text-slate-300 flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-0'
                    }`}
            >
                {/* Fixed-width inner wrapper so content doesn't squish/wrap during the width transition */}
                <div className="w-64 flex flex-col h-full">
                    <div className="p-5 flex items-center space-x-3">
                        <div className="bg-[#2a3854] p-2 rounded-md text-white flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-white tracking-wide leading-tight">School IMS</h1>
                            <p className="text-[11px] text-slate-400 font-medium">Monitoring System</p>
                        </div>
                    </div>

                    <div className="mt-4 px-4 flex-1">
                        <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-3 px-2">MODULES</p>
                        <nav className="space-y-1">
                            {routes.map(({ id, label, sublabel, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === id
                                        ? 'bg-[#2a3a5c] text-white shadow-sm'
                                        : 'hover:bg-[#25324c] text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Icon className="w-4 h-4" />
                                        {sublabel ? (
                                            <div className="text-left">
                                                <div>{label}</div>
                                                <div className="text-[10px] font-normal text-slate-400 -mt-0.5">{sublabel}</div>
                                            </div>
                                        ) : (
                                            <span>{label}</span>
                                        )}
                                    </div>
                                    {activeTab === id && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 border-t border-slate-700/50 text-[11px] text-slate-400 font-medium">
                        School Year 2024–2025
                    </div>
                </div>
            </aside>

            {/* Main Container */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200/80 px-2 flex items-center justify-between shrink-0">
                    {/* Hamburger toggle only */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                        title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        {isSidebarOpen ? <Menu className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                    </button>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full text-emerald-600 text-xs font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>System Online</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#1b2537] text-white font-bold flex items-center justify-center text-xs shadow-sm cursor-pointer hover:bg-slate-700 transition-colors">
                            A
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4">
                    {children}
                </main>
            </div>
        </div>
    );
}