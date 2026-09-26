import React, { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { X, Download, Loader2, AlertTriangle } from "lucide-react";
import { getStudentBarcode } from "../../../api/student-barcode-api";

export default function StudentBarcodeModal({ student, onClose }) {
    const svgRef = useRef(null);
    const [barcode, setBarcode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Fetch the real barcode value from the backend
    useEffect(() => {
        let cancelled = false;
        if (!student?.StudentID) return;

        setLoading(true);
        setError(null);
        setBarcode(null);

        getStudentBarcode(student.StudentID)
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
    }, [student?.StudentID]);

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
        if (!svgRef.current || !barcode) return;

        const fullName = `${student.FirstName} ${student.LastName}`;
        const padding = 20;
        const headerHeight = 60; // space reserved for name + student number text

        // Read the SVG's actual rendered size so the canvas matches it exactly
        const svgRect = svgRef.current.getBoundingClientRect();
        const svgWidth = svgRect.width || 300;
        const svgHeight = svgRect.height || 100;

        const svgMarkup = new XMLSerializer().serializeToString(svgRef.current);
        const svgBlob = new Blob([svgMarkup], {
            type: "image/svg+xml;charset=utf-8",
        });
        const svgUrl = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = svgWidth + padding * 2;
            canvas.height = svgHeight + headerHeight + padding * 2;

            const ctx = canvas.getContext("2d");

            // White background (canvases default to transparent)
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Name + student number header text
            ctx.textAlign = "center";
            ctx.fillStyle = "#1e293b";
            ctx.font = "bold 16px sans-serif";
            ctx.fillText(fullName, canvas.width / 2, padding + 18);

            ctx.fillStyle = "#64748b";
            ctx.font = "12px sans-serif";
            ctx.fillText(student.StudentNumber, canvas.width / 2, padding + 38);

            // Draw the barcode itself below the header text
            ctx.drawImage(
                img,
                padding,
                headerHeight + padding,
                svgWidth,
                svgHeight,
            );

            URL.revokeObjectURL(svgUrl);

            canvas.toBlob((blob) => {
                if (!blob) return;
                const downloadUrl = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = downloadUrl;
                link.download = `barcode-${student.StudentNumber}.png`;
                link.click();
                URL.revokeObjectURL(downloadUrl);
            }, "image/png");
        };
        img.src = svgUrl;
    };

    if (!student) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                        Student Barcode
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 text-center">
                    <h4 className="font-bold text-slate-800 text-sm">
                        {student.FirstName} {student.LastName}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mb-4">
                        {student.StudentNumber}
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
