import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { X, Printer } from "lucide-react";

export default function StudentBarcodeModal({ student, onClose }) {
    const svgRef = useRef(null);

    useEffect(() => {
        if (svgRef.current && student?.StudentNumber) {
            JsBarcode(svgRef.current, student.StudentNumber, {
                format: "CODE128", // handles letters, numbers, dashes — fits "2025-0001"
                width: 2,
                height: 70,
                displayValue: true,
                fontSize: 14,
                margin: 10,
            });
        }
    }, [student]);

    const handlePrint = () => {
        if (!svgRef.current) return;
        const svgMarkup = new XMLSerializer().serializeToString(svgRef.current);
        const fullName = `${student.FirstName} ${student.LastName}`;

        const printWindow = window.open("", "_blank", "width=420,height=320");
        printWindow.document.write(`
            <html>
                <head><title>Student Barcode - ${student.StudentNumber}</title></head>
                <body style="text-align:center; font-family: sans-serif; margin-top: 24px;">
                    <div style="font-weight:bold; font-size:14px; margin-bottom:4px;">${fullName}</div>
                    <div style="font-size:11px; color:#666; margin-bottom:12px;">${student.StudentNumber}</div>
                    ${svgMarkup}
                    <script>
                        window.onload = function () {
                            window.print();
                            window.close();
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
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

                    <div className="flex justify-center bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <svg ref={svgRef}></svg>
                    </div>

                    <button
                        onClick={handlePrint}
                        className="mt-5 w-full flex items-center justify-center space-x-2 bg-[#1b2537] hover:bg-[#25324c] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm active:scale-95"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Print Barcode</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
