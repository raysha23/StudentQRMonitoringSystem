// File Path: Frontend\src\modules\report\Report-Management.jsx

import React, { useState, useMemo, useEffect } from "react";
import { Search, Download, Calendar, Filter } from "lucide-react";
import { getStudentLogs } from "../../api/student-log-api";

export default function ReportManagement() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [fromDate, setFromDate] = useState("2026-09-25");
    const [toDate, setToDate] = useState("2026-09-25");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("All");
    const [selectedSection, setSelectedSection] = useState("All");
    const [selectedType, setSelectedType] = useState("All");

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getStudentLogs();
            console.log(res.data[0]); // TEMP: check field names
            setLogs(res.data);
        } catch (err) {
            setError("Failed to load logs. Is the backend running?");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Filtered dataset
    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const fullName =
                `${log.student?.FirstName ?? ""} ${log.student?.LastName ?? ""}`.toLowerCase();
            const matchesSearch =
                fullName.includes(searchQuery.toLowerCase()) ||
                String(log.StudentID).includes(searchQuery) ||
                String(log.LogID).includes(searchQuery);

            const matchesCourse =
                selectedCourse === "All" ||
                log.student?.course?.CourseName === selectedCourse;
            const matchesSection =
                selectedSection === "All" ||
                log.student?.section?.SectionName === selectedSection;
            const matchesType =
                selectedType === "All" || log.LogType === selectedType;

            return (
                matchesSearch && matchesCourse && matchesSection && matchesType
            );
        });
    }, [logs, searchQuery, selectedCourse, selectedSection, selectedType]);

    // Statistics
    const totalRecords = filteredLogs.length;
    const totalTimeIn = filteredLogs.filter(
        (log) => log.LogType === "TIME IN",
    ).length;
    const totalTimeOut = filteredLogs.filter(
        (log) => log.LogType === "TIME OUT",
    ).length;

    // Export to CSV Function
    const handleExportCSV = () => {
        const headers = [
            "LOG ID",
            "STUDENT NAME",
            "STUDENT ID",
            "COURSE",
            "SECTION",
            "YEAR",
            "TYPE",
            "DATE & TIME",
        ];
        const rows = filteredLogs.map((log) => [
            log.LogID,
            `${log.student?.FirstName ?? ""} ${log.student?.LastName ?? ""}`.trim(),
            log.StudentID,
            log.student?.course?.CourseName ?? "",
            log.student?.section?.SectionName ?? "",
            log.student?.YearLevel ?? "",
            log.LogType,
            log.ScannedAt,
        ]);
        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
            "download",
            `Attendance_Report_${fromDate}_to_${toDate}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans space-y-6">
            {/* Module Header */}
            <div>
                <h1 className="text-lg font-bold text-slate-800 leading-none">
                    Report Management
                </h1>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                    Sep 25, 2026 - School Administration
                </p>
            </div>

            {/* TOP SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* TOTAL RECORDS CARD */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        TOTAL RECORDS
                    </p>
                    <h2 className="text-3xl font-bold text-slate-800 mt-1">
                        {totalRecords}
                    </h2>
                </div>

                {/* TIME IN CARD */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                        TIME IN
                    </p>
                    <h2 className="text-3xl font-bold text-blue-600 mt-1">
                        {totalTimeIn}
                    </h2>
                </div>

                {/* TIME OUT CARD */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                        TIME OUT
                    </p>
                    <h2 className="text-3xl font-bold text-amber-600 mt-1">
                        {totalTimeOut}
                    </h2>
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
                                    <tr
                                        key={index}
                                        className="hover:bg-slate-50/80 transition"
                                    >
                                        {/* Log ID */}
                                        {/* Log ID */}
                                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                                            L-{log.LogID}
                                        </td>

                                        {/* Student Avatar, Name & ID */}
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={
                                                        log.student
                                                            ?.ProfilePicture ||
                                                        `https://api.dicebear.com/9.x/initials/svg?seed=${log.student?.FirstName}-${log.student?.LastName}`
                                                    }
                                                    alt={`${log.student?.FirstName ?? ""} ${log.student?.LastName ?? ""}`}
                                                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                                />
                                                <div>
                                                    <p className="font-bold text-slate-800 leading-tight">
                                                        {log.student?.FirstName}{" "}
                                                        {log.student?.LastName}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                        {log.StudentID}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Course */}
                                        <td className="py-3 px-4 font-bold text-slate-800">
                                            {log.student?.course?.CourseName ??
                                                "—"}
                                        </td>

                                        {/* Section */}
                                        <td className="py-3 px-4 text-slate-500">
                                            {log.student?.section
                                                ?.SectionName ?? "—"}
                                        </td>

                                        {/* Year */}
                                        <td className="py-3 px-4 text-slate-500">
                                            {log.student?.YearLevel ?? "—"}
                                        </td>

                                        {/* Type Badge */}
                                        <td className="py-3 px-4">
                                            {log.LogType === "TIME IN" ? (
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
                                        <td className="py-3 px-4 font-medium text-slate-500">
                                            {log.ScannedAt}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="py-8 text-center text-slate-400 text-xs"
                                    >
                                        No log records found matching the
                                        criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION FOOTER */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>
                        Showing 1-{filteredLogs.length} of {filteredLogs.length}{" "}
                        records
                    </span>
                    <div className="flex items-center space-x-2">
                        <button
                            disabled
                            className="px-2 py-1 text-slate-300 font-medium cursor-not-allowed"
                        >
                            &larr; Prev
                        </button>
                        <button className="w-7 h-7 bg-blue-900 text-white rounded font-bold flex items-center justify-center">
                            1
                        </button>
                        <button
                            disabled
                            className="px-2 py-1 text-slate-300 font-medium cursor-not-allowed"
                        >
                            Next &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
