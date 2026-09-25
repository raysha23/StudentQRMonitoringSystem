import React, { useState, useMemo, useEffect } from "react";
import {
    Clock,
    FileText,
    Search,
    Plus,
    LayoutGrid,
    Edit3,
    Trash2,
    X,
    ChevronDown,
    Barcode,
} from "lucide-react";

import StudentBarcodeModal from "./modals/StudentBarcodeModal";
import StudentFormModal from "./modals/StudentFormModal";
import StudentViewModal from "./modals/StudentViewModal";

import {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
} from "../../api/student-api";
import { getCourses } from "../../api/course-api";
import { getSections } from "../../api/section-api";
import { getSchoolYears } from "../../api/school-year-api";

const emptyForm = {
    StudentNumber: "",
    FirstName: "",
    MiddleName: "",
    LastName: "",
    Suffix: "",
    DateOfBirth: "",
    Gender: "",
    Address: "",
    ContactNumber: "",
    Email: "",
    CourseID: "",
    SectionID: "",
    YearLevel: 1,
    SchoolYearID: "",
    Status: "Enrolled",
};

export default function StudentManagementModule() {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [sections, setSections] = useState([]);
    const [schoolYears, setSchoolYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("All Courses");
    const [selectedYear, setSelectedYear] = useState("All Year Levels");
    const [selectedStatus, setSelectedStatus] = useState("All Status");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [studentsRes, coursesRes, sectionsRes, schoolYearsRes] =
                await Promise.all([
                    getStudents(),
                    getCourses(),
                    getSections(),
                    getSchoolYears(),
                ]);
            setStudents(studentsRes.data);
            setCourses(coursesRes.data);
            setSections(sectionsRes.data);
            setSchoolYears(schoolYearsRes.data);
        } catch (err) {
            setError("Failed to load data. Is the backend running?");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const courseName = (id) =>
        courses.find((c) => c.CourseID === id)?.CourseName || "—";
    const sectionName = (id) =>
        sections.find((s) => s.SectionID === id)?.SectionName || "—";

    const metrics = useMemo(() => {
        const total = students.length;
        const active = students.filter((s) => s.Status === "Enrolled").length;
        const inactive = students.filter((s) => s.Status !== "Enrolled").length;
        return { total, active, inactive };
    }, [students]);

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const fullName =
                `${student.FirstName} ${student.LastName}`.toLowerCase();
            const matchesSearch =
                fullName.includes(searchQuery.toLowerCase()) ||
                student.StudentNumber?.toLowerCase().includes(
                    searchQuery.toLowerCase(),
                ) ||
                student.Email?.toLowerCase().includes(
                    searchQuery.toLowerCase(),
                );

            const matchesCourse =
                selectedCourse === "All Courses" ||
                courseName(student.CourseID) === selectedCourse;
            const matchesYear =
                selectedYear === "All Year Levels" ||
                String(student.YearLevel) === selectedYear;
            const matchesStatus =
                selectedStatus === "All Status" ||
                student.Status === selectedStatus;

            return (
                matchesSearch && matchesCourse && matchesYear && matchesStatus
            );
        });
    }, [
        students,
        searchQuery,
        selectedCourse,
        selectedYear,
        selectedStatus,
        courses,
        sections,
    ]);

    const buildPayload = () => ({
        ...formData,
        MiddleName: formData.MiddleName || null,
        Suffix: formData.Suffix || null,
        DateOfBirth: formData.DateOfBirth || null,
        Gender: formData.Gender || null,
        Address: formData.Address || null,
        CourseID: Number(formData.CourseID),
        SectionID: Number(formData.SectionID),
        YearLevel: Number(formData.YearLevel),
        SchoolYearID: Number(formData.SchoolYearID),
    });

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            const res = await createStudent(buildPayload());
            setStudents([res.data, ...students]);
            setIsAddModalOpen(false);
            resetForm();
        } catch (err) {
            alert("Failed to create student. Check console for details.");
            console.error(err.response?.data || err);
        }
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        try {
            const res = await updateStudent(
                selectedStudent.StudentID,
                buildPayload(),
            );
            setStudents(
                students.map((s) =>
                    s.StudentID === selectedStudent.StudentID ? res.data : s,
                ),
            );
            setIsEditModalOpen(false);
            setSelectedStudent(null);
        } catch (err) {
            alert("Failed to update student. Check console for details.");
            console.error(err.response?.data || err);
        }
    };

    const handleDeleteStudent = async (id) => {
        if (!confirm("Are you sure you want to delete this student record?"))
            return;
        try {
            await deleteStudent(id);
            setStudents(students.filter((s) => s.StudentID !== id));
        } catch (err) {
            alert("Failed to delete student.");
            console.error(err.response?.data || err);
        }
    };

    const openEditModal = (student) => {
        setSelectedStudent(student);
        setFormData({
            StudentNumber: student.StudentNumber,
            FirstName: student.FirstName,
            MiddleName: student.MiddleName || "",
            LastName: student.LastName,
            Suffix: student.Suffix || "",
            DateOfBirth: student.DateOfBirth || "",
            Gender: student.Gender || "",
            Address: student.Address || "",
            CourseID: student.CourseID,
            SectionID: student.SectionID,
            YearLevel: student.YearLevel,
            SchoolYearID: student.SchoolYearID,
            Email: student.Email || "",
            ContactNumber: student.ContactNumber || "",
            Status: student.Status,
        });
        setIsEditModalOpen(true);
    };

    const openViewModal = (student) => {
        setSelectedStudent(student);
        setIsViewModalOpen(true);
    };

    const resetForm = () => setFormData(emptyForm);

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-400 text-sm">
                Loading students...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-rose-500 text-sm">
                {error}
                <button
                    onClick={loadAll}
                    className="block mx-auto mt-3 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">
            <div>
                <h1 className="text-lg font-bold text-slate-800 leading-none">
                    Student Management
                </h1>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                    School Administration
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        TOTAL STUDENTS
                    </p>
                    <p className="text-3xl font-extrabold text-slate-800 mt-2">
                        {metrics.total}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                        ENROLLED
                    </p>
                    <p className="text-3xl font-extrabold text-emerald-500 mt-2">
                        {metrics.active}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        NOT ENROLLED
                    </p>
                    <p className="text-3xl font-extrabold text-slate-700 mt-2">
                        {metrics.inactive}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, student no., or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                    <div className="relative">
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                            <option>All Courses</option>
                            {courses.map((c) => (
                                <option key={c.CourseID}>{c.CourseName}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                            <option>All Year Levels</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                            <option>All Status</option>
                            <option>Enrolled</option>
                            <option>Not Enrolled</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button
                        onClick={() => {
                            resetForm();
                            setIsAddModalOpen(true);
                        }}
                        className="flex items-center space-x-1.5 bg-[#1b2537] hover:bg-[#25324c] text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95 ml-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Student</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="py-4 px-6">STUDENT</th>
                                <th className="py-4 px-4">STUDENT NO.</th>
                                <th className="py-4 px-4">COURSE</th>
                                <th className="py-4 px-4">SECTION</th>
                                <th className="py-4 px-4">YEAR</th>
                                <th className="py-4 px-6">CONTACT</th>
                                <th className="py-4 px-4">STATUS</th>
                                <th className="py-4 px-6 text-right">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr
                                        key={student.StudentID}
                                        className="hover:bg-slate-50/70 transition-colors group"
                                    >
                                        <td className="py-3.5 px-6 font-bold text-slate-800">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        student.ProfilePicture ||
                                                        `https://api.dicebear.com/9.x/initials/svg?seed=${student.FirstName}-${student.LastName}`
                                                    }
                                                    alt={`${student.FirstName} ${student.LastName}`}
                                                    className="w-8 h-8 rounded-full object-cover bg-slate-100"
                                                />
                                                <span>
                                                    {student.FirstName}{" "}
                                                    {student.MiddleName
                                                        ? student.MiddleName.charAt(
                                                              0,
                                                          ) + ". "
                                                        : ""}
                                                    {student.LastName}
                                                    {student.Suffix
                                                        ? ` ${student.Suffix}`
                                                        : ""}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 font-semibold">
                                            {student.StudentNumber}
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-800">
                                            {courseName(student.CourseID)}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                                            {sectionName(student.SectionID)}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                                            {student.YearLevel}
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <div className="text-slate-500 text-[11px] font-medium leading-snug">
                                                <div>{student.Email}</div>
                                                <div className="text-slate-400 text-[10px]">
                                                    {student.ContactNumber}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {student.Status === "Enrolled" ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-100/70 text-emerald-700">
                                                    Enrolled
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500">
                                                    Not Enrolled
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-6 text-right">
                                            <div className="flex items-center justify-end space-x-2 text-slate-400">
                                                <button
                                                    onClick={() =>
                                                        openViewModal(student)
                                                    }
                                                    title="View Details"
                                                    className="p-1 hover:text-slate-600 rounded transition-colors"
                                                >
                                                    <LayoutGrid className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedStudent(
                                                            student,
                                                        );
                                                        setIsBarcodeModalOpen(
                                                            true,
                                                        );
                                                    }}
                                                    title="View Barcode"
                                                    className="p-1 hover:text-slate-800 rounded transition-colors"
                                                >
                                                    <Barcode className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        openEditModal(student)
                                                    }
                                                    title="Edit Student"
                                                    className="p-1 hover:text-blue-600 rounded transition-colors"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteStudent(
                                                            student.StudentID,
                                                        )
                                                    }
                                                    title="Delete Student"
                                                    className="p-1 hover:text-rose-600 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="py-8 text-center text-slate-400"
                                    >
                                        No student records found matching
                                        filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL: ADD STUDENT --- */}
            {isAddModalOpen && (
                <StudentFormModal
                    title="Add New Student"
                    formData={formData}
                    setFormData={setFormData}
                    courses={courses}
                    sections={sections}
                    schoolYears={schoolYears}
                    onSubmit={handleCreateStudent}
                    onClose={() => setIsAddModalOpen(false)}
                    submitLabel="Save Student"
                />
            )}

            {isBarcodeModalOpen && selectedStudent && (
                <StudentBarcodeModal
                    student={selectedStudent}
                    onClose={() => setIsBarcodeModalOpen(false)}
                />
            )}

            {/* --- MODAL: EDIT STUDENT --- */}
            {isEditModalOpen && selectedStudent && (
                <StudentFormModal
                    title={`Edit Student (${selectedStudent.StudentNumber})`}
                    formData={formData}
                    setFormData={setFormData}
                    courses={courses}
                    sections={sections}
                    schoolYears={schoolYears}
                    onSubmit={handleUpdateStudent}
                    onClose={() => setIsEditModalOpen(false)}
                    submitLabel="Update Student"
                />
            )}

            {isViewModalOpen && selectedStudent && (
                <StudentViewModal
                    student={selectedStudent}
                    courseName={courseName}
                    sectionName={sectionName}
                    onClose={() => setIsViewModalOpen(false)}
                />
            )}
        </div>
    );
}

function ScannerPlaceholder({ type }) {
    return (
        <div className="bg-white rounded-xl p-12 border border-slate-100 shadow-sm text-center max-w-xl mx-auto mt-12">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
                {type} Scanner Module
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Connect your RFID / Barcode scanner device to record student
                attendance in real time.
            </p>
            <div className="mt-6 inline-flex items-center space-x-2 bg-slate-100 text-slate-600 text-xs font-medium px-4 py-2 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Awaiting device input...</span>
            </div>
        </div>
    );
}

function ReportPlaceholder() {
    return (
        <div className="bg-white rounded-xl p-12 border border-slate-100 shadow-sm text-center max-w-xl mx-auto mt-12">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
                Report Management
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Generate detailed daily, weekly, or monthly student attendance
                and entry/exit logs.
            </p>
        </div>
    );
}
