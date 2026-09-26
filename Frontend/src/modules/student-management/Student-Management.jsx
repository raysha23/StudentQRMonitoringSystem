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
import StudentFormPage from "./StudentFormPage";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";

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
    ProfilePicture: "",
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

    const [formMode, setFormMode] = useState(null); // null | "add" | "edit"

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 15;

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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCourse, selectedYear, selectedStatus]);

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

    const totalPages = Math.max(
        1,
        Math.ceil(filteredStudents.length / studentsPerPage),
    );

    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * studentsPerPage;
        return filteredStudents.slice(start, start + studentsPerPage);
    }, [filteredStudents, currentPage]);

    const buildFormData = () => {
        const fd = new FormData();
        fd.append("StudentNumber", formData.StudentNumber);
        fd.append("FirstName", formData.FirstName);
        if (formData.MiddleName) fd.append("MiddleName", formData.MiddleName);
        fd.append("LastName", formData.LastName);
        if (formData.Suffix) fd.append("Suffix", formData.Suffix);
        if (formData.DateOfBirth)
            fd.append("DateOfBirth", formData.DateOfBirth);
        if (formData.Gender) fd.append("Gender", formData.Gender);
        if (formData.Address) fd.append("Address", formData.Address);
        fd.append("ContactNumber", formData.ContactNumber || "");
        fd.append("Email", formData.Email || "");
        fd.append("CourseID", Number(formData.CourseID));
        fd.append("SectionID", Number(formData.SectionID));
        fd.append("YearLevel", Number(formData.YearLevel));
        fd.append("SchoolYearID", Number(formData.SchoolYearID));
        fd.append("Status", formData.Status);

        // Only attach a file if the user actually picked a new one
        if (formData.ProfilePictureFile) {
            fd.append("ProfilePicture", formData.ProfilePictureFile);
        }

        return fd;
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            const res = await createStudent(buildFormData());
            setStudents([res.data, ...students]);
            setFormMode(null);
            resetForm();
        } catch (err) {
            alert("Failed to create student. Check console for details.");
            console.error(err.response?.data || err);
        }
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        try {
            const fd = buildFormData();
            fd.append("_method", "PUT"); // Laravel method-spoofing for multipart PUT
            const res = await updateStudent(selectedStudent.StudentID, fd);
            setStudents(
                students.map((s) =>
                    s.StudentID === selectedStudent.StudentID ? res.data : s,
                ),
            );
            setFormMode(null);
            setSelectedStudent(null);
        } catch (err) {
            alert("Failed to update student. Check console for details.");
            console.error(err.response?.data || err);
        }
    };

    const handleDeleteStudent = async () => {
        if (!studentToDelete) return;
        try {
            await deleteStudent(studentToDelete.StudentID);
            setStudents(
                students.filter(
                    (s) => s.StudentID !== studentToDelete.StudentID,
                ),
            );
            setStudentToDelete(null);
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
            ProfilePicture: student.ProfilePictureUrl || "",
            CourseID: student.CourseID,
            SectionID: student.SectionID,
            YearLevel: student.YearLevel,
            SchoolYearID: student.SchoolYearID,
            Email: student.Email || "",
            ContactNumber: student.ContactNumber || "",
            Status: student.Status,
        });
        setFormMode("edit");
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

    if (formMode) {
        return (
            <StudentFormPage
                title={
                    formMode === "add"
                        ? "Add New Student"
                        : `Edit Student (${selectedStudent?.StudentNumber})`
                }
                formData={formData}
                setFormData={setFormData}
                courses={courses}
                sections={sections}
                schoolYears={schoolYears}
                onSubmit={
                    formMode === "add"
                        ? handleCreateStudent
                        : handleUpdateStudent
                }
                onClose={() => {
                    setFormMode(null);
                    setSelectedStudent(null);
                    resetForm();
                }}
                submitLabel={
                    formMode === "add" ? "Save Student" : "Update Student"
                }
            />
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        TOTAL STUDENTS
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
                        {metrics.total}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                        ENROLLED
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-emerald-500 mt-2">
                        {metrics.active}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        NOT ENROLLED
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-700 mt-2">
                        {metrics.inactive}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3 w-full lg:w-auto">
                    <div className="relative">
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors truncate"
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
                            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors truncate"
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
                            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors truncate"
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
                            setFormMode("add");
                        }}
                        className="flex items-center justify-center space-x-1.5 bg-[#1b2537] hover:bg-[#25324c] text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Student</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="py-4 px-6">STUDENT</th>
                                <th className="py-4 px-4">STUDENT NO.</th>
                                <th className="py-4 px-4">COURSE</th>
                                <th className="py-4 px-4">SECTION</th>
                                <th className="py-4 px-4">YEAR</th>
                                <th className="py-4 px-6">CONTACT</th>
                                <th className="py-4 px-6">ADDRESS</th>
                                <th className="py-4 px-6">EMAIL</th>
                                <th className="py-4 px-4">STATUS</th>
                                <th className="py-4 px-6 text-right">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {paginatedStudents.length > 0 ? (
                                paginatedStudents.map((student) => (
                                    <tr
                                        key={student.StudentID}
                                        className="hover:bg-slate-50/70 transition-colors group"
                                    >
                                        <td className="py-3.5 px-6 font-bold text-slate-800">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        student.ProfilePictureUrl ||
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
                                        <td className="py-3.5 px-6 text-slate-500 text-[11px] font-medium">
                                            {student.ContactNumber || "—"}
                                        </td>
                                        <td
                                            className="py-3.5 px-6 text-slate-500 text-[11px] font-medium"
                                            title={student.Address}
                                        >
                                            {student.Address || "—"}
                                        </td>
                                        <td className="py-3.5 px-6 text-slate-500 text-[11px] font-medium">
                                            {student.Email || "—"}
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
                                                        setStudentToDelete(
                                                            student,
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

                {filteredStudents.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100">
                        <p className="text-[11px] text-slate-400 font-medium">
                            Showing {(currentPage - 1) * studentsPerPage + 1}–
                            {Math.min(
                                currentPage * studentsPerPage,
                                filteredStudents.length,
                            )}{" "}
                            of {filteredStudents.length}
                        </p>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                            >
                                Previous
                            </button>

                            <span className="px-2 text-xs font-semibold text-slate-500 whitespace-nowrap">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1),
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isBarcodeModalOpen && selectedStudent && (
                <StudentBarcodeModal
                    student={selectedStudent}
                    onClose={() => setIsBarcodeModalOpen(false)}
                />
            )}

            {studentToDelete && (
                <DeleteConfirmModal
                    title="Delete Student"
                    message={`Are you sure you want to delete ${studentToDelete.FirstName} ${studentToDelete.LastName}? This action cannot be undone.`}
                    onConfirm={handleDeleteStudent}
                    onClose={() => setStudentToDelete(null)}
                />
            )}
        </div>
    );
}
