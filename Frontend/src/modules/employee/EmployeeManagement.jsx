// File Path: Frontend\src\modules\employee\EmployeeManagement.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Users,
    UserCheck,
    GraduationCap,
    Barcode,
    X,
    RotateCcw,
} from "lucide-react";
import {
    getEmployees,
    getEmployeeCounts,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    restoreEmployee,
} from "../../api/employee-api";
import {
    positionsApi,
    departmentsApi,
    getErrorMessage,
} from "../../api/academic-management-api";
import BarCodeModal from "../../utils/general-modal/BarCodeModal";
import DeleteConfirmationModal from "../../utils/general-modal/DeleteConfirmationModal";
import EmployeeFormPage from "./EmployeeFormPage";
import RestoreConfirmationModal from "../../utils/general-modal/RestoreConfirmationModal";

const EMPTY_FORM = {
    EmployeeNo: "",
    FirstName: "",
    MiddleName: "",
    LastName: "",
    PositionID: "",
    DepartmentID: "",
    Email: "",
    Phone: "",
    Status: "Active",
    ProfilePicture: "", // preview URL (saved photo or a temporary blob)
    OriginalPicture: "", // the saved photo, so "Undo new photo" can restore it
    ProfilePictureFile: null, // the real File to upload, only set when a new one is picked
};

const avatarFor = (emp) =>
    emp.ProfilePictureUrl ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(emp.FullName)}`;

export default function EmployeeManagement() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPosition, setSelectedPosition] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const employeesPerPage = 15;
    // Form page state
    const [formMode, setFormMode] = useState(null); // null | 'add' | 'edit'
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    const [barcodeEmployee, setBarcodeEmployee] = useState(null);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [viewingPhotoEmployee, setViewingPhotoEmployee] = useState(null);
    const queryClient = useQueryClient();

    const [statusFilter, setStatusFilter] = useState("Active");
    const [restoringId, setRestoringId] = useState(null);
    const [employeeToRestore, setEmployeeToRestore] = useState(null);
    const {
        data: employees = [],
        isLoading: loading,
        error: queryError,
    } = useQuery({
        queryKey: ["employees", statusFilter],
        queryFn: () => getEmployees(statusFilter),
    });

    const { data: counts } = useQuery({
        queryKey: ["employee-counts"],
        queryFn: getEmployeeCounts,
    });

    const { data: positions = [] } = useQuery({
        queryKey: positionsApi.key,
        queryFn: positionsApi.list,
    });
    const { data: departments = [] } = useQuery({
        queryKey: departmentsApi.key,
        queryFn: departmentsApi.list,
    });

    const error = queryError
        ? getErrorMessage(queryError, "Failed to load personnel.")
        : null;

    // Invalidates every status variant plus the counts
    const refreshEmployees = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["employees"] }),
            queryClient.invalidateQueries({ queryKey: ["employee-counts"] }),
        ]);
    };

    const confirmRestoreEmployee = async () => {
        await restoreEmployee(employeeToRestore.EmployeeID); // throws on failure, the modal shows it
        setEmployeeToRestore(null);
        await refreshEmployees();
    };
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedPosition, statusFilter]);

    // Filtered dataset
    const filteredEmployees = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return employees.filter((emp) => {
            const matchesSearch =
                emp.FullName.toLowerCase().includes(q) ||
                emp.EmployeeNo.toLowerCase().includes(q) ||
                emp.Email.toLowerCase().includes(q) ||
                (emp.position?.department?.DepartmentName ?? "")
                    .toLowerCase()
                    .includes(q);

            const matchesPosition =
                selectedPosition === "All" ||
                String(emp.PositionID) === selectedPosition;

            return matchesSearch && matchesPosition;
        });
    }, [employees, searchQuery, selectedPosition]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredEmployees.length / employeesPerPage),
    );

    const paginatedEmployees = useMemo(() => {
        const start = (currentPage - 1) * employeesPerPage;
        return filteredEmployees.slice(start, start + employeesPerPage);
    }, [filteredEmployees, currentPage]);

    // Statistics
    const totalPersonnel = counts?.total ?? 0;
    const activePersonnel = counts?.active ?? 0;
    const inactivePersonnel = counts?.inactive ?? 0;
    const facultyMembers = counts?.faculty ?? 0;

    // Positions offered in the form: active ones, plus the employee's current one when editing
    const positionOptions = positions.filter(
        (p) =>
            p.Status === "Active" ||
            (formMode === "edit" &&
                p.PositionID === selectedEmployee?.PositionID),
    );
    // Active departments, plus the employee's current one when editing
    const departmentOptions = departments.filter(
        (d) =>
            d.Status === "Active" ||
            (formMode === "edit" &&
                d.DepartmentID === selectedEmployee?.position?.DepartmentID),
    );
    /* ---------------- Form handlers ---------------- */

    const openAdd = () => {
        setFormData({ ...EMPTY_FORM });
        setFormError(null);
        setSelectedEmployee(null);
        setFormMode("add");
    };
    const openEdit = (emp) => {
        setFormData({
            EmployeeNo: emp.EmployeeNo,
            FirstName: emp.FirstName,
            MiddleName: emp.MiddleName ?? "",
            LastName: emp.LastName,
            PositionID: emp.PositionID,
            DepartmentID: emp.position?.DepartmentID ?? "",
            Email: emp.Email,
            Phone: emp.Phone ?? "",
            Status: emp.Status,
            ProfilePicture: emp.ProfilePictureUrl ?? "",
            OriginalPicture: emp.ProfilePictureUrl ?? "",
            ProfilePictureFile: null,
        });
        setFormError(null);
        setSelectedEmployee(emp);
        setFormMode("edit");
    };

    const closeForm = () => {
        if (formData.ProfilePicture?.startsWith("blob:")) {
            URL.revokeObjectURL(formData.ProfilePicture);
        }
        setFormMode(null);
        setSelectedEmployee(null);
        setFormData(EMPTY_FORM);
        setFormError(null);
    };

    const buildFormData = () => {
        const fd = new FormData();
        fd.append("FirstName", formData.FirstName.trim());
        fd.append("MiddleName", formData.MiddleName.trim()); // empty becomes null on the server
        fd.append("LastName", formData.LastName.trim());
        fd.append("PositionID", formData.PositionID);
        fd.append("Email", formData.Email.trim());
        fd.append("Phone", formData.Phone);

        // Only attach a file if a new one was actually picked
        if (formData.ProfilePictureFile) {
            fd.append("ProfilePicture", formData.ProfilePictureFile);
        }
        return fd;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError(null);

        try {
            if (formMode === "edit") {
                await updateEmployee(
                    selectedEmployee.EmployeeID,
                    buildFormData(),
                );
            } else {
                await createEmployee(buildFormData());
            }
            closeForm();
            await refreshEmployees();
        } catch (err) {
            setFormError(getErrorMessage(err, "Failed to save employee."));
        } finally {
            setSaving(false);
        }
    };

    const confirmDeleteEmployee = async () => {
        await deleteEmployee(employeeToDelete.EmployeeID); // throws on failure, the modal shows it
        setEmployeeToDelete(null);
        await refreshEmployees();
    };

    const today = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const employeeTypeLabel = (emp) =>
        emp.position?.department?.DepartmentType === "Teaching"
            ? "Teaching"
            : "Non Teaching";

    /* ---------------- Form page view ---------------- */

    if (formMode) {
        return (
            <EmployeeFormPage
                title={
                    formMode === "add"
                        ? "Add New Employee"
                        : `Edit Employee (${selectedEmployee?.EmployeeNo})`
                }
                mode={formMode}
                formData={formData}
                setFormData={setFormData}
                positions={positionOptions}
                departments={departmentOptions}
                saving={saving}
                serverError={formError}
                onSubmit={handleSubmit}
                onClose={closeForm}
                submitLabel={
                    formMode === "add" ? "Save Employee" : "Update Employee"
                }
            />
        );
    }

    /* ---------------- Directory view ---------------- */

    return (
        <div className="bg-slate-50 min-h-screen p-6 font-sans text-slate-800 space-y-6">
            {/* HEADER BAR */}
            <div className="flex items-center justify-between pb-2">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        Personnel Management
                    </h1>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {today} · School Administration
                    </p>
                </div>
            </div>

            {/* SUMMARY CARDS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                            <Users className="w-5 h-5" />
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            TOTAL PERSONNEL
                        </p>
                        <h2 className="text-3xl font-extrabold text-slate-900">
                            {totalPersonnel}
                        </h2>
                        <p className="text-[11px] text-slate-400 pt-1">
                            All employee records
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            ACTIVE PERSONNEL
                        </p>
                        <h2 className="text-3xl font-extrabold text-slate-900">
                            {activePersonnel}
                        </h2>
                        <p className="text-[11px] text-slate-400 pt-1">
                            {inactivePersonnel} currently inactive
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            FACULTY MEMBERS
                        </p>
                        <h2 className="text-3xl font-extrabold text-slate-900">
                            {facultyMembers}
                        </h2>
                        <p className="text-[11px] text-slate-400 pt-1">
                            Teaching staff
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl px-4 py-3">
                    {error}
                </div>
            )}

            {/* PERSONNEL DIRECTORY TABLE CONTAINER */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                {/* DIRECTORY HEADER & CONTROLS */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-base font-extrabold text-slate-800 tracking-tight">
                            Personnel Directory
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Manage employees, assignments, and employment status
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search personnel..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                            />
                        </div>

                        <select
                            value={selectedPosition}
                            onChange={(e) =>
                                setSelectedPosition(e.target.value)
                            }
                            className="bg-white border-2 border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                        >
                            <option value="All">All Positions</option>
                            {positions.map((p) => (
                                <option
                                    key={p.PositionID}
                                    value={String(p.PositionID)}
                                >
                                    {p.PositionTitle}
                                    {p.department
                                        ? ` · ${p.department.DepartmentName}`
                                        : ""}
                                </option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border-2 border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="All">All Status</option>
                        </select>
                        <button
                            onClick={openAdd}
                            className="inline-flex items-center space-x-1.5 bg-[#1a365d] hover:bg-[#122744] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Employee</span>
                        </button>
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                <th className="py-3.5 px-6 min-w-[260px]">
                                    EMPLOYEE
                                </th>
                                <th className="py-3.5 px-6 min-w-[160px]">
                                    POSITION
                                </th>
                                <th className="py-3.5 px-6 min-w-[180px]">
                                    DEPARTMENT
                                </th>
                                <th className="py-3.5 px-6 min-w-[140px]">
                                    TYPE
                                </th>
                                <th className="py-3.5 px-6 min-w-[240px]">
                                    CONTACT
                                </th>
                                <th className="py-3.5 px-6 min-w-[110px]">
                                    STATUS
                                </th>
                                <th className="py-3.5 px-6 min-w-[130px] text-right">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="py-8 text-center text-slate-400 text-xs"
                                    >
                                        Loading personnel...
                                    </td>
                                </tr>
                            ) : paginatedEmployees.length > 0 ? (
                                paginatedEmployees.map((emp) => (
                                    <tr
                                        key={emp.EmployeeID}
                                        className="hover:bg-slate-50/80 transition"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setViewingPhotoEmployee(
                                                            emp,
                                                        )
                                                    }
                                                    className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-300"
                                                    title="View photo"
                                                >
                                                    <img
                                                        src={avatarFor(emp)}
                                                        alt={emp.FullName}
                                                        className="w-9 h-9 rounded-full object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                                                    />
                                                </button>
                                                <div>
                                                    <p className="font-extrabold text-slate-800 leading-tight">
                                                        {emp.FullName}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                        {emp.EmployeeNo}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-4 px-6">
                                            <span className="inline-block bg-blue-50 text-blue-700 text-[11px] font-semibold px-3 py-1 rounded-md">
                                                {emp.position?.PositionTitle ??
                                                    "—"}
                                            </span>
                                        </td>

                                        <td className="py-4 px-6 font-medium text-slate-600">
                                            {emp.position?.department
                                                ?.DepartmentName ?? "—"}
                                        </td>

                                        <td className="py-4 px-6">
                                            <span
                                                className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                                                    employeeTypeLabel(emp) === "Teaching"
                                                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                                        : "bg-slate-100 text-slate-600 border border-slate-200"
                                                }`}
                                            >
                                                {employeeTypeLabel(emp)}
                                            </span>
                                        </td>

                                        <td className="py-4 px-6">
                                            <p className="text-slate-600 font-normal">
                                                {emp.Email}
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {emp.Phone || "—"}
                                            </p>
                                        </td>

                                        <td className="py-4 px-6">
                                            {emp.Status === "Active" ? (
                                                <span className="inline-block bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-block bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end space-x-2 text-slate-400">
                                                <button
                                                    onClick={() =>
                                                        setBarcodeEmployee(emp)
                                                    }
                                                    className="p-1 hover:text-slate-600 transition cursor-pointer"
                                                    title="View Barcode"
                                                >
                                                    <Barcode className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        openEdit(emp)
                                                    }
                                                    className="p-1 hover:text-slate-600 transition"
                                                    title="Edit Employee"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>

                                                {emp.Status === "Active" ? (
                                                    <button
                                                        onClick={() =>
                                                            setEmployeeToDelete(
                                                                emp,
                                                            )
                                                        }
                                                        className="p-1 hover:text-rose-600 transition"
                                                        title="Deactivate Employee"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            setEmployeeToRestore(
                                                                emp,
                                                            )
                                                        }
                                                        className="p-1 hover:text-emerald-600 transition"
                                                        title="Restore Employee"
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
                                        colSpan="7"
                                        className="py-8 text-center text-slate-400 text-xs"
                                    >
                                        No personnel found matching the filter
                                        criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredEmployees.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100">
                        <p className="text-[11px] text-slate-400 font-medium">
                            Showing {(currentPage - 1) * employeesPerPage + 1}–
                            {Math.min(
                                currentPage * employeesPerPage,
                                filteredEmployees.length,
                            )}{" "}
                            of {filteredEmployees.length}
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

            {/* BARCODE MODAL */}
            {barcodeEmployee && (
                <BarCodeModal
                    type="employee"
                    person={barcodeEmployee}
                    onClose={() => setBarcodeEmployee(null)}
                />
            )}

            {/* DELETE CONFIRMATION */}
            {employeeToDelete && (
                <DeleteConfirmationModal
                    title="Deactivate Employee"
                    message={`Are you sure you want to set ${employeeToDelete.FullName} to Inactive? You can reactivate them later from Academic Structure if needed.`}
                    confirmLabel="Deactivate"
                    onConfirm={confirmDeleteEmployee}
                    onClose={() => setEmployeeToDelete(null)}
                />
            )}

            {/* RESTORE CONFIRMATION */}
            {employeeToRestore && (
                <RestoreConfirmationModal
                    title="Restore Employee"
                    message={`Set ${employeeToRestore.FullName} back to Active? They will appear in the active personnel list again.`}
                    confirmLabel="Restore"
                    onConfirm={confirmRestoreEmployee}
                    onClose={() => setEmployeeToRestore(null)}
                />
            )}

            {/* PHOTO VIEWER */}
            {viewingPhotoEmployee && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setViewingPhotoEmployee(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setViewingPhotoEmployee(null)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <img
                            src={avatarFor(viewingPhotoEmployee)}
                            alt={viewingPhotoEmployee.FullName}
                            className="w-full aspect-square rounded-lg object-cover bg-slate-100 mb-4"
                        />

                        <p className="text-sm font-bold text-slate-800 text-center">
                            {viewingPhotoEmployee.FullName}
                        </p>
                        <p className="text-xs text-slate-400 text-center font-medium mt-0.5">
                            {viewingPhotoEmployee.EmployeeNo}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
