// File Path: Frontend\src\modules\time-tracking\TimeTracking.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { QrCode, CheckCircle, Menu, X, AlertTriangle } from "lucide-react";
import ScanRecordCard from "./ScanRecordCard";
import { scanBarcode, getTodayLogs } from "../../api/student-log-api";
import { mapLogToRecord } from "./mapLog";

const THEMES = {
    "TIME IN": {
        text: "text-blue-600",
        bg: "bg-blue-600",
        bgOpacity: "bg-blue-600/80",
        bgHover: "hover:bg-blue-700",
        border: "border-blue-500",
        ring: "focus:ring-blue-500",
        ring2: "ring-blue-200",
        softBg: "bg-blue-50",
        dashedBorder: "border-blue-400",
        dashedText: "text-blue-600",
        dashedHover: "hover:bg-blue-50",
        cardHeaderBg: "bg-blue-700/50",
        cardBorder: "border-blue-700",
        pulse: "bg-emerald-300",
        clockText: "text-blue-900",
        scannerBg: "bg-white",
    },
    "TIME OUT": {
        text: "text-amber-700",
        bg: "bg-amber-600",
        bgOpacity: "bg-amber-600/80",
        bgHover: "hover:bg-amber-700",
        border: "border-amber-500",
        ring: "focus:ring-amber-500",
        ring2: "ring-amber-200",
        softBg: "bg-amber-50",
        dashedBorder: "border-amber-400",
        dashedText: "text-amber-600",
        dashedHover: "hover:bg-amber-100/50",
        cardHeaderBg: "bg-amber-700/60",
        cardBorder: "border-amber-700",
        pulse: "bg-amber-300",
        clockText: "text-slate-800",
        scannerBg: "bg-amber-50/30",
    },
};

// Neutral theme used only for chrome that isn't tied to a specific scan result
// (the page header, the scanner input box itself before anything is scanned).
const NEUTRAL_THEME = THEMES["TIME IN"];

const CARD_LIFETIME_MS = 5000;

export default function TimeTracking({ scannerId = 1 }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [scanInput, setScanInput] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState(null);
    const [isRecentOpen, setIsRecentOpen] = useState(true);
    const [recentScans, setRecentScans] = useState([]);
    const [activeCards, setActiveCards] = useState([]);
    const dismissTimers = useRef({});
    const inputRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(
        () => () => {
            Object.values(dismissTimers.current).forEach(clearTimeout);
        },
        [],
    );

    // Load today's logs (both Time In and Time Out) on mount
    useEffect(() => {
        let cancelled = false;
        Promise.all([getTodayLogs("TIME IN"), getTodayLogs("TIME OUT")])
            .then(([inRes, outRes]) => {
                if (cancelled) return;
                const merged = [...inRes.data, ...outRes.data]
                    .map(mapLogToRecord)
                    .sort(
                        (a, b) =>
                            new Date(b.__scannedAt || 0) -
                            new Date(a.__scannedAt || 0),
                    );
                setRecentScans(merged);
            })
            .catch((err) => console.error("Failed to load today's logs", err));
        return () => {
            cancelled = true;
        };
    }, []);

    // Keep the scanner input focused so hardware scanners (acting as keyboard input) always land here
    useEffect(() => {
        inputRef.current?.focus();
    }, [isScanning]);

    const handleScanSubmit = useCallback(
        async (e) => {
            if (e) e.preventDefault();

            const value = scanInput.trim();
            if (!value || isScanning) return;

            setIsScanning(true);
            setScanError(null);

            try {
                const res = await scanBarcode({
                    BarcodeValue: value,
                    ScannerID: scannerId || 1,
                });

                const record = mapLogToRecord(res.data);
                setRecentScans((prev) => [record, ...prev]);
                setActiveCards((prev) => [record, ...prev]);

                dismissTimers.current[record.id] = setTimeout(() => {
                    setActiveCards((prev) =>
                        prev.filter((c) => c.id !== record.id),
                    );
                    delete dismissTimers.current[record.id];
                }, CARD_LIFETIME_MS);
            } catch (err) {
                const message =
                    err.response?.data?.message || "Scan failed. Try again.";
                setScanError(message);
                setTimeout(() => setScanError(null), 4000);
            } finally {
                setScanInput("");
                setIsScanning(false);
            }
        },
        [scanInput, isScanning, scannerId],
    );

    const formatTime = (date) =>
        date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });

    const formatDate = (date) =>
        date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    return (
        <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans space-y-6">
            {/* Module Header */}
            <div>
                <h1 className="text-lg font-bold text-slate-800 leading-none">
                    Time Tracking
                </h1>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                    {formatDate(currentTime)} - School Administration
                </p>
            </div>

            {/* Real-time Clock Banner — neutral, no fixed mode anymore */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300"></span>
                    </span>
                    <div className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-800 text-white">
                        Auto Time In / Time Out
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-[11px] font-semibold tracking-[0.15em] text-slate-400 uppercase mb-1">
                        {formatDate(currentTime)}
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight tabular-nums font-mono leading-none text-slate-800">
                        {formatTime(currentTime)}
                    </h1>
                </div>
            </div>

            {/* MAIN: 2 columns — scanner/cards column + sliding sidebar (equal height) */}
            <div className="flex flex-col lg:flex-row gap-4 max-h-[550px]">
                {/* COLUMN 1: Recorded cards, each themed by its own scan result */}
                <div className="flex-1 min-w-0 flex flex-col">
                    {activeCards.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic border border-dashed rounded-2xl text-center">
                            Waiting for next scan...
                        </div>
                    ) : (
                        <div className="flex-1 relative rounded-2xl border border-slate-200 p-4">
                            <div className="h-full flex space-x-4 overflow-x-auto items-start scroll-smooth">
                                {activeCards.map((record) => (
                                    <ScanRecordCard
                                        key={record.id}
                                        record={record}
                                        modeLabel={record.logType}
                                        theme={
                                            THEMES[record.logType] ||
                                            NEUTRAL_THEME
                                        }
                                        animateFrom="left"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Collapsed handle — shown only when sidebar is closed */}
                {!isRecentOpen && (
                    <button
                        onClick={() => setIsRecentOpen(true)}
                        className="flex items-center justify-center w-10 shrink-0 bg-white border border-slate-200 rounded-xl shadow-xs hover:bg-slate-50 transition"
                        title="Show recent scans"
                    >
                        <Menu className="w-5 h-5 text-slate-400" />
                    </button>
                )}

                {/* COLUMN 2: Sliding sidebar — combined Time In + Time Out feed */}
                <div
                    className={`bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
                        isRecentOpen
                            ? "w-full lg:w-80 p-5 opacity-100"
                            : "w-0 p-0 opacity-0 border-0"
                    }`}
                >
                    <button
                        onClick={() => setIsRecentOpen(false)}
                        className="w-full flex justify-between items-center pb-4 mb-2 border-b border-slate-100 shrink-0"
                    >
                        <div className="flex items-center space-x-2">
                            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap">
                                Recent Scans
                            </h2>
                            <span className="text-[11px] text-slate-400 whitespace-nowrap">
                                {recentScans.length} records
                            </span>
                        </div>
                        <X className="w-4 h-4 text-slate-400" />
                    </button>

                    <div className="flex-1 divide-y divide-slate-100 overflow-y-auto pr-1">
                        {recentScans.map((record) => {
                            const rowTheme =
                                THEMES[record.logType] || NEUTRAL_THEME;
                            return (
                                <div
                                    key={record.id}
                                    className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-1 rounded-md transition"
                                >
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={record.student.avatar}
                                            alt={record.student.name}
                                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                        />
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800 leading-tight">
                                                {record.student.name}
                                            </h4>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {record.student.course} ·{" "}
                                                {record.student.section}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`text-[9px] font-bold uppercase tracking-wider ${rowTheme.text} block`}
                                        >
                                            {record.logType}
                                        </span>
                                        <span
                                            className={`text-xs font-bold ${rowTheme.text} block`}
                                        >
                                            {record.time}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            {record.date}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* QR/Barcode Scanner Box — neutral, since the type isn't known until after the scan */}
            <div className="bg-white rounded-xl border-2 border-slate-300 p-6 shadow-xs space-y-4">
                <div className="flex items-center text-slate-700 text-sm font-semibold space-x-2">
                    <QrCode className="w-5 h-5" />
                    <span>Barcode Scanner</span>
                </div>

                <form onSubmit={handleScanSubmit} className="flex space-x-2">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Scan student barcode..."
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        disabled={isScanning}
                        autoFocus
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 placeholder-slate-400 disabled:opacity-60"
                    />
                    <button
                        type="submit"
                        disabled={isScanning}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition disabled:opacity-60"
                    >
                        {isScanning ? "Scanning..." : "Scan"}
                    </button>
                </form>

                {scanError && (
                    <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xs font-medium">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{scanError}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
