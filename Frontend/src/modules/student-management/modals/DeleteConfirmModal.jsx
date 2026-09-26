// File path: Frontend\src\modules\student-management\modals\DeleteConfirmModal.jsx

import React from "react";
import { AlertTriangle } from "lucide-react";

export default function DeleteConfirmModal({
    title = "Delete Record",
    message = "Are you sure you want to delete this record? This action cannot be undone.",
    confirmLabel = "Delete",
    onConfirm,
    onClose,
}) {
    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                    </div>

                    <h3 className="font-bold text-slate-800 text-sm">
                        {title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="px-5 pb-5 flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
