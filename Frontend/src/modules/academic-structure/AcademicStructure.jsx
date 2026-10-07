// File Path: Frontend\src\modules\academic-structure\academicStructure.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import {
    programsApi,
    departmentsApi,
    positionsApi,
    subjectsApi,
    sectionsApi,
    getErrorMessage,
} from '../../api/academic-management-api';

const TABS = ['Programs', 'Departments', 'Positions', 'Courses', 'Sections'];

const YEAR_LEVELS = [
    { value: 1, label: '1st Year' },
    { value: 2, label: '2nd Year' },
    { value: 3, label: '3rd Year' },
    { value: 4, label: '4th Year' },
];
const yearLabel = (n) => YEAR_LEVELS.find((y) => y.value === n)?.label ?? '—';

const displayId = (prefix, id) => `${prefix}-${String(id).padStart(3, '0')}`;

const inputCls =
    'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500';

const PROGRAM_FIELDS = [
    { key: 'CourseCode', label: 'Program Code', placeholder: 'e.g. BSCS', required: true },
    { key: 'CourseName', label: 'Program Name', placeholder: 'e.g. BS Computer Science', required: true },
    { key: 'Description', label: 'Description / Title', placeholder: 'e.g. Bachelor of Science in Computer Science' },
    { key: 'Majors', label: 'Majors / Specializations (comma separated)', placeholder: 'e.g. Software Engineering, Data Science' },
];

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }) {
    const active = status === 'Active';
    return (
        <span
            className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${active
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
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
        if (f.numeric) {
            // Blank numbers are left out so the database default applies
            if (v !== '' && v != null) payload[f.key] = Number(v);
        } else {
            payload[f.key] = typeof v === 'string' ? v.trim() : v;
        }
    });
    if (includeStatus) payload.Status = form.Status;
    return payload;
};

// Starting values for a new record
const emptyForm = (fields) =>
    Object.fromEntries(
        fields.map((f) => [f.key, f.options?.length ? f.options[0].value : ''])
    );

/* Shared add / edit modal */
function EntityModal({ title, fields, form, setForm, showStatus, saving, error, onSubmit, onClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <ErrorBanner message={error} />

                <form onSubmit={onSubmit} className="space-y-4 text-xs">
                    {fields.map((f) => (
                        <div key={f.key}>
                            <label className="block text-slate-600 font-semibold mb-1">{f.label}</label>
                            {f.options ? (
                                <select
                                    required={f.required}
                                    value={form[f.key] ?? ''}
                                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                    className={inputCls}
                                >
                                    {f.options.length === 0 && (
                                        <option value="">No options available yet</option>
                                    )}
                                    {f.options.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={f.numeric ? 'number' : 'text'}
                                    min={f.numeric ? 0 : undefined}
                                    max={f.max}
                                    placeholder={f.placeholder}
                                    required={f.required}
                                    value={form[f.key] ?? ''}
                                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                    className={inputCls}
                                />
                            )}
                        </div>
                    ))}

                    {showStatus && (
                        <div>
                            <label className="block text-slate-600 font-semibold mb-1">Status</label>
                            <select
                                value={form.Status ?? 'Active'}
                                onChange={(e) => setForm({ ...form, Status: e.target.value })}
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
                            {saving ? 'Saving...' : 'Save'}
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

function EntityManager({ title, subtitle, singular, idKey, idPrefix, api, columns, fields, onChanged }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    const [modal, setModal] = useState(null); // null | { mode: 'add' } | { mode: 'edit', item }
    const [form, setForm] = useState({});
    const [formError, setFormError] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setItems(await api.list());
        } catch (err) {
            setError(getErrorMessage(err, `Failed to load ${singular.toLowerCase()}s.`));
        } finally {
            setLoading(false);
        }
    }, [api, singular]);

    useEffect(() => {
        load();
    }, [load]);

    const q = search.toLowerCase();
    const filtered = items.filter((item) => JSON.stringify(item).toLowerCase().includes(q));

    const openAdd = () => {
        setForm(emptyForm(fields));
        setFormError(null);
        setModal({ mode: 'add' });
    };

    const openEdit = (item) => {
        const values = Object.fromEntries(fields.map((f) => [f.key, item[f.key] ?? '']));
        setForm({ ...values, Status: item.Status });
        setFormError(null);
        setModal({ mode: 'edit', item });
    };

    const closeModal = () => setModal(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError(null);
        try {
            const payload = buildPayload(fields, form, modal.mode === 'edit');
            if (modal.mode === 'edit') {
                await api.update(modal.item[idKey], payload);
            } else {
                await api.create(payload);
            }
            closeModal();
            await load();
            onChanged?.();
        } catch (err) {
            setFormError(getErrorMessage(err, 'Failed to save.'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete this ${singular.toLowerCase()}?`)) return;
        try {
            await api.remove(item[idKey]);
            await load();
            onChanged?.();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to delete.'));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h3 className="text-base font-extrabold text-slate-800 tracking-tight">{title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder={`Search ${singular.toLowerCase()}s...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
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
                                <th key={c.label} className="py-3.5 px-6">{c.label}</th>
                            ))}
                            <th className="py-3.5 px-6">Status</th>
                            <th className="py-3.5 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + 3} className="py-8 text-center text-slate-400 text-xs">
                                    Loading...
                                </td>
                            </tr>
                        ) : filtered.length > 0 ? (
                            filtered.map((item) => (
                                <tr key={item[idKey]} className="hover:bg-slate-50/80 transition">
                                    <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                                        {displayId(idPrefix, item[idKey])}
                                    </td>
                                    {columns.map((c) => (
                                        <td key={c.label} className="py-4 px-6 font-medium">
                                            {c.render ? c.render(item) : item[c.key] ?? '—'}
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
                                                onClick={() => handleDelete(item)}
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
                                <td colSpan={columns.length + 3} className="py-8 text-center text-slate-400 text-xs">
                                    No {singular.toLowerCase()}s found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {modal && (
                <EntityModal
                    title={`${modal.mode === 'edit' ? 'Edit' : 'Add New'} ${singular}`}
                    fields={fields}
                    form={form}
                    setForm={setForm}
                    showStatus={modal.mode === 'edit'}
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
    const [activeTab, setActiveTab] = useState('Programs');
    const [searchQuery, setSearchQuery] = useState('');

    // Programs (courses table)
    const [programs, setPrograms] = useState([]);
    const [programsLoading, setProgramsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [modal, setModal] = useState(null); // null | { mode: 'add' } | { mode: 'edit', item }
    const [form, setForm] = useState({});
    const [formError, setFormError] = useState(null);
    const [saving, setSaving] = useState(false);

    const loadPrograms = useCallback(async () => {
        setError(null);
        try {
            setPrograms(await programsApi.list());
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load programs.'));
        } finally {
            setProgramsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPrograms();
    }, [loadPrograms]);

    const q = searchQuery.toLowerCase();
    const filteredPrograms = programs.filter(
        (p) =>
            p.CourseName.toLowerCase().includes(q) ||
            p.CourseCode.toLowerCase().includes(q) ||
            (p.Description ?? '').toLowerCase().includes(q)
    );

    const activeCount = programs.filter((p) => p.Status === 'Active').length;
    const totalSections = programs.reduce((acc, p) => acc + (p.sections_count ?? 0), 0);

    // Dropdown options for Courses and Sections tabs
    const programOptions = programs.map((p) => ({ value: p.CourseID, label: p.CourseCode }));

    const openAddProgram = () => {
        setForm(emptyForm(PROGRAM_FIELDS));
        setFormError(null);
        setModal({ mode: 'add' });
    };

    const openEditProgram = (program) => {
        setForm({
            CourseCode: program.CourseCode,
            CourseName: program.CourseName,
            Description: program.Description ?? '',
            Majors: (program.Majors ?? []).join(', '),
            Status: program.Status,
        });
        setFormError(null);
        setModal({ mode: 'edit', item: program });
    };

    const handleProgramSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError(null);
        try {
            const payload = buildPayload(PROGRAM_FIELDS, form, modal.mode === 'edit');
            payload.CourseCode = payload.CourseCode.toUpperCase();
            payload.Majors = payload.Majors
                ? payload.Majors.split(',').map((m) => m.trim()).filter(Boolean)
                : [];

            if (modal.mode === 'edit') {
                await programsApi.update(modal.item.CourseID, payload);
            } else {
                await programsApi.create(payload);
            }
            setModal(null);
            await loadPrograms();
        } catch (err) {
            setFormError(getErrorMessage(err, 'Failed to save program.'));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProgram = async (program) => {
        if (!window.confirm(`Delete program ${program.CourseCode}?`)) return;
        try {
            await programsApi.remove(program.CourseID);
            await loadPrograms();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to delete program.'));
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen p-6 font-sans text-slate-800 space-y-6">

            {/* HEADER BAR */}
            <div className="flex items-center justify-between pb-2">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Academic Structure</h1>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Oct 7, 2026 · School Administration
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="inline-flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-medium text-slate-600 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>System Online</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-extrabold text-xs">
                        A
                    </div>
                </div>
            </div>

            {/* TOP DARK BANNER CARD WITH STATS */}
            <div className="bg-[#1e3a5f] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1 max-w-xl">
                    <span className="text-[11px] font-extrabold tracking-widest text-blue-300 uppercase">
                        ACADEMIC CONFIGURATION
                    </span>
                    <h2 className="text-2xl font-black tracking-tight text-white">Programs & sections</h2>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                        Maintain the school's official program catalog, specializations, class sections, and assigned advisers.
                    </p>
                </div>

                <div className="flex items-center space-x-3 self-stretch md:self-auto">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-6 py-3 text-center flex-1 md:flex-initial min-w-[90px]">
                        <span className="text-2xl font-extrabold block text-white">{programs.length}</span>
                        <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Programs</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-6 py-3 text-center flex-1 md:flex-initial min-w-[90px]">
                        <span className="text-2xl font-extrabold block text-white">{activeCount}</span>
                        <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Active</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-6 py-3 text-center flex-1 md:flex-initial min-w-[90px]">
                        <span className="text-2xl font-extrabold block text-white">{totalSections}</span>
                        <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Sections</span>
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
                                className={`px-5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${activeTab === tab
                                        ? 'bg-white text-slate-800 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'Programs' && (
                        <div className="flex items-center space-x-3 flex-1 sm:flex-initial justify-end">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search programs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
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
                {activeTab === 'Programs' && (
                    <>
                        <ErrorBanner message={error} />

                        {programsLoading ? (
                            <p className="py-8 text-center text-slate-400 text-xs">Loading programs...</p>
                        ) : filteredPrograms.length === 0 ? (
                            <p className="py-8 text-center text-slate-400 text-xs">No programs found.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredPrograms.map((program) => {
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
                                                                {program.CourseName}
                                                            </h3>
                                                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                                                                {displayId('PRG', program.CourseID)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <StatusBadge status={program.Status} />
                                                </div>

                                                <h4 className="text-xs font-semibold text-slate-700 mt-4 leading-snug">
                                                    {program.Description || program.CourseName}
                                                </h4>

                                                <div className="mt-4 min-h-[52px]">
                                                    {majors.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {majors.map((major, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="bg-blue-50 text-blue-600 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-blue-100"
                                                                >
                                                                    {major}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-300 font-medium">No major required</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                                                <span>{program.sections_count ?? 0} sections</span>
                                                <div className="flex items-center space-x-2 text-slate-400">
                                                    <button
                                                        onClick={() => openEditProgram(program)}
                                                        className="p-1 hover:text-slate-600 transition"
                                                        title="Edit Program"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProgram(program)}
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
                    </>
                )}

                {/* DEPARTMENTS TAB */}
                {activeTab === 'Departments' && (
                    <EntityManager
                        title="Department Management"
                        subtitle="Maintain school departments and their heads"
                        singular="Department"
                        idKey="DepartmentID"
                        idPrefix="DEP"
                        api={departmentsApi}
                        columns={[
                            { key: 'DepartmentCode', label: 'Code' },
                            { key: 'DepartmentName', label: 'Department' },
                            { key: 'DepartmentHead', label: 'Head' },
                        ]}
                        fields={[
                            { key: 'DepartmentCode', label: 'Department Code', placeholder: 'e.g. REG', required: true },
                            { key: 'DepartmentName', label: 'Department Name', placeholder: 'e.g. Office of the Registrar', required: true },
                            { key: 'DepartmentHead', label: 'Department Head', placeholder: 'e.g. Elena Cruz' },
                        ]}
                    />
                )}

                {/* POSITIONS TAB */}
                {activeTab === 'Positions' && (
                    <EntityManager
                        title="Position Management"
                        subtitle="Maintain job positions available to personnel"
                        singular="Position"
                        idKey="PositionID"
                        idPrefix="POS"
                        api={positionsApi}
                        columns={[
                            { key: 'PositionTitle', label: 'Position' },
                            { key: 'PositionType', label: 'Type' },
                        ]}
                        fields={[
                            { key: 'PositionTitle', label: 'Position Title', placeholder: 'e.g. Office Staff', required: true },
                            {
                                key: 'PositionType',
                                label: 'Type',
                                required: true,
                                options: [
                                    { value: 'Teaching', label: 'Teaching' },
                                    { value: 'Non-Teaching', label: 'Non-Teaching' },
                                ],
                            },
                        ]}
                    />
                )}

                {/* COURSES TAB (subjects table) */}
                {activeTab === 'Courses' && (
                    <EntityManager
                        title="Course Management"
                        subtitle="Maintain subjects offered under each program"
                        singular="Course"
                        idKey="SubjectID"
                        idPrefix="CRS"
                        api={subjectsApi}
                        onChanged={loadPrograms}
                        columns={[
                            { key: 'SubjectCode', label: 'Code' },
                            { key: 'SubjectTitle', label: 'Course Title' },
                            { label: 'Program', render: (s) => s.course?.CourseCode ?? '—' },
                            { key: 'Units', label: 'Units' },
                        ]}
                        fields={[
                            { key: 'SubjectCode', label: 'Course Code', placeholder: 'e.g. CS101', required: true },
                            { key: 'SubjectTitle', label: 'Course Title', placeholder: 'e.g. Introduction to Computing', required: true },
                            { key: 'CourseID', label: 'Program', numeric: true, required: true, options: programOptions },
                            { key: 'Units', label: 'Units', numeric: true, max: 12, placeholder: 'e.g. 3' },
                        ]}
                    />
                )}

                {/* SECTIONS TAB */}
                {activeTab === 'Sections' && (
                    <EntityManager
                        title="Section Management"
                        subtitle="Maintain class sections and assigned advisers"
                        singular="Section"
                        idKey="SectionID"
                        idPrefix="SEC"
                        api={sectionsApi}
                        onChanged={loadPrograms}
                        columns={[
                            { key: 'SectionName', label: 'Section' },
                            { label: 'Program', render: (s) => s.course?.CourseCode ?? '—' },
                            { label: 'Year Level', render: (s) => yearLabel(s.YearLevel) },
                            { key: 'Adviser', label: 'Adviser' },
                        ]}
                        fields={[
                            { key: 'SectionName', label: 'Section Name', placeholder: 'e.g. Charity', required: true },
                            { key: 'CourseID', label: 'Program', numeric: true, required: true, options: programOptions },
                            { key: 'YearLevel', label: 'Year Level', numeric: true, options: YEAR_LEVELS },
                            { key: 'Adviser', label: 'Adviser', placeholder: 'e.g. Prof. Santos' },
                        ]}
                    />
                )}
            </div>

            {/* ADD / EDIT PROGRAM MODAL */}
            {modal && (
                <EntityModal
                    title={modal.mode === 'edit' ? 'Edit Program' : 'Add New Program'}
                    fields={PROGRAM_FIELDS}
                    form={form}
                    setForm={setForm}
                    showStatus={modal.mode === 'edit'}
                    saving={saving}
                    error={formError}
                    onSubmit={handleProgramSubmit}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
}