// File path: Frontend\src\modules\student-management\StudentFormPage.jsx

import React from "react";
import { ArrowLeft, Camera } from "lucide-react";

export default function StudentFormPage({
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
    // Compute initials-based avatar preview
    const fullName = `${formData.FirstName || ""} ${
        formData.LastName || ""
    }`.trim();
    const avatarSeed = fullName || formData.StudentNumber || "student";
    const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
        avatarSeed,
    )}`;

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 rounded-lg p-2 -ml-2 transition-colors"
                    title="Back"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-slate-800 leading-none">
                        {title}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                        School Administration
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <form
                    onSubmit={onSubmit}
                    className="grid grid-cols-1 lg:grid-cols-[1fr_1fr]"
                >
                    <aside className="bg-slate-50 md:border-r border-slate-100 p-6 flex flex-col items-center justify-center">
                        <div className="relative group">
                            <img
                                src={formData.ProfilePicture || avatarUrl}
                                alt="Student avatar preview"
                                className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full object-cover border-4 border-white shadow-lg bg-slate-100"
                            />

                            <input
                                id="student-photo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    if (file.size > 2 * 1024 * 1024) {
                                        alert("Image is too large. Max 2MB.");
                                        return;
                                    }
                                    // Keep the real File object for upload...
                                    setFormData({
                                        ...formData,
                                        ProfilePictureFile: file,
                                    });
                                    // ...and a throwaway blob URL just for the preview.
                                    setFormData((prev) => ({
                                        ...prev,
                                        ProfilePicture:
                                            URL.createObjectURL(file),
                                    }));
                                }}
                            />

                            <label
                                htmlFor="student-photo-upload"
                                className="absolute bottom-2 right-2 w-12 h-12 flex items-center justify-center rounded-full bg-[#1b2537] text-white cursor-pointer shadow-md border-2 border-white hover:bg-[#25324c] transition-all active:scale-95"
                                title="Upload photo"
                            >
                                <Camera className="w-5 h-5" />
                            </label>
                        </div>

                        <h4 className="mt-4 text-base font-bold text-slate-800 text-center leading-tight">
                            {fullName || "New Student"}
                        </h4>
                        <p className="text-xs font-mono text-slate-400 mt-1">
                            {formData.StudentNumber || "—"}
                        </p>

                        {formData.ProfilePicture && (
                            <button
                                type="button"
                                onClick={() =>
                                    setFormData({
                                        ...formData,
                                        ProfilePicture: "",
                                    })
                                }
                                className="mt-2 text-[11px] text-slate-400 hover:text-rose-500 font-medium transition-colors"
                            >
                                Remove photo
                            </button>
                        )}

                        <p className="mt-1 text-[10px] text-slate-400 text-center">
                            JPG, PNG or GIF · Max 2MB
                        </p>
                    </aside>

                    {/* ============ RIGHT COLUMN: FORM FIELDS ============ */}
                    <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Juan"
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
                                <label className="flex items-baseline gap-x-1 text-xs font-semibold text-slate-600 mb-1 whitespace-nowrap">
                                    <span>Middle Name</span>
                                    <span className="font-normal text-slate-400 text-[11px]">
                                        (Optional)
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Santos"
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
                                    placeholder="Dela Cruz"
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

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Suffix
                                </label>
                                <select
                                    value={formData.Suffix}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            Suffix: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                                >
                                    <option value="">None</option>
                                    <option value="Jr.">Jr.</option>
                                    <option value="Sr.">Sr.</option>
                                    <option value="II">II</option>
                                    <option value="III">III</option>
                                </select>
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

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
                                        <option
                                            key={c.CourseID}
                                            value={c.CourseID}
                                        >
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

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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

                        <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
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
                    </div>
                </form>
            </div>
        </div>
    );
}
