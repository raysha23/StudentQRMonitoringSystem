// File Path: Frontend\src\modules\report\Report-Management.jsx

import React, { useState, useMemo } from 'react';
import { Search, Download, Calendar, Filter } from 'lucide-react';

const INITIAL_LOGS = [
    {
        logId: 'L-1790304518946',
        student: { name: 'Nico Espinosa', id: 'S-2024-012', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
        course: 'BSBA',
        section: 'D',
        year: '4th Year',
        type: 'TIME OUT',
        dateTime: 'Sep 25, 2026 10:48:38 AM',
        date: '2026-09-25',
    },
    {
        logId: 'L-1790304419160',
        student: { name: 'Carlo Mendoza', id: 'S-2024-004', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
        course: 'BSBA',
        section: 'C',
        year: '1st Year',
        type: 'TIME IN',
        dateTime: 'Sep 25, 2026 10:46:59 AM',
        date: '2026-09-25',
    },
    {
        logId: 'L-69',
        student: { name: 'Ana Reyes', id: 'S-2024-003', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
        course: 'BSEd',
        section: 'A',
        year: '4th Year',
        type: 'TIME OUT',
        dateTime: 'Sep 25, 2026 05:26:00 PM',
        date: '2026-09-25',
    },
    {
        logId: 'L-79',
        student: { name: 'Jasmine Florendo', id: 'S-2024-011', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
        course: 'BSN',
        section: 'A',
        year: '1st Year',
        type: 'TIME OUT',
        dateTime: 'Sep 25, 2026 05:24:00 PM',
        date: '2026-09-25',
    },
    {
        logId: 'L-77',
        student: { name: 'Camille Aquino', id: 'S-2024-009', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
        course: 'BSCS',
        section: 'B',
        year: '2nd Year',
        type: 'TIME OUT',
        dateTime: 'Sep 25, 2026 05:19:00 PM',
        date: '2026-09-25',
    },
    {
        logId: 'L-75',
        student: { name: 'Paolo Villanueva', id: 'S-2024-008', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
        course: 'BSEE',
        section: 'C',
        year: '1st Year',
        type: 'TIME OUT',
        dateTime: 'Sep 25, 2026 05:18:00 PM',
        date: '2026-09-25',
    },
    {
        logId: 'L-65',
        student: { name: 'Maria Santos', id: 'S-2024-001', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
        course: 'BSCS',
        section: 'A',
        year: '3rd Year',
        type: 'TIME OUT',
        dateTime: 'Sep 25, 2026 05:05:00 PM',
        date: '2026-09-25',
    },
    {
        logId: 'L-71',
        student: { name: 'Carlo Mendoza', id: 'S-2024-004', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
        course: 'BSBA',
        section: 'C',
        year: '1st Year',
        type: 'TIME OUT',
        dateTime: 'Sep 25, 2026 04:49:00 PM',
        date: '2026-09-25',
    },
    {
        logId: 'L-67',
        student: { name: 'Juan dela Cruz', id: 'S-2024-002', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' },
        course: 'BSIT',
        section: 'B',
        year: '2nd Year',
        type: 'TIME OUT',
        dateTime: 'Sep 25, 2026 04:47:00 PM',
        date: '2026-09-25',
    },
    {
        logId: 'L-81',
        student: { name: 'Nico Espinosa', id: 'S-2024-012', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
        course: 'BSBA',
        section: 'D',
        year: '4th Year',
        type: 'TIME OUT',
        dateTime: 'Sep 25, 2026 04:38:00 PM',
        date: '2026-09-25',
    },
];

export default function ReportManagement() {
    const [fromDate, setFromDate] = useState('2026-09-25');
    const [toDate, setToDate] = useState('2026-09-25');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('All');
    const [selectedSection, setSelectedSection] = useState('All');
    const [selectedType, setSelectedType] = useState('All');

    // Filtered dataset
    const filteredLogs = useMemo(() => {
        return INITIAL_LOGS.filter((log) => {
            const matchesSearch =
                log.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.logId.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCourse = selectedCourse === 'All' || log.course === selectedCourse;
            const matchesSection = selectedSection === 'All' || log.section === selectedSection;
            const matchesType = selectedType === 'All' || log.type === selectedType;

            return matchesSearch && matchesCourse && matchesSection && matchesType;
        });
    }, [searchQuery, selectedCourse, selectedSection, selectedType]);

    // Statistics
    const totalRecords = filteredLogs.length;
    const totalTimeIn = filteredLogs.filter((log) => log.type === 'TIME IN').length;
    const totalTimeOut = filteredLogs.filter((log) => log.type === 'TIME OUT').length;

    // Export to CSV Function
    const handleExportCSV = () => {
        const headers = ['LOG ID', 'STUDENT NAME', 'STUDENT ID', 'COURSE', 'SECTION', 'YEAR', 'TYPE', 'DATE & TIME'];
        const rows = filteredLogs.map((log) => [
            log.logId,
            log.student.name,
            log.student.id,
            log.course,
            log.section,
            log.year,
            log.type,
            log.dateTime,
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Attendance_Report_${fromDate}_to_${toDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans space-y-6">

            {/* Module Header */}
            <div>
                <h1 className="text-lg font-bold text-slate-800 leading-none">Report Management</h1>
                <p className="text-xs text-slate-400 mt-1 font-medium">Sep 25, 2026 - School Administration</p>
            </div>

            {/* TOP SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* TOTAL RECORDS CARD */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TOTAL RECORDS</p>
                    <h2 className="text-3xl font-bold text-slate-800 mt-1">{totalRecords}</h2>
                </div>

                {/* TIME IN CARD */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">TIME IN</p>
                    <h2 className="text-3xl font-bold text-blue-600 mt-1">{totalTimeIn}</h2>
                </div>

                {/* TIME OUT CARD */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">TIME OUT</p>
                    <h2 className="text-3xl font-bold text-amber-600 mt-1">{totalTimeOut}</h2>
                </div>

            </div>

            {/* FILTERS & SEARCH BAR */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Filter className="w-3.5 h-3.5" />
                    <span>FILTER RECORDS</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">

                    {/* Left Side Controls: Date pickers, Search, Dropdowns */}
                    <div className="flex flex-wrap items-center gap-3">

                        {/* Date From */}
                        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
                            <span className="text-slate-400">From</span>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="bg-transparent border-none text-slate-700 font-medium focus:outline-none cursor-pointer"
                            />
                        </div>

                        {/* Date To */}
                        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
                            <span className="text-slate-400">To</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="bg-transparent border-none text-slate-700 font-medium focus:outline-none cursor-pointer"
                            />
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search student..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                            />
                        </div>

                        {/* Course Dropdown */}
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="All">All Courses</option>
                            <option value="BSBA">BSBA</option>
                            <option value="BSCS">BSCS</option>
                            <option value="BSIT">BSIT</option>
                            <option value="BSEd">BSEd</option>
                            <option value="BSN">BSN</option>
                            <option value="BSCPE">BSCPE</option>
                            <option value="BSEE">BSEE</option>
                        </select>

                        {/* Section Dropdown */}
                        <select
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="All">All Sections</option>
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                            <option value="C">Section C</option>
                            <option value="D">Section D</option>
                        </select>

                        {/* Types Dropdown */}
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="All">All Types</option>
                            <option value="TIME IN">TIME IN</option>
                            <option value="TIME OUT">TIME OUT</option>
                        </select>

                    </div>

                    {/* Right Side: Export CSV Button */}
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition shadow-xs"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                    </button>

                </div>
            </div>

            {/* LOGS TABLE */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                <th className="py-3 px-4">LOG ID</th>
                                <th className="py-3 px-4">STUDENT</th>
                                <th className="py-3 px-4">COURSE</th>
                                <th className="py-3 px-4">SECTION</th>
                                <th className="py-3 px-4">YEAR</th>
                                <th className="py-3 px-4">TYPE</th>
                                <th className="py-3 px-4">DATE & TIME</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log, index) => (
                                    <tr key={index} className="hover:bg-slate-50/80 transition">

                                        {/* Log ID */}
                                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                                            {log.logId}
                                        </td>

                                        {/* Student Avatar, Name & ID */}
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={log.student.avatar}
                                                    alt={log.student.name}
                                                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                                />
                                                <div>
                                                    <p className="font-bold text-slate-800 leading-tight">{log.student.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{log.student.id}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Course */}
                                        <td className="py-3 px-4 font-bold text-slate-800">{log.course}</td>

                                        {/* Section */}
                                        <td className="py-3 px-4 text-slate-500">{log.section}</td>

                                        {/* Year */}
                                        <td className="py-3 px-4 text-slate-500">{log.year}</td>

                                        {/* Type Badge */}
                                        <td className="py-3 px-4">
                                            {log.type === 'TIME IN' ? (
                                                <span className="inline-block bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">
                                                    TIME IN
                                                </span>
                                            ) : (
                                                <span className="inline-block bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">
                                                    TIME OUT
                                                </span>
                                            )}
                                        </td>

                                        {/* Date & Time */}
                                        <td className="py-3 px-4 font-medium text-slate-500">{log.dateTime}</td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                                        No log records found matching the criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION FOOTER */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>Showing 1-{filteredLogs.length} of {filteredLogs.length} records</span>
                    <div className="flex items-center space-x-2">
                        <button disabled className="px-2 py-1 text-slate-300 font-medium cursor-not-allowed">
                            &larr; Prev
                        </button>
                        <button className="w-7 h-7 bg-blue-900 text-white rounded font-bold flex items-center justify-center">
                            1
                        </button>
                        <button disabled className="px-2 py-1 text-slate-300 font-medium cursor-not-allowed">
                            Next &rarr;
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
}