import {
    useQuery,
    useQueryClient,
    keepPreviousData,
} from "@tanstack/react-query";
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
    RotateCcw,
} from "lucide-react";

import BarCodeModal from "../../utils/general-modal/BarCodeModal";
import StudentFormPage from "./StudentFormPage";

import DeleteConfirmationModal from "../../utils/general-modal/DeleteConfirmationModal";
import RestoreConfirmationModal from "../../utils/general-modal/RestoreConfirmationModal";
import {
    getStudents,
    getStudentCounts,
    createStudent,
    updateStudent,
    deleteStudent,
    restoreStudent,
} from "../../api/student-api";
import {
    programsApi,
    sectionsApi,
    schoolYearsApi,
} from "../../api/academic-management-api";

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
    const queryClient = useQueryClient();

    // "" means "All" for every filter. Course holds the CourseID.
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    const [formMode, setFormMode] = useState(null); // null | "add" | "edit"

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
    const [viewingPhotoStudent, setViewingPhotoStudent] = useState(null);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [studentToRestore, setStudentToRestore] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 15;

    const { data: courses = [] } = useQuery({
        queryKey: programsApi.key,
        queryFn: programsApi.list,
    });
    const { data: sections = [] } = useQuery({
        queryKey: sectionsApi.key,
        queryFn: sectionsApi.list,
    });
    const { data: schoolYears = [] } = useQuery({
        queryKey: schoolYearsApi.key,
        queryFn: schoolYearsApi.list,
    });

    // Wait until the user stops typing before hitting the server
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const params = {
        page: currentPage,
        per_page: studentsPerPage,
        search: debouncedSearch || undefined,
        course_id: selectedCourse || undefined,
        year_level: selectedYear || undefined,
        status: selectedStatus || undefined,
    };

    const {
        data,
        isLoading: loading,
        isFetching,
        error: queryError,
        refetch,
    } = useQuery({
        queryKey: ["students", params],
        queryFn: async () => (await getStudents(params)).data,
        placeholderData: keepPreviousData,
    });

    const { data: studentCountsData } = useQuery({
        queryKey: ["student-counts"],
        queryFn: async () => (await getStudentCounts()).data,
    });

    const students = data?.data ?? [];
    const totalRecords = data?.total ?? 0;
    const totalPages = Math.max(1, data?.last_page ?? 1);
    const metrics = {
        total: studentCountsData?.total ?? data?.stats?.total ?? 0,
        active: studentCountsData?.enrolled ?? data?.stats?.enrolled ?? 0,
        inactive: studentCountsData?.not_enrolled ?? data?.stats?.not_enrolled ?? 0,
    };

    const error = queryError
        ? queryError.response?.data?.message ||
          "Failed to load data. Is the backend running?"
        : null;

    const refreshStudents = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["students"] }),
            queryClient.invalidateQueries({ queryKey: ["student-counts"] }),
        ]);
    };

    // Sets a filter and goes back to page 1 in the same update (one request)
    const pick = (setter) => (e) => {
        setter(e.target.value);
        setCurrentPage(1);
    };

    const courseName = (id) =>
        courses.find((c) => Number(c.CourseID) === Number(id))?.CourseName ||
        "—";
    const sectionName = (id) =>
        sections.find((s) => Number(s.SectionID) === Number(id))?.SectionName ||
        "—";

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
            await createStudent(buildFormData());
            setCurrentPage(1); // newest students are on page 1
            await refreshStudents();
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
            await updateStudent(selectedStudent.StudentID, fd);
            await refreshStudents();
            setFormMode(null);
            setSelectedStudent(null);
        } catch (err) {
            alert("Failed to update student. Check console for details.");
            console.error(err.response?.data || err);
        }
    };

    const handleDeleteStudent = async () => {
        if (!studentToDelete) return;
        await deleteStudent(studentToDelete.StudentID);
        setStudentToDelete(null);
        if (students.length === 1 && currentPage > 1) {
            setCurrentPage((p) => p - 1);
        }
        await refreshStudents();
    };

    const handleRestoreStudent = async () => {
        if (!studentToRestore) return;
        await restoreStudent(studentToRestore.StudentID);
        setStudentToRestore(null);
        await refreshStudents();
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
            <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
                <div className="p-8 text-center text-slate-400 text-sm">
                    Loading students...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
                <div className="p-8 text-center text-rose-500 text-sm">
                    {error}
                    <button
                        onClick={() => refetch()}
                        className="block mx-auto mt-3 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs"
                    >
                        Retry
                    </button>
                </div>
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
        <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans space-y-6">
            <div className="max-w-[1400px] mx-auto space-y-6">
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
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3 w-full lg:w-auto">
                        <div className="relative">
                            <select
                                value={selectedCourse}
                                onChange={pick(setSelectedCourse)}
                                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors truncate"
                            >
                                <option value="">All Courses</option>
                                {courses.map((c) => (
                                    <option key={c.CourseID} value={c.CourseID}>
                                        {c.CourseName}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                value={selectedYear}
                                onChange={pick(setSelectedYear)}
                                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors truncate"
                            >
                                <option value="">All Year Levels</option>
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
                                onChange={pick(setSelectedStatus)}
                                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors truncate"
                            >
                                <option value="">All Status</option>
                                <option value="Enrolled">Enrolled</option>
                                <option value="Not Enrolled">
                                    Not Enrolled
                                </option>
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
                    <div
                        className={`overflow-x-auto transition-opacity ${isFetching ? "opacity-60" : ""}`}
                    >
                        <table className="w-full min-w-max text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="py-4 px-6 min-w-[240px]">
                                        STUDENT
                                    </th>
                                    <th className="py-4 px-4 min-w-[130px]">
                                        STUDENT NO.
                                    </th>
                                    <th className="py-4 px-4 min-w-[200px]">
                                        PROGRAM
                                    </th>
                                    <th className="py-4 px-4 min-w-[120px]">
                                        SECTION
                                    </th>
                                    <th className="py-4 px-4 min-w-[80px]">
                                        YEAR
                                    </th>
                                    <th className="py-4 px-6 min-w-[140px]">
                                        CONTACT
                                    </th>
                                    <th className="py-4 px-6 min-w-[220px]">
                                        ADDRESS
                                    </th>
                                    <th className="py-4 px-6 min-w-[220px]">
                                        EMAIL
                                    </th>
                                    <th className="py-4 px-4 min-w-[120px]">
                                        STATUS
                                    </th>
                                    <th className="py-4 px-6 min-w-[130px] text-right">
                                        ACTIONS
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {students.length > 0 ? (
                                    students.map((student) => (
                                        <tr
                                            key={student.StudentID}
                                            className="hover:bg-slate-50/70 transition-colors group"
                                        >
                                            <td className="py-3.5 px-6 font-bold text-slate-800">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setViewingPhotoStudent(
                                                                student,
                                                            )
                                                        }
                                                        className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-300"
                                                        title="View photo"
                                                    >
                                                        <img
                                                            src={
                                                                student.ProfilePictureUrl ||
                                                                `https://api.dicebear.com/9.x/initials/svg?seed=${student.FirstName}-${student.LastName}`
                                                            }
                                                            alt={`${student.FirstName} ${student.LastName}`}
                                                            className="w-8 h-8 rounded-full object-cover bg-slate-100 cursor-pointer hover:opacity-80 transition-opacity"
                                                        />
                                                    </button>
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
                                                {student.Status ===
                                                "Enrolled" ? (
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
                                                        className="p-1 hover:text-slate-800 rounded transition-colors cursor-pointer"
                                                    >
                                                        <Barcode className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            openEditModal(
                                                                student,
                                                            )
                                                        }
                                                        title="Edit Student"
                                                        className="p-1 hover:text-blue-600 rounded transition-colors"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    {student.Status === "Enrolled" ? (
                                                        <button
                                                            onClick={() =>
                                                                setStudentToDelete(
                                                                    student,
                                                                )
                                                            }
                                                            title="Mark Not Enrolled"
                                                            className="p-1 hover:text-rose-600 rounded transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                setStudentToRestore(
                                                                    student,
                                                                )
                                                            }
                                                            title="Restore Student"
                                                            className="p-1 hover:text-emerald-600 rounded transition-colors"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="10"
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

                    {totalRecords > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100">
                            <p className="text-[11px] text-slate-400 font-medium">
                                Showing{" "}
                                {(currentPage - 1) * studentsPerPage + 1}–
                                {Math.min(
                                    currentPage * studentsPerPage,
                                    totalRecords,
                                )}{" "}
                                of {totalRecords}
                            </p>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.max(1, p - 1),
                                        )
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
                    <BarCodeModal
                        type="student"
                        person={selectedStudent}
                        onClose={() => setIsBarcodeModalOpen(false)}
                    />
                )}
                {studentToDelete && (
                    <DeleteConfirmationModal
                        title="Mark Student as Not Enrolled"
                        message={`Are you sure you want to set ${studentToDelete.FirstName} ${studentToDelete.LastName} to Not Enrolled? You can restore them later from the status filter.`}
                        confirmLabel="Mark Not Enrolled"
                        onConfirm={handleDeleteStudent}
                        onClose={() => setStudentToDelete(null)}
                    />
                )}
                {studentToRestore && (
                    <RestoreConfirmationModal
                        title="Restore Student"
                        message={`Set ${studentToRestore.FirstName} ${studentToRestore.LastName} back to Enrolled? They will appear in the active student list again.`}
                        confirmLabel="Restore"
                        onConfirm={handleRestoreStudent}
                        onClose={() => setStudentToRestore(null)}
                    />
                )}
                {viewingPhotoStudent && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                        onClick={() => setViewingPhotoStudent(null)}
                    >
                        <div
                            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setViewingPhotoStudent(null)}
                                className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 transition-colors"
                                title="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <img
                                src={
                                    viewingPhotoStudent.ProfilePictureUrl ||
                                    `https://api.dicebear.com/9.x/initials/svg?seed=${viewingPhotoStudent.FirstName}-${viewingPhotoStudent.LastName}`
                                }
                                alt={`${viewingPhotoStudent.FirstName} ${viewingPhotoStudent.LastName}`}
                                className="w-full aspect-square rounded-lg object-cover bg-slate-100 mb-4"
                            />

                            <p className="text-sm font-bold text-slate-800 text-center">
                                {viewingPhotoStudent.FirstName}{" "}
                                {viewingPhotoStudent.LastName}
                            </p>
                            <p className="text-xs text-slate-400 text-center font-medium mt-0.5">
                                {viewingPhotoStudent.StudentNumber}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
