// File Path: Frontend\src\modules\report\Report-Management.jsx

import React, { useState, useMemo, useEffect } from "react";
import { Search, Download, Filter } from "lucide-react";

import { getPersonLogs, exportPersonLogs } from "../../api/person-log-api";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { getCourses } from "../../api/course-api";
import { getSchoolYears } from "../../api/school-year-api";
import { getSections } from "../../api/section-api";
import { formatLogDateTime } from "../../utils/global-helper";
import { exportLogsToExcel } from "../../utils/csv-export";

import {
    departmentsApi,
    positionsApi,
} from "../../api/academic-management-api";

// Flattens a log's student/employee into one shape the table can use
const getPerson = (log) => {
    if (log.student) {
        const s = log.student;
        return {
            type: "Student",
            number: s.StudentNumber,
            name: `${s.FirstName ?? ""} ${s.LastName ?? ""}`.trim(),
            picture: s.ProfilePictureUrl,
            group: s.course?.CourseName,
            subgroup: s.section?.SectionName,
            schoolYear: s.schoolYear?.SchoolYearName,
            year: s.YearLevel,
            department: null,
            position: null,
        };
    }
    if (log.employee) {
        const e = log.employee;
        return {
            type: "Employee",
            number: e.EmployeeNo,
            name: e.FullName ?? "",
            picture: e.ProfilePictureUrl,
            group: e.department?.DepartmentName,
            subgroup: e.position?.PositionTitle,
            schoolYear: null,
            year: null,
            department: e.department?.DepartmentName,
            position: e.position?.PositionTitle,
        };
    }
    return {
        type: log.PersonType ?? "—",
        number: null,
        name: "",
        picture: null,
        group: null,
        subgroup: null,
        schoolYear: null,
        year: null,
        department: null,
        position: null,
    };
};

const selectCls =
    "w-full lg:shrink-0 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

export default function ReportManagement() {
    const [courses, setCourses] = useState([]);
    const [schoolYears, setSchoolYears] = useState([]);
    const [sections, setSections] = useState([]);

    const todayString = new Date().toISOString().split("T")[0];
    const [fromDate, setFromDate] = useState(todayString);
    const [toDate, setToDate] = useState(todayString);

    // "" means "All" for every dropdown. Course/section/etc. hold IDs.
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedPersonType, setSelectedPersonType] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedSchoolYear, setSelectedSchoolYear] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedPosition, setSelectedPosition] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 15;

    const { data: departments = [] } = useQuery({
        queryKey: departmentsApi.key,
        queryFn: departmentsApi.list,
    });
    const { data: positions = [] } = useQuery({
        queryKey: positionsApi.key,
        queryFn: positionsApi.list,
    });

    useEffect(() => {
        loadFilters();
    }, []);

    // Wait until the user stops typing before hitting the server
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

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

    // Filters sent to the backend (undefined values are not sent)
    const filterParams = {
        from: fromDate,
        to: toDate,
        search: debouncedSearch || undefined,
        person_type: selectedPersonType || undefined,
        log_type: selectedType || undefined,
        course_id: selectedCourse || undefined,
        section_id: selectedSection || undefined,
        school_year_id: selectedSchoolYear || undefined,
        department_id: selectedDepartment || undefined,
        position_id: selectedPosition || undefined,
    };

    const params = {
        ...filterParams,
        page: currentPage,
        per_page: logsPerPage,
    };

    const {
        data,
        isLoading: loading,
        isFetching,
        error: queryError,
    } = useQuery({
        queryKey: ["person-logs", params],
        queryFn: async () => (await getPersonLogs(params)).data,
        placeholderData: keepPreviousData, // keeps the old page visible while the next loads
        staleTime: 0, // logs are live, always refetch
    });

    const error = queryError
        ? queryError.response?.data?.message ||
          "Failed to load logs. Is the backend running?"
        : null;

    // Attach the flattened person to this page's rows
    const personLogs = useMemo(
        () =>
            (data?.data ?? []).map((log) => ({
                ...log,
                person: getPerson(log),
            })),
        [data],
    );
    const paginatedLogs = personLogs;

    const totalRecords = data?.total ?? 0;
    const totalPages = Math.max(1, data?.last_page ?? 1);
    const totalTimeIn = data?.stats?.time_in ?? 0;
    const totalTimeOut = data?.stats?.time_out ?? 0;

    // Sets a filter and goes back to page 1 in the same render (one request)
    const pick = (setter) => (e) => {
        setter(e.target.value);
        setCurrentPage(1);
    };

    const handlePersonTypeChange = (value) => {
        setSelectedPersonType(value);
        setCurrentPage(1);

        // Student-only filters reset unless "Student" is chosen
        if (value !== "Student") {
            setSelectedCourse("");
            setSelectedSection("");
            setSelectedSchoolYear("");
        }

        // Employee-only filters reset unless "Employee" is chosen
        if (value !== "Employee") {
            setSelectedDepartment("");
            setSelectedPosition("");
        }
    };

    // Export: asks the backend for ALL rows matching the current filters
    const handleExportCSV = async () => {
        const { data: rows } = await exportPersonLogs(filterParams);
        await exportLogsToExcel(
            rows.map((log) => ({ ...log, person: getPerson(log) })),
            fromDate,
            toDate,
        );
    };

    // Student filters work only when "Students" is chosen,
    // employee filters only when "Employees" is chosen
    const studentFiltersDisabled = selectedPersonType !== "Student";
    const employeeFiltersDisabled = selectedPersonType !== "Employee";

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
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        TOTAL RECORDS
                    </p>
                    <h2 className="text-3xl font-bold text-slate-800 mt-1">
                        {totalRecords}
                    </h2>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                        TIME IN
                    </p>
                    <h2 className="text-3xl font-bold text-blue-600 mt-1">
                        {totalTimeIn}
                    </h2>
                </div>

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
            <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs space-y-2.5 sm:space-y-3">
                <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>FILTER RECORDS</span>
                </div>

                <div className="flex flex-col gap-2.5 sm:gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-nowrap lg:items-center gap-2 sm:gap-2.5 lg:gap-2 overflow-x-auto lg:pb-1">
                        {/* Date From */}
                        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs lg:shrink-0">
                            <span className="text-slate-400 shrink-0">
                                From
                            </span>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={pick(setFromDate)}
                                className="w-full lg:w-28 bg-transparent border-none text-slate-700 font-medium focus:outline-none cursor-pointer"
                            />
                        </div>

                        {/* Date To */}
                        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs lg:shrink-0">
                            <span className="text-slate-400 shrink-0">To</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={pick(setToDate)}
                                className="w-full lg:w-28 bg-transparent border-none text-slate-700 font-medium focus:outline-none cursor-pointer"
                            />
                        </div>

                        {/* Search Input */}
                        <div className="relative sm:col-span-2 lg:col-span-1 lg:shrink-0">
                            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search name or ID..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full lg:w-40 pl-8 sm:pl-9 pr-3 py-1 sm:py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] sm:text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Log Type Dropdown */}
                        <select
                            value={selectedType}
                            onChange={pick(setSelectedType)}
                            className={`${selectCls} lg:w-28`}
                        >
                            <option value="">All Types</option>
                            <option value="TIME IN">TIME IN</option>
                            <option value="TIME OUT">TIME OUT</option>
                        </select>

                        {/* Person Dropdown */}
                        <select
                            value={selectedPersonType}
                            onChange={(e) =>
                                handlePersonTypeChange(e.target.value)
                            }
                            className={`${selectCls} lg:w-28`}
                        >
                            <option value="">All People</option>
                            <option value="Student">Students</option>
                            <option value="Employee">Employees</option>
                        </select>

                        {/* Department Dropdown (employees only) */}
                        <select
                            value={selectedDepartment}
                            onChange={pick(setSelectedDepartment)}
                            disabled={employeeFiltersDisabled}
                            className={`${selectCls} lg:w-32`}
                        >
                            <option value="">All Departments</option>
                            {departments.map((d) => (
                                <option
                                    key={d.DepartmentID}
                                    value={d.DepartmentID}
                                >
                                    {d.DepartmentName}
                                </option>
                            ))}
                        </select>

                        {/* Position Dropdown (employees only) */}
                        <select
                            value={selectedPosition}
                            onChange={pick(setSelectedPosition)}
                            disabled={employeeFiltersDisabled}
                            className={`${selectCls} lg:w-28`}
                        >
                            <option value="">All Positions</option>
                            {positions.map((p) => (
                                <option key={p.PositionID} value={p.PositionID}>
                                    {p.PositionTitle}
                                </option>
                            ))}
                        </select>

                        {/* Course Dropdown (students only) */}
                        <select
                            value={selectedCourse}
                            onChange={pick(setSelectedCourse)}
                            disabled={studentFiltersDisabled}
                            className={`${selectCls} lg:w-28`}
                        >
                            <option value="">All Courses</option>
                            {courses.map((c) => (
                                <option key={c.CourseID} value={c.CourseID}>
                                    {c.CourseCode}
                                </option>
                            ))}
                        </select>

                        {/* School Year Dropdown (students only) */}
                        <select
                            value={selectedSchoolYear}
                            onChange={pick(setSelectedSchoolYear)}
                            disabled={studentFiltersDisabled}
                            className={`${selectCls} lg:w-32`}
                        >
                            <option value="">All School Years</option>
                            {schoolYears.map((sy) => (
                                <option
                                    key={sy.SchoolYearID}
                                    value={sy.SchoolYearID}
                                >
                                    {sy.SchoolYearName}
                                </option>
                            ))}
                        </select>

                        {/* Section Dropdown (students only) */}
                        <select
                            value={selectedSection}
                            onChange={pick(setSelectedSection)}
                            disabled={studentFiltersDisabled}
                            className={`${selectCls} lg:w-28`}
                        >
                            <option value="">All Sections</option>
                            {sections.map((s) => (
                                <option key={s.SectionID} value={s.SectionID}>
                                    {s.SectionName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Right Side: Export Button */}
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] sm:text-xs px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg transition shadow-xs w-full lg:w-auto lg:shrink-0"
                    >
                        <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl px-4 py-3">
                    {error}
                </div>
            )}

            {/* LOGS TABLE */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div
                    className={`overflow-x-auto transition-opacity ${isFetching ? "opacity-60" : ""}`}
                >
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                <th className="py-3 px-4">ID NUMBER</th>
                                <th className="py-3 px-4">NAME</th>
                                <th className="py-3 px-4">PERSON</th>
                                <th className="py-3 px-4">COURSE / DEPT</th>
                                <th className="py-3 px-4">
                                    SECTION / POSITION
                                </th>
                                <th className="py-3 px-4">SCHOOL YEAR</th>
                                <th className="py-3 px-4">YEAR</th>
                                <th className="py-3 px-4">TYPE</th>
                                <th className="py-3 px-4">DATE & TIME</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="py-8 text-center text-slate-400 text-xs"
                                    >
                                        Loading records...
                                    </td>
                                </tr>
                            ) : paginatedLogs.length > 0 ? (
                                paginatedLogs.map((log) => {
                                    const p = log.person;
                                    return (
                                        <tr
                                            key={log.LogID}
                                            className="hover:bg-slate-50/80 transition"
                                        >
                                            <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                                                {p.number ?? "—"}
                                            </td>

                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={
                                                            p.picture ||
                                                            `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(p.name)}`
                                                        }
                                                        alt={p.name}
                                                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                                    />
                                                    <p className="font-bold text-slate-800 leading-tight">
                                                        {p.name || "—"}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="py-3 px-4">
                                                {p.type === "Employee" ? (
                                                    <span className="inline-block bg-purple-50 text-purple-600 border border-purple-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                                                        Employee
                                                    </span>
                                                ) : (
                                                    <span className="inline-block bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                                                        {p.type}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3 px-4 font-bold text-slate-800">
                                                {p.group ?? "—"}
                                            </td>

                                            <td className="py-3 px-4 text-slate-500">
                                                {p.subgroup ?? "—"}
                                            </td>

                                            <td className="py-3 px-4 text-slate-500">
                                                {p.schoolYear ?? "—"}
                                            </td>

                                            <td className="py-3 px-4 text-slate-500">
                                                {p.year ?? "—"}
                                            </td>

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

                                            <td className="py-3 px-4 font-medium text-slate-500 whitespace-nowrap">
                                                {formatLogDateTime(
                                                    log.ScannedAt,
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan="9"
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
                <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                    <span>
                        Showing{" "}
                        {totalRecords === 0
                            ? 0
                            : (currentPage - 1) * logsPerPage + 1}
                        -{Math.min(currentPage * logsPerPage, totalRecords)} of{" "}
                        {totalRecords} records
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
