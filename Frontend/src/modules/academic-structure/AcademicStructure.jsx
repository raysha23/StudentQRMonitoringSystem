// File Path: Frontend\src\modules\academic-structure\academicStructure.jsx

import React, { useState, useEffect } from "react";
import {
    useQuery,
    useQueryClient,
    keepPreviousData,
} from "@tanstack/react-query";

import { Search, Plus, Edit2, Trash2, X } from "lucide-react";
import {
    programsApi,
    departmentsApi,
    positionsApi,
    subjectsApi,
    sectionsApi,
    getErrorMessage,
} from "../../api/academic-management-api";

const TABS = ["Departments", "Programs", "Positions", "Courses", "Sections"];

const YEAR_LEVELS = [
    { value: 1, label: "1st Year" },
    { value: 2, label: "2nd Year" },
    { value: 3, label: "3rd Year" },
    { value: 4, label: "4th Year" },
];
const yearLabel = (n) => YEAR_LEVELS.find((y) => y.value === n)?.label ?? "—";
const displayId = (prefix, id) => `${prefix}-${String(id).padStart(3, "0")}`;

const inputCls =
    "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500";

const PROGRAM_FIELDS = [
    {
        key: "CourseCode",
        label: "Program Code",
        placeholder: "e.g. BSCS",
        required: true,
    },
    {
        key: "CourseName",
        label: "Program Name",
        placeholder: "e.g. BS Computer Science",
        required: true,
    },
    {
        key: "Description",
        label: "Description / Title",
        placeholder: "e.g. Bachelor of Science in Computer Science",
    },
    {
        key: "Majors",
        label: "Majors / Specializations (comma separated)",
        placeholder: "e.g. Software Engineering, Data Science",
    },
];

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }) {
    const active = status === "Active";
    return (
        <span
            className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                active
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
        >
            {status}
        </span>
    );
}

function ErrorBanner({ message }) {
    if (!message) return null;
    return (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl px-4 py-3">
            {message}
        </div>
    );
}

// Turns the form state into an API payload
const buildPayload = (fields, form, includeStatus) => {
    const payload = {};
    fields.forEach((f) => {
        const v = form[f.key];
        if (f.nullable) {
            payload[f.key] = v === "" || v == null ? null : Number(v);
        } else if (f.numeric) {
            if (v !== "" && v != null) payload[f.key] = Number(v);
        } else {
            payload[f.key] = typeof v === "string" ? v.trim() : v;
        }
    });
    if (includeStatus) payload.Status = form.Status;
    return payload;
};

// Starting values for a new record
const emptyForm = (fields) =>
    Object.fromEntries(
        fields.map((f) => [f.key, f.options?.length ? f.options[0].value : ""]),
    );
const PAGE_SIZE = 10;
const PROGRAMS_PER_PAGE = 9;

function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

function StatusFilter({ value, onChange }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
        </select>
    );
}

function Pagination({ page, lastPage, total, perPage, onChange }) {
    if (total <= perPage) return null;
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    const btn =
        "px-3 py-1.5 rounded-lg border border-slate-200 font-semibold hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed";
    return (
        <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <span>
                Showing {start}–{end} of {total}
            </span>
            <div className="flex items-center space-x-2">
                <button
                    className={btn}
                    disabled={page <= 1}
                    onClick={() => onChange(page - 1)}
                >
                    Prev
                </button>
                <span className="font-semibold">
                    Page {page} of {lastPage}
                </span>
                <button
                    className={btn}
                    disabled={page >= lastPage}
                    onClick={() => onChange(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

/* Shared add / edit modal */
function EntityModal({
    title,
    fields,
    form,
    setForm,
    showStatus,
    saving,
    error,
    onSubmit,
    onClose,
}) {
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <ErrorBanner message={error} />

                <form onSubmit={onSubmit} className="space-y-4 text-xs">
                    {fields.map((f) => (
                        <div key={f.key}>
                            <label className="block text-slate-600 font-semibold mb-1">
                                {f.label}
                            </label>
                            {f.options ? (
                                <select
                                    required={f.required}
                                    value={form[f.key] ?? ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            [f.key]: e.target.value,
                                        })
                                    }
                                    className={inputCls}
                                >
                                    {f.options.length === 0 && (
                                        <option value="">
                                            No options available yet
                                        </option>
                                    )}
                                    {f.options.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={f.numeric ? "number" : "text"}
                                    min={f.numeric ? 0 : undefined}
                                    max={f.max}
                                    placeholder={f.placeholder}
                                    required={f.required}
                                    value={form[f.key] ?? ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            [f.key]: e.target.value,
                                        })
                                    }
                                    className={inputCls}
                                />
                            )}
                        </div>
                    ))}

                    {showStatus && (
                        <div>
                            <label className="block text-slate-600 font-semibold mb-1">
                                Status
                            </label>
                            <select
                                value={form.Status ?? "Active"}
                                onChange={(e) =>
                                    setForm({ ...form, Status: e.target.value })
                                }
                                className={inputCls}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    )}

                    <div className="pt-3 flex items-center justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 font-bold bg-[#1a365d] hover:bg-[#122744] text-white rounded-xl transition shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Reusable CRUD table (Departments, Positions, Courses, Sections)    */
/* ------------------------------------------------------------------ */

function EntityManager({
    title,
    subtitle,
    singular,
    idKey,
    idPrefix,
    api,
    columns,
    fields,
    onChanged,
}) {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(search);
    const [statusFilter, setStatusFilter] = useState("");
    const [actionError, setActionError] = useState(null); // delete errors

    const [modal, setModal] = useState(null); // null | { mode: 'add' } | { mode: 'edit', item }
    const [form, setForm] = useState({});
    const [formError, setFormError] = useState(null);
    const [saving, setSaving] = useState(false);

    const {
        data,
        isLoading: loading,
        error: loadError,
    } = useQuery({
        queryKey: [...api.key, "paged", page, debouncedSearch, statusFilter],
        queryFn: () =>
            api.paged({
                page,
                per_page: PAGE_SIZE,
                search: debouncedSearch,
                status: statusFilter,
            }),
        placeholderData: keepPreviousData,
    });

    // Array fallback = endpoint not paginated yet
    const isArr = Array.isArray(data);
    const matched = isArr
        ? data.filter(
              (r) =>
                  (!statusFilter || r.Status === statusFilter) &&
                  JSON.stringify(r)
                      .toLowerCase()
                      .includes(debouncedSearch.toLowerCase()),
          )
        : [];
    const items = isArr
        ? matched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
        : (data?.data ?? []);
    const total = isArr ? matched.length : (data?.total ?? 0);
    const lastPage = isArr
        ? Math.max(1, Math.ceil(matched.length / PAGE_SIZE))
        : (data?.last_page ?? 1);

    // Step back if the last row of the last page was deleted
    useEffect(() => {
        if (page > lastPage) setPage(lastPage);
    }, [page, lastPage]);

    const error =
        actionError ||
        (loadError
            ? getErrorMessage(
                  loadError,
                  `Failed to load ${singular.toLowerCase()}s.`,
              )
            : null);

    const reload = () => queryClient.invalidateQueries({ queryKey: api.key });

    const openAdd = () => {
        setForm(emptyForm(fields));
        setFormError(null);
        setModal({ mode: "add" });
    };

    const openEdit = (item) => {
        const values = Object.fromEntries(
            fields.map((f) => [f.key, item[f.key] ?? ""]),
        );
        setForm({ ...values, Status: item.Status });
        setFormError(null);
        setModal({ mode: "edit", item });
    };

    const closeModal = () => setModal(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError(null);
        try {
            const payload = buildPayload(fields, form, modal.mode === "edit");
            if (modal.mode === "edit") {
                await api.update(modal.item[idKey], payload);
            } else {
                await api.create(payload);
            }
            closeModal();
            await reload();
            onChanged?.();
        } catch (err) {
            setFormError(getErrorMessage(err, "Failed to save."));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete this ${singular.toLowerCase()}?`)) return;
        try {
            await api.remove(item[idKey]);
            setActionError(null);
            await reload();
            onChanged?.();
        } catch (err) {
            setActionError(getErrorMessage(err, "Failed to delete."));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
                </div>
                <div className="flex items-center space-x-3">
                    <StatusFilter
                        value={statusFilter}
                        onChange={(v) => {
                            setStatusFilter(v);
                            setPage(1);
                        }}
                    />
                    <div className="relative sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder={`Search ${singular.toLowerCase()}s...`}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                        />
                    </div>
                    <button
                        onClick={openAdd}
                        className="inline-flex items-center space-x-1.5 bg-[#1a365d] hover:bg-[#122744] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add {singular}</span>
                    </button>
                </div>
            </div>

            <ErrorBanner message={error} />

            <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="py-3.5 px-6">ID</th>
                            {columns.map((c) => (
                                <th key={c.label} className="py-3.5 px-6">
                                    {c.label}
                                </th>
                            ))}
                            <th className="py-3.5 px-6">Status</th>
                            <th className="py-3.5 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={columns.length + 3}
                                    className="py-8 text-center text-slate-400 text-xs"
                                >
                                    Loading...
                                </td>
                            </tr>
                        ) : items.length > 0 ? (
                            items.map((item) => (
                                <tr
                                    key={item[idKey]}
                                    className="hover:bg-slate-50/80 transition"
                                >
                                    <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                                        {displayId(idPrefix, item[idKey])}
                                    </td>
                                    {columns.map((c) => (
                                        <td
                                            key={c.label}
                                            className="py-4 px-6 font-medium"
                                        >
                                            {c.render
                                                ? c.render(item)
                                                : (item[c.key] ?? "—")}
                                        </td>
                                    ))}
                                    <td className="py-4 px-6">
                                        <StatusBadge status={item.Status} />
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end space-x-2 text-slate-400">
                                            <button
                                                onClick={() => openEdit(item)}
                                                className="p-1 hover:text-slate-600 transition"
                                                title={`Edit ${singular}`}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(item)
                                                }
                                                className="p-1 hover:text-rose-600 transition"
                                                title={`Delete ${singular}`}
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
                                    colSpan={columns.length + 3}
                                    className="py-8 text-center text-slate-400 text-xs"
                                >
                                    No {singular.toLowerCase()}s found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination
                page={page}
                lastPage={lastPage}
                total={total}
                perPage={PAGE_SIZE}
                onChange={setPage}
            />

            {modal && (
                <EntityModal
                    title={`${modal.mode === "edit" ? "Edit" : "Add New"} ${singular}`}
                    fields={fields}
                    form={form}
                    setForm={setForm}
                    showStatus={modal.mode === "edit"}
                    saving={saving}
                    error={formError}
                    onSubmit={handleSubmit}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AcademicStructure() {
    const [activeTab, setActiveTab] = useState("Departments");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(searchQuery);
    const [statusFilter, setStatusFilter] = useState("");

    const [modal, setModal] = useState(null); // null | { mode: 'add' } | { mode: 'edit', item }
    const [form, setForm] = useState({});
    const [formError, setFormError] = useState(null);
    const [saving, setSaving] = useState(false);

    const queryClient = useQueryClient();
    const [actionError, setActionError] = useState(null);

    const { data: programs = [] } = useQuery({
        queryKey: programsApi.key,
        queryFn: programsApi.list,
    });

    const {
        data: pagedData,
        isLoading: pagedLoading,
        error: pagedError,
    } = useQuery({
        queryKey: [
            ...programsApi.key,
            "paged",
            page,
            debouncedSearch,
            statusFilter,
        ],
        queryFn: () =>
            programsApi.paged({
                page,
                per_page: PROGRAMS_PER_PAGE,
                search: debouncedSearch,
                status: statusFilter,
            }),
        placeholderData: keepPreviousData,
    });

    const programRows = Array.isArray(pagedData)
        ? pagedData
        : (pagedData?.data ?? []);
    const programTotal = Array.isArray(pagedData)
        ? pagedData.length
        : (pagedData?.total ?? 0);
    const programLastPage = Array.isArray(pagedData)
        ? 1
        : (pagedData?.last_page ?? 1);

    useEffect(() => {
        if (page > programLastPage) setPage(programLastPage);
    }, [page, programLastPage]);

    const error =
        actionError ||
        (pagedError
            ? getErrorMessage(pagedError, "Failed to load programs.")
            : null);

    // Only the programs list (used when sections or courses change the counts)
    const refreshProgramList = () =>
        queryClient.invalidateQueries({ queryKey: programsApi.key });

    // A program itself changed, so refresh everything that shows program info
    const refreshPrograms = () =>
        Promise.all([
            queryClient.invalidateQueries({ queryKey: programsApi.key }),
            queryClient.invalidateQueries({ queryKey: subjectsApi.key }),
            queryClient.invalidateQueries({ queryKey: sectionsApi.key }),
        ]);

    const activeCount = programs.filter((p) => p.Status === "Active").length;
    const totalSections = programs.reduce(
        (acc, p) => acc + (p.sections_count ?? 0),
        0,
    );

    const programOptions = programs.map((p) => ({
        value: p.CourseID,
        label: `${p.CourseCode} · ${p.CourseName}`,
    }));
    const { data: departments = [] } = useQuery({
        queryKey: departmentsApi.key,
        queryFn: departmentsApi.list,
    });

    const departmentOptions = [
        { value: "", label: "Select department" },
        ...departments
            .filter((d) => d.Status === "Active")
            .map((d) => ({
                value: d.DepartmentID,
                label: `${d.DepartmentName} (${d.DepartmentType})`,
            })),
    ];
    // Programs can only belong to Teaching departments
    const teachingDepartmentOptions = [
        { value: "", label: "Select department" },
        ...departments
            .filter(
                (d) => d.Status === "Active" && d.DepartmentType === "Teaching",
            )
            .map((d) => ({ value: d.DepartmentID, label: d.DepartmentName })),
    ];

    const programFields = [
        PROGRAM_FIELDS[0], // code
        PROGRAM_FIELDS[1], // name
        {
            key: "DepartmentID",
            label: "Department",
            numeric: true,
            required: true,
            options: teachingDepartmentOptions,
        },
        PROGRAM_FIELDS[2], // description
        PROGRAM_FIELDS[3], // majors
    ];

    const refreshPositions = () =>
        queryClient.invalidateQueries({ queryKey: positionsApi.key });

    const openAddProgram = () => {
        setForm(emptyForm(programFields));
        setFormError(null);
        setModal({ mode: "add" });
    };

    const openEditProgram = (program) => {
        setForm({
            CourseCode: program.CourseCode,
            CourseName: program.CourseName,
            DepartmentID: program.DepartmentID ?? "",
            Description: program.Description ?? "",
            Majors: (program.Majors ?? []).join(", "),
            Status: program.Status,
        });
        setFormError(null);
        setModal({ mode: "edit", item: program });
    };

    const handleProgramSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError(null);
        try {
            const payload = buildPayload(
                programFields,
                form,
                modal.mode === "edit",
            );

            payload.CourseCode = payload.CourseCode.toUpperCase();
            payload.Majors = payload.Majors
                ? payload.Majors.split(",")
                      .map((m) => m.trim())
                      .filter(Boolean)
                : [];

            if (modal.mode === "edit") {
                await programsApi.update(modal.item.CourseID, payload);
            } else {
                await programsApi.create(payload);
            }
            setModal(null);
            await refreshPrograms();
        } catch (err) {
            setFormError(getErrorMessage(err, "Failed to save program."));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProgram = async (program) => {
        if (!window.confirm(`Delete program ${program.CourseCode}?`)) return;
        try {
            await programsApi.remove(program.CourseID);
            setActionError(null);
            await refreshPrograms();
        } catch (err) {
            setActionError(getErrorMessage(err, "Failed to delete program."));
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen p-6 font-sans text-slate-800 space-y-6">
            {/* HEADER BAR */}
            <div className="flex items-center justify-between pb-2">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        Academic Structure
                    </h1>
                </div>
            </div>

            {/* TOP DARK BANNER CARD WITH STATS */}
            <div className="bg-[#1e3a5f] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1 max-w-xl">
                    <span className="text-[11px] font-extrabold tracking-widest text-blue-300 uppercase">
                        ACADEMIC CONFIGURATION
                    </span>
                    <h2 className="text-2xl font-black tracking-tight text-white">
                        Programs & sections
                    </h2>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                        Maintain the school's official program catalog,
                        specializations, and class sections.
                    </p>
                </div>

                <div className="flex items-center space-x-3 self-stretch md:self-auto">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-6 py-3 text-center flex-1 md:flex-initial min-w-[90px]">
                        <span className="text-2xl font-extrabold block text-white">
                            {programs.length}
                        </span>
                        <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">
                            Programs
                        </span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-6 py-3 text-center flex-1 md:flex-initial min-w-[90px]">
                        <span className="text-2xl font-extrabold block text-white">
                            {activeCount}
                        </span>
                        <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">
                            Active
                        </span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-6 py-3 text-center flex-1 md:flex-initial min-w-[90px]">
                        <span className="text-2xl font-extrabold block text-white">
                            {totalSections}
                        </span>
                        <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">
                            Sections
                        </span>
                    </div>
                </div>
            </div>

            {/* MAIN CONTAINER */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                {/* TABS & SEARCH & ADD BUTTON ROW */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="inline-flex bg-slate-100 p-1 rounded-xl self-start max-w-full overflow-x-auto">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                                    activeTab === tab
                                        ? "bg-white text-slate-800 shadow-xs"
                                        : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeTab === "Programs" && (
                        <div className="flex items-center space-x-3 flex-1 sm:flex-initial justify-end">
                            <StatusFilter
                                value={statusFilter}
                                onChange={(v) => {
                                    setStatusFilter(v);
                                    setPage(1);
                                }}
                            />
                            <div className="relative flex-1 sm:w-64">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search programs..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                                />
                            </div>
                            <button
                                onClick={openAddProgram}
                                className="inline-flex items-center space-x-1.5 bg-[#1a365d] hover:bg-[#122744] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Program</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* PROGRAMS TAB */}
                {activeTab === "Programs" && (
                    <>
                        <ErrorBanner message={error} />

                        {pagedLoading ? (
                            <p className="py-8 text-center text-slate-400 text-xs">
                                Loading programs...
                            </p>
                        ) : programRows.length === 0 ? (
                            <p className="py-8 text-center text-slate-400 text-xs">
                                No programs found.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {programRows.map((program) => {
                                    const majors = program.Majors ?? [];
                                    return (
                                        <div
                                            key={program.CourseID}
                                            className="border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 transition shadow-xs flex flex-col justify-between space-y-4 bg-white"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-extrabold text-slate-700 text-xs tracking-tight">
                                                            {program.CourseCode}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-extrabold text-slate-800 leading-tight">
                                                                {
                                                                    program.CourseName
                                                                }
                                                            </h3>
                                                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                                                                {displayId(
                                                                    "PRG",
                                                                    program.CourseID,
                                                                )}
                                                                {program.department &&
                                                                    ` · ${program.department.DepartmentName}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <StatusBadge
                                                        status={program.Status}
                                                    />
                                                </div>

                                                <h4 className="text-xs font-semibold text-slate-700 mt-4 leading-snug">
                                                    {program.Description ||
                                                        program.CourseName}
                                                </h4>

                                                <div className="mt-4 min-h-[52px]">
                                                    {majors.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {majors.map(
                                                                (
                                                                    major,
                                                                    idx,
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="bg-blue-50 text-blue-600 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-blue-100"
                                                                    >
                                                                        {major}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-300 font-medium">
                                                            No major required
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                                                <span>
                                                    {program.sections_count ??
                                                        0}{" "}
                                                    sections
                                                </span>
                                                <div className="flex items-center space-x-2 text-slate-400">
                                                    <button
                                                        onClick={() =>
                                                            openEditProgram(
                                                                program,
                                                            )
                                                        }
                                                        className="p-1 hover:text-slate-600 transition"
                                                        title="Edit Program"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteProgram(
                                                                program,
                                                            )
                                                        }
                                                        className="p-1 hover:text-rose-600 transition"
                                                        title="Delete Program"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <Pagination
                            page={page}
                            lastPage={programLastPage}
                            total={programTotal}
                            perPage={PROGRAMS_PER_PAGE}
                            onChange={setPage}
                        />
                    </>
                )}

                {/* DEPARTMENTS TAB */}
                {activeTab === "Departments" && (
                    <EntityManager
                        title="Department Management"
                        subtitle="Maintain school departments"
                        singular="Department"
                        idKey="DepartmentID"
                        idPrefix="DEP"
                        api={departmentsApi}
                        onChanged={() => {
                            refreshPositions();
                            refreshProgramList();
                            queryClient.invalidateQueries({
                                queryKey: subjectsApi.key,
                            });
                        }}
                        columns={[
                            { key: "DepartmentCode", label: "Code" },
                            { key: "DepartmentName", label: "Department" },
                            { key: "DepartmentType", label: "Type" },
                        ]}
                        fields={[
                            {
                                key: "DepartmentCode",
                                label: "Department Code",
                                placeholder: "e.g. CCS",
                                required: true,
                            },
                            {
                                key: "DepartmentName",
                                label: "Department Name",
                                placeholder: "e.g. College of Computer Studies",
                                required: true,
                            },
                            {
                                key: "DepartmentType",
                                label: "Type",
                                required: true,
                                options: [
                                    { value: "Teaching", label: "Teaching" },
                                    {
                                        value: "Non-Teaching",
                                        label: "Non-Teaching",
                                    },
                                ],
                            },
                        ]}
                    />
                )}

                {/* POSITIONS TAB */}
                {activeTab === "Positions" && (
                    <EntityManager
                        title="Position Management"
                        subtitle="Maintain job positions under each department"
                        singular="Position"
                        idKey="PositionID"
                        idPrefix="POS"
                        api={positionsApi}
                        columns={[
                            { key: "PositionTitle", label: "Position" },
                            {
                                label: "Department",
                                render: (p) =>
                                    p.department?.DepartmentName ?? "—",
                            },
                            {
                                label: "Type",
                                render: (p) =>
                                    p.department?.DepartmentType ?? "—",
                            },
                        ]}
                        fields={[
                            {
                                key: "PositionTitle",
                                label: "Position Title",
                                placeholder: "e.g. Instructor",
                                required: true,
                            },
                            {
                                key: "DepartmentID",
                                label: "Department",
                                numeric: true,
                                required: true,
                                options: departmentOptions,
                            },
                        ]}
                    />
                )}

                {/* COURSES TAB (subjects table) */}
                {activeTab === "Courses" && (
                    <EntityManager
                        title="Course Management"
                        subtitle="Maintain subjects offered under each program"
                        singular="Course"
                        idKey="SubjectID"
                        idPrefix="CRS"
                        api={subjectsApi}
                        onChanged={refreshProgramList}
                        columns={[
                            { key: "SubjectCode", label: "Code" },
                            { key: "SubjectTitle", label: "Subject" },
                            {
                                label: "Program",
                                render: (s) => s.course?.CourseCode ?? "—",
                            },
                            {
                                label: "Department",
                                render: (s) =>
                                    s.course?.department?.DepartmentName ?? "—",
                            },
                            { key: "Units", label: "Units" },
                        ]}
                        fields={[
                            {
                                key: "SubjectCode",
                                label: "Course Code",
                                placeholder: "e.g. CS101",
                                required: true,
                            },
                            {
                                key: "SubjectTitle",
                                label: "Course Title",
                                placeholder: "e.g. Introduction to Computing",
                                required: true,
                            },
                            {
                                key: "CourseID",
                                label: "Program",
                                numeric: true,
                                required: true,
                                options: programOptions,
                            },
                            {
                                key: "Units",
                                label: "Units",
                                numeric: true,
                                max: 12,
                                placeholder: "e.g. 3",
                            },
                        ]}
                    />
                )}

                {/* SECTIONS TAB */}
                {activeTab === "Sections" && (
                    <EntityManager
                        title="Section Management"
                        subtitle="Maintain class sections"
                        singular="Section"
                        idKey="SectionID"
                        idPrefix="SEC"
                        api={sectionsApi}
                        onChanged={refreshProgramList}
                        columns={[
                            { key: "SectionName", label: "Section" },
                            {
                                label: "Program",
                                render: (s) => s.course?.CourseCode ?? "—",
                            },
                            {
                                label: "Year Level",
                                render: (s) => yearLabel(s.YearLevel),
                            },
                        ]}
                        fields={[
                            {
                                key: "SectionName",
                                label: "Section Name",
                                placeholder: "e.g. Charity",
                                required: true,
                            },
                            {
                                key: "CourseID",
                                label: "Program",
                                numeric: true,
                                required: true,
                                options: programOptions,
                            },
                            {
                                key: "YearLevel",
                                label: "Year Level",
                                numeric: true,
                                options: YEAR_LEVELS,
                            },
                        ]}
                    />
                )}
            </div>

            {/* ADD / EDIT PROGRAM MODAL */}
            {modal && (
                <EntityModal
                    title={
                        modal.mode === "edit"
                            ? "Edit Program"
                            : "Add New Program"
                    }
                    fields={programFields}
                    form={form}
                    setForm={setForm}
                    showStatus={modal.mode === "edit"}
                    saving={saving}
                    error={formError}
                    onSubmit={handleProgramSubmit}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
}
