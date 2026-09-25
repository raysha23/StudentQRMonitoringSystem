// File Path: Frontend\src\modules\time-tracking\ScanRecordCard.jsx

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function ScanRecordCard({ record, modeLabel, theme, animateFrom = 'left' }) {
    const slideClass = animateFrom === 'left' ? 'slide-in-from-left-4' : 'slide-in-from-right-4';

    return (
        <div
            className={`bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200 shrink-0 w-72 animate-in fade-in ${slideClass} duration-300`}
        >
            {/* Accent header strip */}
            <div className={`${theme.bg} px-5 py-2 flex items-center justify-between`}>
                <div className="flex items-center gap-1.5 text-white">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{modeLabel} Recorded</span>
                </div>
                <span className="text-[10px] font-medium text-white/80">{record.date}</span>
            </div>

            <div className="p-5 flex flex-col items-center text-center">
                <img
                    src={record.student.avatar}
                    alt={record.student.name}
                    className={`w-20 h-20 rounded-full object-cover ring-4 ${theme.ring2} ring-offset-2 shadow-sm mb-3`}
                />
                <h3 className="text-base font-bold text-slate-800 leading-tight">{record.student.name}</h3>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5 mb-3">{record.student.id}</p>

                <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        {record.student.course}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        {record.student.year}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        Section {record.student.section.replace('Sec ', '')}
                    </span>
                </div>

                <div className={`w-full rounded-xl ${theme.softBg} py-3`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                        Recorded Time
                    </p>
                    <p className={`text-2xl font-black tracking-tight font-mono tabular-nums ${theme.text}`}>
                        {record.time}
                    </p>
                </div>
            </div>
        </div>
    );
}