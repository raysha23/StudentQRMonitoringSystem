// File Path: Frontend\src\modules\academic-structure\academicStructure.jsx

import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, CheckCircle, X } from 'lucide-react';

const INITIAL_PROGRAMS = [
    {
        id: 'PRG-001',
        code: 'BA-P',
        name: 'BA-POLSci',
        description: 'Political Science',
        majors: [],
        sectionsCount: 0,
        status: 'Active',
    },
    {
        id: 'PRG-002',
        code: 'BEED',
        name: 'BEED',
        description: 'Bachelor of Elementary Education',
        majors: [],
        sectionsCount: 2,
        status: 'Active',
    },
    {
        id: 'PRG-003',
        code: 'BSED',
        name: 'BSED',
        description: 'Bachelor of Secondary Education',
        majors: ['English', 'Filipino', 'Mathematics', 'Science', 'MAPEH'],
        sectionsCount: 2,
        status: 'Active',
    },
    {
        id: 'PRG-004',
        code: 'BSCS',
        name: 'BSCS',
        description: 'Bachelor of Science in Computer Science',
        majors: ['Software Engineering', 'Data Science'],
        sectionsCount: 3,
        status: 'Active',
    },
    {
        id: 'PRG-005',
        code: 'BSBA',
        name: 'BSBA',
        description: 'Bachelor of Science in Business Administration',
        majors: ['Financial Management', 'Marketing'],
        sectionsCount: 1,
        status: 'Active',
    },
];
const TABS = ['Programs', 'Departments', 'Positions', 'Courses', 'Sections'];

const INITIAL_DEPARTMENTS = [
    { id: 'DEP-001', code: 'REG', name: 'Office of the Registrar', head: 'Elena Cruz', status: 'Active' },
    { id: 'DEP-002', code: 'TED', name: 'Teacher Education', head: 'Ramon Flores', status: 'Active' },
    { id: 'DEP-003', code: 'AS', name: 'Arts and Sciences', head: 'Liza Mendoza', status: 'Active' },
    { id: 'DEP-004', code: 'SA', name: 'Student Affairs', head: 'Noel Garcia', status: 'Active' },
];

const INITIAL_POSITIONS = [
    { id: 'POS-001', title: 'Administration Staff', type: 'Non-Teaching', status: 'Active' },
    { id: 'POS-002', title: 'Teaching Staff / Faculty', type: 'Teaching', status: 'Active' },
    { id: 'POS-003', title: 'Office Staff', type: 'Non-Teaching', status: 'Active' },
];

const INITIAL_COURSES = [
    { id: 'CRS-001', code: 'CS101', title: 'Introduction to Computing', program: 'BSCS', units: '3', status: 'Active' },
    { id: 'CRS-002', code: 'ED101', title: 'The Teaching Profession', program: 'BEED', units: '3', status: 'Active' },
    { id: 'CRS-003', code: 'BA101', title: 'Principles of Management', program: 'BSBA', units: '3', status: 'Active' },
];

const INITIAL_SECTIONS = [
    { id: 'SEC-001', name: 'BSCS 1-A', program: 'BSCS', yearLevel: '1st Year', adviser: 'Ramon Flores', status: 'Active' },
    { id: 'SEC-002', name: 'BEED 1-A', program: 'BEED', yearLevel: '1st Year', adviser: 'Liza Mendoza', status: 'Active' },
];

/* Reusable CRUD table + modal used by every tab except Programs */
function EntityManager({ title, subtitle, singular, idPrefix, columns, fields, initialData }) {
    const [items, setItems] = useState(initialData);
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const emptyForm = Object.fromEntries(fields.map((f) => [f.key, f.options ? f.options[0] : '']));
    const [form, setForm] = useState(emptyForm);

    const filtered = items.filter((item) =>
        Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        // max + 1 so IDs never collide after a delete
        const next = items.length
            ? Math.max(...items.map((i) => parseInt(i.id.split('-')[1], 10))) + 1
            : 1;
        const id = `${idPrefix}-${String(next).padStart(3, '0')}`;
        setItems([...items, { id, ...form, status: 'Active' }]);
        setForm(emptyForm);
        setIsOpen(false);
    };

    const handleDelete = (id) => setItems(items.filter((i) => i.id !== id));

    const inputCls =
        'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500';

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
                        onClick={() => setIsOpen(true)}
                        className="inline-flex items-center space-x-1.5 bg-[#1a365d] hover:bg-[#122744] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add {singular}</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="py-3.5 px-6">ID</th>
                            {columns.map((c) => (
                                <th key={c.key} className="py-3.5 px-6">{c.label}</th>
                            ))}
                            <th className="py-3.5 px-6">Status</th>
                            <th className="py-3.5 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {filtered.length > 0 ? (
                            filtered.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                                    <td className="py-4 px-6 font-mono text-[11px] text-slate-400">{item.id}</td>
                                    {columns.map((c) => (
                                        <td key={c.key} className="py-4 px-6 font-medium">{item[c.key]}</td>
                                    ))}
                                    <td className="py-4 px-6">
                                        <span className="inline-block bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end space-x-2 text-slate-400">
                                            <button className="p-1 hover:text-slate-600 transition" title={`Edit ${singular}`}>
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
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

            {isOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-800">Add New {singular}</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            {fields.map((f) => (
                                <div key={f.key}>
                                    <label className="block text-slate-600 font-semibold mb-1">{f.label}</label>
                                    {f.options ? (
                                        <select
                                            value={form[f.key]}
                                            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                            className={inputCls}
                                        >
                                            {f.options.map((o) => (
                                                <option key={o} value={o}>{o}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder={f.placeholder}
                                            required={f.required}
                                            value={form[f.key]}
                                            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                            className={inputCls}
                                        />
                                    )}
                                </div>
                            ))}

                            <div className="pt-3 flex items-center justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 font-bold bg-[#1a365d] hover:bg-[#122744] text-white rounded-xl transition shadow-xs"
                                >
                                    Save {singular}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default function AcademicStructure() {
    const [activeTab, setActiveTab] = useState('Programs');
    const [searchQuery, setSearchQuery] = useState('');
    const [programs, setPrograms] = useState(INITIAL_PROGRAMS);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Program Form State
    const [newProgram, setNewProgram] = useState({
        code: '',
        name: '',
        description: '',
        majors: '',
    });

    const filteredPrograms = programs.filter(
        (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCount = programs.filter((p) => p.status === 'Active').length;
    const totalSections = programs.reduce((acc, p) => acc + p.sectionsCount, 0);

    const handleAddProgramSubmit = (e) => {
        e.preventDefault();
        if (!newProgram.name || !newProgram.code) return;

        const majorsArray = newProgram.majors
            ? newProgram.majors.split(',').map((m) => m.trim())
            : [];

        const created = {
            id: `PRG-00${programs.length + 1}`,
            code: newProgram.code.toUpperCase(),
            name: newProgram.name,
            description: newProgram.description || newProgram.name,
            majors: majorsArray,
            sectionsCount: 0,
            status: 'Active',
        };

        setPrograms([...programs, created]);
        setNewProgram({ code: '', name: '', description: '', majors: '' });
        setIsModalOpen(false);
    };

    const handleDeleteProgram = (id) => {
        setPrograms(programs.filter((p) => p.id !== id));
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

                {/* STAT COUNTERS */}
                <div className="flex items-center space-x-3 self-stretch md:self-auto">

                    {/* Programs Count */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-6 py-3 text-center flex-1 md:flex-initial min-w-[90px]">
                        <span className="text-2xl font-extrabold block text-white">{programs.length}</span>
                        <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Programs</span>
                    </div>

                    {/* Active Count */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-6 py-3 text-center flex-1 md:flex-initial min-w-[90px]">
                        <span className="text-2xl font-extrabold block text-white">{activeCount}</span>
                        <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Active</span>
                    </div>

                    {/* Sections Count */}
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

                    {/* Tabs Switcher */}
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
                    {/* Search & Action Button */}
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
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center space-x-1.5 bg-[#1a365d] hover:bg-[#122744] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Program</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* PROGRAM CARDS GRID */}
                {activeTab === 'Programs' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPrograms.map((program) => (
                            <div
                                key={program.id}
                                className="border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 transition shadow-xs flex flex-col justify-between space-y-4 bg-white"
                            >
                                {/* Card Top Header */}
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-extrabold text-slate-700 text-xs tracking-tight">
                                                {program.code}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-extrabold text-slate-800 leading-tight">
                                                    {program.name}
                                                </h3>
                                                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                                                    {program.id}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                                            {program.status}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <h4 className="text-xs font-semibold text-slate-700 mt-4 leading-snug">
                                        {program.description}
                                    </h4>

                                    {/* Majors list or "No major required" */}
                                    <div className="mt-4 min-h-[52px]">
                                        {program.majors.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {program.majors.map((major, idx) => (
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

                                {/* Card Footer: Section count & action buttons */}
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                                    <span>{program.sectionsCount} sections</span>

                                    <div className="flex items-center space-x-2 text-slate-400">
                                        <button
                                            className="p-1 hover:text-slate-600 transition"
                                            title="Edit Program"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProgram(program.id)}
                                            className="p-1 hover:text-rose-600 transition"
                                            title="Delete Program"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'Departments' && (
                    <EntityManager
                        title="Department Management"
                        subtitle="Maintain school departments and their heads"
                        singular="Department"
                        idPrefix="DEP"
                        initialData={INITIAL_DEPARTMENTS}
                        columns={[
                            { key: 'code', label: 'Code' },
                            { key: 'name', label: 'Department' },
                            { key: 'head', label: 'Head' },
                        ]}
                        fields={[
                            { key: 'code', label: 'Department Code', placeholder: 'e.g. REG', required: true },
                            { key: 'name', label: 'Department Name', placeholder: 'e.g. Office of the Registrar', required: true },
                            { key: 'head', label: 'Department Head', placeholder: 'e.g. Elena Cruz' },
                        ]}
                    />
                )}

                {activeTab === 'Positions' && (
                    <EntityManager
                        title="Position Management"
                        subtitle="Maintain job positions available to personnel"
                        singular="Position"
                        idPrefix="POS"
                        initialData={INITIAL_POSITIONS}
                        columns={[
                            { key: 'title', label: 'Position' },
                            { key: 'type', label: 'Type' },
                        ]}
                        fields={[
                            { key: 'title', label: 'Position Title', placeholder: 'e.g. Office Staff', required: true },
                            { key: 'type', label: 'Type', options: ['Teaching', 'Non-Teaching'] },
                        ]}
                    />
                )}

                {activeTab === 'Courses' && (
                    <EntityManager
                        title="Course Management"
                        subtitle="Maintain subjects offered under each program"
                        singular="Course"
                        idPrefix="CRS"
                        initialData={INITIAL_COURSES}
                        columns={[
                            { key: 'code', label: 'Code' },
                            { key: 'title', label: 'Course Title' },
                            { key: 'program', label: 'Program' },
                            { key: 'units', label: 'Units' },
                        ]}
                        fields={[
                            { key: 'code', label: 'Course Code', placeholder: 'e.g. CS101', required: true },
                            { key: 'title', label: 'Course Title', placeholder: 'e.g. Introduction to Computing', required: true },
                            { key: 'program', label: 'Program', options: programs.map((p) => p.code) },
                            { key: 'units', label: 'Units', placeholder: 'e.g. 3' },
                        ]}
                    />
                )}

                {activeTab === 'Sections' && (
                    <EntityManager
                        title="Section Management"
                        subtitle="Maintain class sections and assigned advisers"
                        singular="Section"
                        idPrefix="SEC"
                        initialData={INITIAL_SECTIONS}
                        columns={[
                            { key: 'name', label: 'Section' },
                            { key: 'program', label: 'Program' },
                            { key: 'yearLevel', label: 'Year Level' },
                            { key: 'adviser', label: 'Adviser' },
                        ]}
                        fields={[
                            { key: 'name', label: 'Section Name', placeholder: 'e.g. BSCS 1-A', required: true },
                            { key: 'program', label: 'Program', options: programs.map((p) => p.code) },
                            { key: 'yearLevel', label: 'Year Level', options: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
                            { key: 'adviser', label: 'Adviser', placeholder: 'e.g. Ramon Flores' },
                        ]}
                    />
                )}

            </div>

            {/* ADD PROGRAM MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in duration-200">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-800">Add New Program</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddProgramSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-600 font-semibold mb-1">Program Code</label>
                                <input
                                    type="text"
                                    placeholder="e.g. BSCS"
                                    required
                                    value={newProgram.code}
                                    onChange={(e) => setNewProgram({ ...newProgram, code: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1">Program Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. BSCS"
                                    required
                                    value={newProgram.name}
                                    onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1">Description / Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Bachelor of Science in Computer Science"
                                    value={newProgram.description}
                                    onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1">Majors / Specializations (Comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Software Engineering, Data Science"
                                    value={newProgram.majors}
                                    onChange={(e) => setNewProgram({ ...newProgram, majors: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="pt-3 flex items-center justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 font-bold bg-[#1a365d] hover:bg-[#122744] text-white rounded-xl transition shadow-xs"
                                >
                                    Save Program
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}