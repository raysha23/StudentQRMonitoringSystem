// File path: Frontend\src\utils\general-modal\RestoreConfirmationModal.jsx

import React, { useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { getErrorMessage } from "../../api/academic-management-api";

export default function RestoreConfirmationModal({
    title = "Restore",
    message,
    confirmLabel = "Restore",
    onConfirm,
    onClose,
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);
        try {
            await onConfirm(); // parent closes the modal on success
        } catch (err) {
            setError(getErrorMessage(err, "Something went wrong."));
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={loading ? undefined : onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-40"
                    title="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <RotateCcw className="w-5 h-5" />
                </div>

                <h3 className="text-base font-extrabold text-slate-800">
                    {title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {message}
                </p>

                {error && (
                    <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl px-3 py-2">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition disabled:opacity-60"
                    >
                        {loading ? "Restoring..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
