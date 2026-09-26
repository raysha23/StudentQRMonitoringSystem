// File Path: Frontend\src\modules\report\Report-Management.jsx

import React, { useState, useMemo, useEffect } from "react";
import { Search, Download, Calendar, Filter } from "lucide-react";
import { getStudentLogs } from "../../api/student-log-api";
import { getCourses } from "../../api/course-api";
import { getSchoolYears } from "../../api/school-year-api";
import { getSections } from "../../api/section-api";

export default function ReportManagement() {
    const [logs, setLogs] = useState([]);
    const [courses, setCourses] = useState([]);
    const [schoolYears, setSchoolYears] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const todayString = new Date().toISOString().split("T")[0];
    const [fromDate, setFromDate] = useState(todayString);
    const [toDate, setToDate] = useState(todayString);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("All");
    const [selectedSection, setSelectedSection] = useState("All");
    const [selectedType, setSelectedType] = useState("All");
    const [selectedSchoolYear, setSelectedSchoolYear] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 15;

    useEffect(() => {
        loadFilters();
    }, []);

    useEffect(() => {
        loadLogs();
    }, [fromDate, toDate]);

    useEffect(() => {
        setCurrentPage(1);
    }, [
        searchQuery,
        selectedCourse,
        selectedSection,
        selectedType,
        selectedSchoolYear,
        fromDate,
        toDate,
    ]);

    const loadLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getStudentLogs(fromDate, toDate);
            setLogs(res.data);
        } catch (err) {
            setError("Failed to load logs. Is the backend running?");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadFilters = async () => {
        try {
            const [coursesRes, schoolYearsRes, sectionsRes] = await Promise.all(
                [getCourses(), getSchoolYears(), getSections()],
            );
            setCourses(coursesRes.data);
            setSchoolYears(schoolYearsRes.data);
            setSections(sectionsRes.data);
        } catch (err) {
            console.error("Failed to load filter options", err);
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
            const matchesSchoolYear =
                selectedSchoolYear === "All" ||
                log.student?.schoolYear?.SchoolYearName === selectedSchoolYear;

            return (
                matchesSearch &&
                matchesCourse &&
                matchesSection &&
                matchesType &&
                matchesSchoolYear
            );
        });
    }, [
        logs,
        searchQuery,
        selectedCourse,
        selectedSection,
        selectedType,
        selectedSchoolYear,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredLogs.length / logsPerPage),
    );

    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * logsPerPage;
        return filteredLogs.slice(start, start + logsPerPage);
    }, [filteredLogs, currentPage]);

    // Statistics
    const totalRecords = filteredLogs.length;
    const totalTimeIn = filteredLogs.filter(
        (log) => log.LogType === "TIME IN",
    ).length;
    const totalTimeOut = filteredLogs.filter(
        (log) => log.LogType === "TIME OUT",
    ).length;

    // Export to CSV Function
    // Parses a ScannedAt value robustly. Laravel sometimes returns a MySQL-style
    // "2026-09-26 08:00:00" timestamp (space instead of "T"), which some browsers
    // fail to parse as a valid Date, silently producing an empty/invalid time.
    const parseScannedAt = (value) => {
        if (!value) return null;
        const normalized =
            typeof value === "string" ? value.replace(" ", "T") : value;
        const parsed = new Date(normalized);
        return isNaN(parsed.getTime()) ? null : parsed;
    };

    // Export to CSV Function
    const handleExportCSV = () => {
        const headers = [
            "STUDENT NUMBER",
            "STUDENT NAME",
            "COURSE",
            "SECTION",
            "SCHOOL YEAR",
            "YEAR",
            "TYPE",
            "DATE",
            "TIME",
        ];

        const escapeCsvField = (value) => {
            const str = String(value ?? "");
            // Wrap in quotes and escape any internal quotes, so commas or
            // quote characters inside a name/address never shift columns.
            return `"${str.replace(/"/g, '""')}"`;
        };

        // Excel auto-detects quoted date/time-looking strings and converts them
        // to real date/time serials, which then show as "######" in a narrow
        // column. Wrapping in ="..." forces Excel to treat it as literal text.
        const forceTextInExcel = (value) => `="${value}"`;

        const rows = filteredLogs.map((log) => {
            const scannedDate = parseScannedAt(log.ScannedAt);
            const datePart = scannedDate
                ? scannedDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                  })
                : "—";
            const timePart = scannedDate
                ? scannedDate.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                  })
                : "—";

            return [
                log.student?.StudentNumber ?? "",
                `${log.student?.FirstName ?? ""} ${log.student?.LastName ?? ""}`.trim(),
                log.student?.course?.CourseName ?? "",
                log.student?.section?.SectionName ?? "",
                log.student?.schoolYear?.SchoolYearName ?? "",
                log.student?.YearLevel ?? "",
                log.LogType,
                forceTextInExcel(datePart),
                forceTextInExcel(timePart),
            ];
        });

        const titleRow = [`Monitoring Report (${fromDate} to ${toDate})`];
        const blankRow = [""];

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [titleRow, blankRow, headers, ...rows]
                .map((row) => row.map(escapeCsvField).join(","))
                .join("\n");

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
                            {courses.map((c) => (
                                <option key={c.CourseID} value={c.CourseName}>
                                    {c.CourseCode}
                                </option>
                            ))}
                        </select>
                        {/* School Year Dropdown */}
                        <select
                            value={selectedSchoolYear}
                            onChange={(e) =>
                                setSelectedSchoolYear(e.target.value)
                            }
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="All">All School Years</option>
                            {schoolYears.map((sy) => (
                                <option
                                    key={sy.SchoolYearID}
                                    value={sy.SchoolYearName}
                                >
                                    {sy.SchoolYearName}
                                </option>
                            ))}
                        </select>

                        {/* Section Dropdown */}
                        <select
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="All">All Sections</option>
                            {sections.map((s) => (
                                <option key={s.SectionID} value={s.SectionName}>
                                    {s.SectionName}
                                </option>
                            ))}
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
                                <th className="py-3 px-4">STUDENT NUMBER</th>
                                <th className="py-3 px-4">STUDENT</th>
                                <th className="py-3 px-4">COURSE</th>
                                <th className="py-3 px-4">SECTION</th>
                                <th className="py-3 px-4">SCHOOL YEAR</th>
                                <th className="py-3 px-4">YEAR</th>
                                <th className="py-3 px-4">TYPE</th>
                                <th className="py-3 px-4">DATE & TIME</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {paginatedLogs.length > 0 ? (
                                paginatedLogs.map((log, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-slate-50/80 transition"
                                    >
                                        {/* Student Number */}
                                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                                            {log.student?.StudentNumber ?? "—"}
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
                                        {/* School Year */}
                                        <td className="py-3 px-4 text-slate-500">
                                            {log.student?.schoolYear
                                                ?.SchoolYearName ?? "—"}
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
                                        colSpan="8"
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
                {/* PAGINATION FOOTER */}
                <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                    <span>
                        Showing{" "}
                        {filteredLogs.length === 0
                            ? 0
                            : (currentPage - 1) * logsPerPage + 1}
                        -
                        {Math.min(
                            currentPage * logsPerPage,
                            filteredLogs.length,
                        )}{" "}
                        of {filteredLogs.length} records
                    </span>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                            className="px-2 py-1 text-slate-500 font-medium hover:text-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                        >
                            &larr; Prev
                        </button>
                        <button className="w-7 h-7 bg-blue-900 text-white rounded font-bold flex items-center justify-center">
                            {currentPage}
                        </button>
                        <span className="text-slate-400">of {totalPages}</span>
                        <button
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1),
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 text-slate-500 font-medium hover:text-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Next &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
