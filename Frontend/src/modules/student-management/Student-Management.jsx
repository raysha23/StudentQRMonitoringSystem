// File Path: Frontend\src\modules\student-management\Student-Management.jsx
import React, { useState, useMemo } from 'react';
import {
    GraduationCap, Clock, FileText, Search, Plus, LayoutGrid,
    Edit3, Trash2, X, Check, ChevronDown, User, LogOut,
    ShieldAlert, SlidersHorizontal, Eye, Filter
} from 'lucide-react';

import { initialStudents } from '../mock-data/moct-data';

export default function StudentManagementModule() {
    const [students, setStudents] = useState(initialStudents);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('All Courses');
    const [selectedYear, setSelectedYear] = useState('All Year Levels');
    const [selectedStatus, setSelectedStatus] = useState('All Status');

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // New Student Form State
    const [formData, setFormData] = useState({
        name: '',
        course: 'BSCS',
        section: 'A',
        year: '1st Year',
        email: '',
        phone: '',
        status: 'Active'
    });

    // Calculate Metrics dynamically
    const metrics = useMemo(() => {
        const total = students.length;
        const active = students.filter(s => s.status === 'Active').length;
        const inactive = students.filter(s => s.status === 'Inactive').length;
        return { total, active, inactive };
    }, [students]);

    // Filtered Students
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCourse = selectedCourse === 'All Courses' || student.course === selectedCourse;
            const matchesYear = selectedYear === 'All Year Levels' || student.year === selectedYear;
            const matchesStatus = selectedStatus === 'All Status' || student.status === selectedStatus;

            return matchesSearch && matchesCourse && matchesYear && matchesStatus;
        });
    }, [students, searchQuery, selectedCourse, selectedYear, selectedStatus]);

    // Handlers
    const handleCreateStudent = (e) => {
        e.preventDefault();
        const newIdNumber = String(students.length + 1).padStart(3, '0');
        const newStudent = {
            ...formData,
            id: `S-2024-${newIdNumber}`,
            avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
        };
        setStudents([newStudent, ...students]);
        setIsAddModalOpen(false);
        resetForm();
    };

    const handleUpdateStudent = (e) => {
        e.preventDefault();
        setStudents(students.map(s => s.id === selectedStudent.id ? { ...selectedStudent, ...formData } : s));
        setIsEditModalOpen(false);
        setSelectedStudent(null);
    };

    const handleDeleteStudent = (id) => {
        if (confirm('Are you sure you want to delete this student record?')) {
            setStudents(students.filter(s => s.id !== id));
        }
    };

    const openEditModal = (student) => {
        setSelectedStudent(student);
        setFormData({
            name: student.name,
            course: student.course,
            section: student.section,
            year: student.year,
            email: student.email,
            phone: student.phone,
            status: student.status
        });
        setIsEditModalOpen(true);
    };

    const openViewModal = (student) => {
        setSelectedStudent(student);
        setIsViewModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            course: 'BSCS',
            section: 'A',
            year: '1st Year',
            email: '',
            phone: '',
            status: 'Active'
        });
    };

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">

            {/* Module Header */}
            <div>
                <h1 className="text-lg font-bold text-slate-800 leading-none">Student Management</h1>
                <p className="text-xs text-slate-400 mt-1 font-medium">Sep 25, 2026 - School Administration</p>
            </div>

            {/* Top Metric Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* TOTAL STUDENTS */}
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL STUDENTS</p>
                    <p className="text-3xl font-extrabold text-slate-800 mt-2">{metrics.total}</p>
                </div>

                {/* ACTIVE */}
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">ACTIVE</p>
                    <p className="text-3xl font-extrabold text-emerald-500 mt-2">{metrics.active}</p>
                </div>

                {/* INACTIVE */}
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">INACTIVE</p>
                    <p className="text-3xl font-extrabold text-slate-700 mt-2">{metrics.inactive}</p>
                </div>
            </div>

            {/* Filter and Actions Bar */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                {/* Search Input */}
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all"
                    />
                </div>

                {/* Filter Dropdowns & Add Button */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                    {/* Filter Course */}
                    <div className="relative">
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                            <option>All Courses</option>
                            <option>BSCS</option>
                            <option>BSIT</option>
                            <option>BSEd</option>
                            <option>BSBA</option>
                            <option>BSN</option>
                            <option>BSCPE</option>
                            <option>BSA</option>
                            <option>BSEE</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Filter Year Level */}
                    <div className="relative">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                            <option>All Year Levels</option>
                            <option>1st Year</option>
                            <option>2nd Year</option>
                            <option>3rd Year</option>
                            <option>4th Year</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Filter Status */}
                    <div className="relative">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                            <option>All Status</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Add Student Primary Button */}
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

            {/* Interactive Data Table Card */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="py-4 px-6">STUDENT</th>
                                <th className="py-4 px-4">ID</th>
                                <th className="py-4 px-4">COURSE</th>
                                <th className="py-4 px-4">SECTION</th>
                                <th className="py-4 px-4">YEAR</th>
                                <th className="py-4 px-6">CONTACT</th>
                                <th className="py-4 px-4">STATUS</th>
                                <th className="py-4 px-6 text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors group">
                                        {/* Student Info */}
                                        <td className="py-3.5 px-6 font-medium text-slate-800">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={student.avatar}
                                                    alt={student.name}
                                                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                                                />
                                                <span className="font-bold text-slate-800">{student.name}</span>
                                            </div>
                                        </td>

                                        {/* ID */}
                                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 font-semibold">
                                            {student.id}
                                        </td>

                                        {/* Course */}
                                        <td className="py-3.5 px-4 font-bold text-slate-800">
                                            {student.course}
                                        </td>

                                        {/* Section */}
                                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                                            {student.section}
                                        </td>

                                        {/* Year */}
                                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                                            {student.year}
                                        </td>

                                        {/* Contact Info (Stacked Email & Phone) */}
                                        <td className="py-3.5 px-6">
                                            <div className="text-slate-500 text-[11px] font-medium leading-snug">
                                                <div>{student.email}</div>
                                                <div className="text-slate-400 text-[10px]">{student.phone}</div>
                                            </div>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="py-3.5 px-4">
                                            {student.status === 'Active' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-100/70 text-emerald-700">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 px-6 text-right">
                                            <div className="flex items-center justify-end space-x-2 text-slate-400">
                                                {/* View Grid/Card button */}
                                                <button
                                                    onClick={() => openViewModal(student)}
                                                    title="View Details"
                                                    className="p-1 hover:text-slate-600 rounded transition-colors"
                                                >
                                                    <LayoutGrid className="w-4 h-4" />
                                                </button>

                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => openEditModal(student)}
                                                    title="Edit Student"
                                                    className="p-1 hover:text-blue-600 rounded transition-colors"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDeleteStudent(student.id)}
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
                                    <td colSpan="8" className="py-8 text-center text-slate-400">
                                        No student records found matching filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL: ADD STUDENT --- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 text-sm">Add New Student</h3>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateStudent} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Maria Santos"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Course</label>
                                    <select
                                        value={formData.course}
                                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                                    >
                                        <option>BSCS</option>
                                        <option>BSIT</option>
                                        <option>BSEd</option>
                                        <option>BSBA</option>
                                        <option>BSN</option>
                                        <option>BSCPE</option>
                                        <option>BSA</option>
                                        <option>BSEE</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Section</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="A, B, C..."
                                        value={formData.section}
                                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Year Level</label>
                                    <select
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                                    >
                                        <option>1st Year</option>
                                        <option>2nd Year</option>
                                        <option>3rd Year</option>
                                        <option>4th Year</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                                    >
                                        <option>Active</option>
                                        <option>Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="student@school.edu"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="0917XXXXXXX"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                                />
                            </div>

                            <div className="pt-3 flex items-center justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-semibold bg-[#1b2537] hover:bg-[#25324c] text-white rounded-lg transition-colors shadow-sm"
                                >
                                    Save Student
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL: EDIT STUDENT --- */}
            {isEditModalOpen && selectedStudent && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 text-sm">Edit Student ({selectedStudent.id})</h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateStudent} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Course</label>
                                    <select
                                        value={formData.course}
                                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                                    >
                                        <option>BSCS</option>
                                        <option>BSIT</option>
                                        <option>BSEd</option>
                                        <option>BSBA</option>
                                        <option>BSN</option>
                                        <option>BSCPE</option>
                                        <option>BSA</option>
                                        <option>BSEE</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Section</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.section}
                                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Year Level</label>
                                    <select
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                                    >
                                        <option>1st Year</option>
                                        <option>2nd Year</option>
                                        <option>3rd Year</option>
                                        <option>4th Year</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                                    >
                                        <option>Active</option>
                                        <option>Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                                />
                            </div>

                            <div className="pt-3 flex items-center justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-semibold bg-[#1b2537] hover:bg-[#25324c] text-white rounded-lg transition-colors shadow-sm"
                                >
                                    Update Student
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL: VIEW DETAILS CARD --- */}
            {isViewModalOpen && selectedStudent && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Student Profile Card</h3>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 text-center">
                            <img
                                src={selectedStudent.avatar}
                                alt={selectedStudent.name}
                                className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-slate-100 shadow-md mb-3"
                            />
                            <h4 className="font-bold text-slate-800 text-base">{selectedStudent.name}</h4>
                            <p className="font-mono text-xs text-slate-400 font-medium">{selectedStudent.id}</p>

                            <div className="mt-4 inline-block">
                                {selectedStudent.status === 'Active' ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                        Active Student
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                                        Inactive Student
                                    </span>
                                )}
                            </div>

                            <div className="mt-6 bg-slate-50 rounded-xl p-4 text-left space-y-2 text-xs">
                                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                    <span className="text-slate-400 font-medium">Course:</span>
                                    <span className="font-bold text-slate-700">{selectedStudent.course}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                    <span className="text-slate-400 font-medium">Section & Year:</span>
                                    <span className="font-bold text-slate-700">{selectedStudent.section} - {selectedStudent.year}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                    <span className="text-slate-400 font-medium">Email:</span>
                                    <span className="font-medium text-slate-700">{selectedStudent.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium">Phone:</span>
                                    <span className="font-medium text-slate-700">{selectedStudent.phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
            <h2 className="text-lg font-bold text-slate-800">{type} Scanner Module</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Connect your RFID / Barcode scanner device to record student attendance in real time.
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
            <h2 className="text-lg font-bold text-slate-800">Report Management</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Generate detailed daily, weekly, or monthly student attendance and entry/exit logs.
            </p>
        </div>
    );
}