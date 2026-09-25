import React from "react";
import { X } from "lucide-react";

export default function StudentViewModal({
    student,
    courseName,
    sectionName,
    onClose,
}) {
    if (!student) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                        Student Profile Card
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 text-center">
                    <h4 className="font-bold text-slate-800 text-base">
                        {student.FirstName} {student.MiddleName}{" "}
                        {student.LastName} {student.Suffix}
                    </h4>
                    <p className="font-mono text-xs text-slate-400 font-medium">
                        {student.StudentNumber}
                    </p>

                    <div className="mt-4 inline-block">
                        {student.Status === "Enrolled" ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                Enrolled
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                                Not Enrolled
                            </span>
                        )}
                    </div>

                    <div className="mt-6 bg-slate-50 rounded-xl p-4 text-left space-y-2 text-xs">
                        <div className="flex justify-between border-b border-slate-200/60 pb-2">
                            <span className="text-slate-400 font-medium">
                                Course:
                            </span>
                            <span className="font-bold text-slate-700">
                                {courseName(student.CourseID)}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-2">
                            <span className="text-slate-400 font-medium">
                                Section & Year:
                            </span>
                            <span className="font-bold text-slate-700">
                                {sectionName(student.SectionID)} - Year{" "}
                                {student.YearLevel}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-2">
                            <span className="text-slate-400 font-medium">
                                Gender:
                            </span>
                            <span className="font-medium text-slate-700">
                                {student.Gender || "—"}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-2">
                            <span className="text-slate-400 font-medium">
                                Date of Birth:
                            </span>
                            <span className="font-medium text-slate-700">
                                {student.DateOfBirth || "—"}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-2">
                            <span className="text-slate-400 font-medium">
                                Address:
                            </span>
                            <span className="font-medium text-slate-700 text-right">
                                {student.Address || "—"}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-2">
                            <span className="text-slate-400 font-medium">
                                Email:
                            </span>
                            <span className="font-medium text-slate-700">
                                {student.Email}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">
                                Phone:
                            </span>
                            <span className="font-medium text-slate-700">
                                {student.ContactNumber}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
