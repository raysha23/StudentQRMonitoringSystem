// File Path: Frontend\src\utils\general-modal\BarCodeModal.jsx
import React, { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { X, Download, Loader2, AlertTriangle } from "lucide-react";
import {
    getStudentBarcode,
    getEmployeeBarcode,
} from "../../api/person-barcode-api";

// Everything that differs between a student and an employee lives here
const PERSON_CONFIG = {
    student: {
        title: "Student Barcode",
        getId: (p) => p.StudentID,
        getName: (p) => `${p.FirstName ?? ""} ${p.LastName ?? ""}`.trim(),
        getNumber: (p) => p.StudentNumber,
        fetchBarcode: (p) => getStudentBarcode(p.StudentID),
    },
    employee: {
        title: "Employee Barcode",
        getId: (p) => p.EmployeeID,
        getName: (p) => p.FullName ?? "",
        getNumber: (p) => p.EmployeeNo,
        fetchBarcode: (p) => getEmployeeBarcode(p.EmployeeID),
    },
};

export default function BarCodeModal({ person, type = "student", onClose }) {
    const config = PERSON_CONFIG[type] ?? PERSON_CONFIG.student;

    const svgRef = useRef(null);
    const [barcode, setBarcode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const personId = person ? config.getId(person) : null;
    const name = person ? config.getName(person) : "";
    const number = person ? config.getNumber(person) : "";

    // 1. Fetch the real barcode value from the backend
    useEffect(() => {
        let cancelled = false;
        if (!personId) return;

        setLoading(true);
        setError(null);
        setBarcode(null);

        config
            .fetchBarcode(person)
            .then((res) => {
                if (!cancelled) setBarcode(res.data);
            })
            .catch((err) => {
                if (!cancelled) {
                    console.error(err);
                    setError(
                        err.response?.data?.message ||
                        "Failed to load barcode.",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [personId, type]);

    // 2. Render JsBarcode once we have the value
    useEffect(() => {
        if (svgRef.current && barcode?.BarcodeValue) {
            try {
                JsBarcode(svgRef.current, barcode.BarcodeValue, {
                    format: barcode.BarcodeFormat || "CODE128",
                    width: 2,
                    height: 70,
                    displayValue: true,
                    fontSize: 14,
                    margin: 10,
                });
            } catch (err) {
                console.error("Barcode render error:", err);
                setError("Invalid barcode format.");
            }
        }
    }, [barcode]);

    const handleDownload = () => {
        if (!barcode?.BarcodeValue) return;

        const canvas = document.createElement("canvas");
        JsBarcode(canvas, barcode.BarcodeValue, {
            format: barcode.BarcodeFormat || "CODE128",
            width: 2,
            height: 40,
            displayValue: true,
            fontSize: 12,
            margin: 20,
            background: "#ffffff",
            lineColor: "#000000",
        });

        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `barcode-${number}.png`;
            link.click();
            URL.revokeObjectURL(url);
        }, "image/png");
    };

    if (!person) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                        {config.title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 text-center">
                    <h4 className="font-bold text-slate-800 text-sm">{name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium mb-4">
                        {number}
                    </p>

                    <div className="flex justify-center items-center bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[130px]">
                        {loading && (
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading barcode...
                            </div>
                        )}

                        {error && !loading && (
                            <div className="flex items-center gap-2 text-rose-600 text-xs font-medium">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <svg
                            ref={svgRef}
                            className={loading || error ? "hidden" : ""}
                        ></svg>
                    </div>

                    {barcode?.BarcodeValue && !loading && !error && (
                        <p className="text-[11px] text-slate-400 font-mono mt-3">
                            {barcode.BarcodeValue}
                        </p>
                    )}

                    <button
                        onClick={handleDownload}
                        disabled={loading || !!error || !barcode}
                        className="mt-5 w-full flex items-center justify-center space-x-2 bg-[#1b2537] hover:bg-[#25324c] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" />
                        <span>Download Barcode</span>
                    </button>
                </div>
            </div>
        </div>
    );
}