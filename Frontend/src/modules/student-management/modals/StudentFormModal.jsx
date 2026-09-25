// File path: Frontend\src\modules\student-management\modals\StudentFormModal.jsx

import React from "react";
import { X } from "lucide-react";

export default function StudentFormModal({
    title,
    formData,
    setFormData,
    courses,
    sections,
    schoolYears,
    onSubmit,
    onClose,
    submitLabel,
}) {
    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="p-5 space-y-4 max-h-[70vh] overflow-y-auto"
                >
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Student Number
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="2025-0001"
                            value={formData.StudentNumber}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    StudentNumber: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                First Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.FirstName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        FirstName: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Middle Name
                            </label>
                            <input
                                type="text"
                                value={formData.MiddleName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        MiddleName: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Last Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.LastName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        LastName: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Suffix
                            </label>
                            <input
                                type="text"
                                placeholder="Jr., Sr., III"
                                value={formData.Suffix}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        Suffix: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                value={formData.DateOfBirth}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        DateOfBirth: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Gender
                            </label>
                            <select
                                value={formData.Gender}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        Gender: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Address
                        </label>
                        <input
                            type="text"
                            placeholder="Street, Barangay, City"
                            value={formData.Address}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    Address: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Course
                            </label>
                            <select
                                required
                                value={formData.CourseID}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        CourseID: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                            >
                                <option value="">Select course</option>
                                {courses.map((c) => (
                                    <option key={c.CourseID} value={c.CourseID}>
                                        {c.CourseCode}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Section
                            </label>
                            <select
                                required
                                value={formData.SectionID}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        SectionID: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                            >
                                <option value="">Select section</option>
                                {sections.map((s) => (
                                    <option
                                        key={s.SectionID}
                                        value={s.SectionID}
                                    >
                                        {s.SectionName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Year Level
                            </label>
                            <select
                                value={formData.YearLevel}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        YearLevel: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                            >
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                School Year
                            </label>
                            <select
                                required
                                value={formData.SchoolYearID}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        SchoolYearID: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                            >
                                <option value="">Select</option>
                                {schoolYears.map((sy) => (
                                    <option
                                        key={sy.SchoolYearID}
                                        value={sy.SchoolYearID}
                                    >
                                        {sy.SchoolYearName ||
                                            sy.Label ||
                                            sy.SchoolYearID}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Status
                            </label>
                            <select
                                value={formData.Status}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        Status: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                            >
                                <option>Enrolled</option>
                                <option>Not Enrolled</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="student@school.edu"
                            value={formData.Email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    Email: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Phone Number
                        </label>
                        <input
                            type="text"
                            placeholder="0917XXXXXXX"
                            value={formData.ContactNumber}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    ContactNumber: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                        />
                    </div>

                    <div className="pt-3 flex items-center justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-xs font-semibold bg-[#1b2537] hover:bg-[#25324c] text-white rounded-lg transition-colors shadow-sm"
                        >
                            {submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
