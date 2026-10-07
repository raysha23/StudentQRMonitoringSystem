// File Path: Frontend\src\utils\general-modal\DeleteConfirmationModal.jsx
import React, { useEffect, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

/**
 * Global delete confirmation.
 *
 * Props:
 *  - title          heading text
 *  - message        body text
 *  - onConfirm      may be async. If it throws, the error shows inside the
 *                   modal and the modal stays open. On success, the parent
 *                   is responsible for closing it (set its state to null).
 *  - onClose        called on Cancel, the X, Esc, or a backdrop click
 *  - confirmLabel   button text (default "Delete")
 */
export default function DeleteConfirmationModal({
    title = "Delete",
    message = "Are you sure? This action cannot be undone.",
    confirmLabel = "Delete",
    onConfirm,
    onClose,
}) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    // Close on Escape (unless a delete is in progress)
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape" && !deleting) onClose?.();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [deleting, onClose]);

    const handleConfirm = async () => {
        setDeleting(true);
        setError(null);
        try {
            await onConfirm?.();
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to delete. Please try again.",
            );
            setDeleting(false);
        }
        // On success the parent unmounts this modal, so no reset is needed
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !deleting && onClose?.()}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={deleting}
                        className="text-slate-400 hover:text-slate-600 rounded-lg p-1 disabled:opacity-40"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-6 h-6" />
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                        {message}
                    </p>

                    {error && (
                        <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl px-3 py-2 text-left">
                            {error}
                        </div>
                    )}

                    <div className="mt-6 flex items-center justify-center space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={deleting}
                            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={deleting}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {deleting && (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            )}
                            <span>{deleting ? "Deleting..." : confirmLabel}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}