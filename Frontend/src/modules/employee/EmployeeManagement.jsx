// File Path: Frontend\src\modules\employee\EmployeeManagement.jsx

import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Users, UserCheck, GraduationCap, X } from 'lucide-react';

const INITIAL_EMPLOYEES = [
    {
        id: 'EMP-001',
        name: 'Elena Cruz',
        position: 'Administration Staff',
        department: 'Office of the Registrar',
        email: 'elena.cruz@school.edu',
        phone: '09171234001',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
    {
        id: 'EMP-002',
        name: 'Ramon Flores',
        position: 'Teaching Staff / Faculty',
        department: 'Teacher Education',
        email: 'ramon.flores@school.edu',
        phone: '09171234002',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
    {
        id: 'EMP-003',
        name: 'Liza Mendoza',
        position: 'Teaching Staff / Faculty',
        department: 'Arts and Sciences',
        email: 'liza.mendoza@school.edu',
        phone: '09171234003',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    {
        id: 'EMP-004',
        name: 'Noel Garcia',
        position: 'Office Staff',
        department: 'Student Affairs',
        email: 'noel.garcia@school.edu',
        phone: '09171234004',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
        id: 'EMP-005',
        name: 'Grace Santos',
        position: 'Administration Staff',
        department: 'Accounting Office',
        email: 'grace.santos@school.edu',
        phone: '09171234005',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
    {
        id: 'EMP-006',
        name: 'Mark Reyes',
        position: 'Office Staff',
        department: 'IT Support',
        email: 'mark.reyes@school.edu',
        phone: '09171234006',
        status: 'Inactive',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    },
];

export default function EmployeeManagement() {
    const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPosition, setSelectedPosition] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Employee Form State
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        position: 'Administration Staff',
        department: '',
        email: '',
        phone: '',
    });

    // Filtered dataset
    const filteredEmployees = useMemo(() => {
        return employees.filter((emp) => {
            const matchesSearch =
                emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.department.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesPosition =
                selectedPosition === 'All' || emp.position === selectedPosition;

            return matchesSearch && matchesPosition;
        });
    }, [employees, searchQuery, selectedPosition]);

    // Statistics
    const totalPersonnel = employees.length;
    const activePersonnel = employees.filter((e) => e.status === 'Active').length;
    const inactivePersonnel = totalPersonnel - activePersonnel;
    const facultyMembers = employees.filter((e) =>
        e.position.includes('Teaching Staff')
    ).length;

    const handleAddEmployeeSubmit = (e) => {
        e.preventDefault();
        if (!newEmployee.name || !newEmployee.email) return;

        const created = {
            id: `EMP-00${employees.length + 1}`,
            name: newEmployee.name,
            position: newEmployee.position,
            department: newEmployee.department || 'General Administration',
            email: newEmployee.email,
            phone: newEmployee.phone || '09170000000',
            status: 'Active',
            avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
        };

        setEmployees([...employees, created]);
        setNewEmployee({
            name: '',
            position: 'Administration Staff',
            department: '',
            email: '',
            phone: '',
        });
        setIsModalOpen(false);
    };

    const handleDeleteEmployee = (id) => {
        setEmployees(employees.filter((emp) => emp.id !== id));
    };

    return (
        <div className="bg-slate-50 min-h-screen p-6 font-sans text-slate-800 space-y-6">

            {/* HEADER BAR */}
            <div className="flex items-center justify-between pb-2">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        Personnel Management
                    </h1>
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

            {/* SUMMARY CARDS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* TOTAL PERSONNEL CARD */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                            <Users className="w-5 h-5" />
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            TOTAL PERSONNEL
                        </p>
                        <h2 className="text-3xl font-extrabold text-slate-900">{totalPersonnel}</h2>
                        <p className="text-[11px] text-slate-400 pt-1">All employee records</p>
                    </div>
                </div>

                {/* ACTIVE PERSONNEL CARD */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            ACTIVE PERSONNEL
                        </p>
                        <h2 className="text-3xl font-extrabold text-slate-900">{activePersonnel}</h2>
                        <p className="text-[11px] text-slate-400 pt-1">
                            {inactivePersonnel} currently inactive
                        </p>
                    </div>
                </div>

                {/* FACULTY MEMBERS CARD */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            FACULTY MEMBERS
                        </p>
                        <h2 className="text-3xl font-extrabold text-slate-900">{facultyMembers}</h2>
                        <p className="text-[11px] text-slate-400 pt-1">Teaching staff</p>
                    </div>
                </div>

            </div>

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
                        {/* Search Bar */}
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

                        {/* Position Filter Dropdown */}
                        <select
                            value={selectedPosition}
                            onChange={(e) => setSelectedPosition(e.target.value)}
                            className="bg-white border-2 border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                        >
                            <option value="All">All Positions</option>
                            <option value="Administration Staff">Administration Staff</option>
                            <option value="Teaching Staff / Faculty">Teaching Staff / Faculty</option>
                            <option value="Office Staff">Office Staff</option>
                        </select>

                        {/* Add Employee Button */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center space-x-1.5 bg-[#1a365d] hover:bg-[#122744] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Employee</span>
                        </button>
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                <th className="py-3.5 px-6">EMPLOYEE</th>
                                <th className="py-3.5 px-6">POSITION</th>
                                <th className="py-3.5 px-6">DEPARTMENT</th>
                                <th className="py-3.5 px-6">CONTACT</th>
                                <th className="py-3.5 px-6">STATUS</th>
                                <th className="py-3.5 px-6 text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50/80 transition">

                                        {/* Employee Avatar, Name & ID */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={emp.avatar}
                                                    alt={emp.name}
                                                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                                />
                                                <div>
                                                    <p className="font-extrabold text-slate-800 leading-tight">
                                                        {emp.name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                        {emp.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Position Badge */}
                                        <td className="py-4 px-6">
                                            <span className="inline-block bg-blue-50 text-blue-700 text-[11px] font-semibold px-3 py-1 rounded-md">
                                                {emp.position}
                                            </span>
                                        </td>

                                        {/* Department */}
                                        <td className="py-4 px-6 font-medium text-slate-600">
                                            {emp.department}
                                        </td>

                                        {/* Contact (Email & Phone) */}
                                        <td className="py-4 px-6">
                                            <p className="text-slate-600 font-normal">{emp.email}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">{emp.phone}</p>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="py-4 px-6">
                                            {emp.status === 'Active' ? (
                                                <span className="inline-block bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-block bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end space-x-2 text-slate-400">
                                                <button
                                                    className="p-1 hover:text-slate-600 transition"
                                                    title="Edit Employee"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEmployee(emp.id)}
                                                    className="p-1 hover:text-rose-600 transition"
                                                    title="Delete Employee"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                                        No personnel found matching the filter criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* ADD EMPLOYEE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in duration-200">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-800">Add New Employee</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddEmployeeSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Maria Clara"
                                    required
                                    value={newEmployee.name}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1">Position</label>
                                <select
                                    value={newEmployee.position}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Administration Staff">Administration Staff</option>
                                    <option value="Teaching Staff / Faculty">Teaching Staff / Faculty</option>
                                    <option value="Office Staff">Office Staff</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1">Department</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Office of the Registrar"
                                    value={newEmployee.department}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="e.g. employee@school.edu"
                                    required
                                    value={newEmployee.email}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 09171234567"
                                    value={newEmployee.phone}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
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
                                    Save Employee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}