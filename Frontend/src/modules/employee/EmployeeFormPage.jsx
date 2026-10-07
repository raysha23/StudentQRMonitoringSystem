// File Path: Frontend\src\modules\employee\EmployeeFormPage.jsx

import React, { useState } from "react";
import { ArrowLeft, Camera } from "lucide-react";

// Unicode-aware so names like "Peña" or "Muñoz" are allowed. Digits are not.
const NAME_REGEX = /^[\p{L}\s.'-]*$/u;
const PHONE_REGEX = /^09\d{9}$/; // 11 digits, starts with 09

const fieldCls =
    "w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none";

export default function EmployeeFormPage({
    title,
    mode, // "add" | "edit"
    formData,
    setFormData,
    positions,
    departments,
    saving,
    serverError,
    onSubmit,
    onClose,
    submitLabel,
}) {
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!formData.FullName.trim()) {
            newErrors.FullName = "Full name is required.";
        } else if (!NAME_REGEX.test(formData.FullName)) {
            newErrors.FullName = "Full name cannot contain numbers.";
        }

        if (formData.Phone && !PHONE_REGEX.test(formData.Phone)) {
            newErrors.Phone = "Phone number must be 11 digits and start with 09.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit(e);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please choose an image file.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            alert("Image is too large. Max 2MB.");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            ProfilePictureFile: file, // real File for the upload
            ProfilePicture: URL.createObjectURL(file), // throwaway URL for the preview
        }));
        e.target.value = ""; // lets the same file be picked again
    };

    // Drops a newly picked photo and goes back to the saved one (if any)
    const undoNewPhoto = () => {
        if (formData.ProfilePicture?.startsWith("blob:")) {
            URL.revokeObjectURL(formData.ProfilePicture);
        }
        setFormData((prev) => ({
            ...prev,
            ProfilePictureFile: null,
            ProfilePicture: prev.OriginalPicture || "",
        }));
    };

    const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
        formData.FullName.trim() || "employee",
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
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 lg:grid-cols-[1fr_1fr]"
                >
                    {/* ============ LEFT COLUMN: PHOTO ============ */}
                    <aside className="bg-slate-50 md:border-r border-slate-100 p-6 flex flex-col items-center justify-center">
                        <div className="relative group">
                            <img
                                src={formData.ProfilePicture || avatarUrl}
                                alt="Employee avatar preview"
                                className="w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full object-cover border-4 border-white shadow-lg bg-slate-100"
                            />

                            <input
                                id="employee-photo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />

                            <label
                                htmlFor="employee-photo-upload"
                                className="absolute bottom-2 right-2 w-12 h-12 flex items-center justify-center rounded-full bg-[#1b2537] text-white cursor-pointer shadow-md border-2 border-white hover:bg-[#25324c] transition-all active:scale-95"
                                title="Upload photo"
                            >
                                <Camera className="w-5 h-5" />
                            </label>
                        </div>

                        <h4 className="mt-4 text-base font-bold text-slate-800 text-center leading-tight">
                            {formData.FullName.trim() || "New Employee"}
                        </h4>
                        <p className="text-xs font-mono text-slate-400 mt-1">
                            {formData.EmployeeNo || "ID assigned on save"}
                        </p>

                        {formData.ProfilePictureFile && (
                            <button
                                type="button"
                                onClick={undoNewPhoto}
                                className="mt-2 text-[11px] text-slate-400 hover:text-rose-500 font-medium transition-colors"
                            >
                                Undo new photo
                            </button>
                        )}

                        <p className="mt-1 text-[10px] text-slate-400 text-center">
                            JPG, PNG or GIF · Max 2MB
                        </p>
                    </aside>

                    {/* ============ RIGHT COLUMN: FORM FIELDS ============ */}
                    <div className="p-5 space-y-4">
                        {serverError && (
                            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-lg px-3 py-2.5">
                                {serverError}
                            </div>
                        )}

                        {positions.length === 0 && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg px-3 py-2.5">
                                No positions exist yet. Add some in Academic
                                Structure → Positions first.
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Maria Clara Santos"
                                value={formData.FullName}
                                onChange={(e) => {
                                    if (!NAME_REGEX.test(e.target.value)) return;
                                    setFormData({
                                        ...formData,
                                        FullName: e.target.value,
                                    });
                                }}
                                className={`${fieldCls} ${errors.FullName
                                        ? "border-rose-400 focus:ring-rose-200"
                                        : ""
                                    }`}
                            />
                            {errors.FullName && (
                                <p className="mt-1 text-[11px] text-rose-500 font-medium">
                                    {errors.FullName}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Position
                                </label>
                                <select
                                    required
                                    value={formData.PositionID}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            PositionID: e.target.value,
                                        })
                                    }
                                    className={fieldCls}
                                >
                                    <option value="" disabled>
                                        Select a position
                                    </option>
                                    {positions.map((p) => (
                                        <option
                                            key={p.PositionID}
                                            value={p.PositionID}
                                        >
                                            {p.PositionTitle}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="flex items-baseline gap-x-1 text-xs font-semibold text-slate-600 mb-1 whitespace-nowrap">
                                    <span>Department</span>
                                    <span className="font-normal text-slate-400 text-[11px]">
                                        (Optional)
                                    </span>
                                </label>
                                <select
                                    value={formData.DepartmentID}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            DepartmentID: e.target.value,
                                        })
                                    }
                                    className={fieldCls}
                                >
                                    <option value="">No department</option>
                                    {departments.map((d) => (
                                        <option
                                            key={d.DepartmentID}
                                            value={d.DepartmentID}
                                        >
                                            {d.DepartmentName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="employee@school.edu"
                                value={formData.Email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        Email: e.target.value,
                                    })
                                }
                                className={fieldCls}
                            />
                        </div>

                        <div>
                            <label className="flex items-baseline gap-x-1 text-xs font-semibold text-slate-600 mb-1 whitespace-nowrap">
                                <span>Phone Number</span>
                                <span className="font-normal text-slate-400 text-[11px]">
                                    (Optional)
                                </span>
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={11}
                                placeholder="09XXXXXXXXX"
                                value={formData.Phone}
                                onChange={(e) => {
                                    const digitsOnly = e.target.value.replace(
                                        /\D/g,
                                        "",
                                    );
                                    if (digitsOnly.length > 11) return;
                                    setFormData({
                                        ...formData,
                                        Phone: digitsOnly,
                                    });
                                }}
                                className={`${fieldCls} ${errors.Phone
                                        ? "border-rose-400 focus:ring-rose-200"
                                        : ""
                                    }`}
                            />
                            {errors.Phone && (
                                <p className="mt-1 text-[11px] text-rose-500 font-medium">
                                    {errors.Phone}
                                </p>
                            )}
                        </div>

                        {mode === "edit" && (
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
                                    className={fieldCls}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        )}

                        <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={saving}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving || positions.length === 0}
                                className="px-4 py-2 text-xs font-semibold bg-[#1b2537] hover:bg-[#25324c] text-white rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {saving ? "Saving..." : submitLabel}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}