// File Path: Frontend\src\modules\time-tracking\Time-Out.jsx

import React from 'react';
import TimeTrackingLayout from './time-tracking-layout';

const SAMPLE_STUDENTS = [
    { id: 'S-2024-012', name: 'Nico Espinosa', course: 'BSBA', year: '4th Year', section: 'Sec D', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { id: 'S-2024-003', name: 'Ana Reyes', course: 'BSEd', year: '4th Year', section: 'Sec A', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { id: 'S-2024-010', name: 'Jasmine Florendo', course: 'BSN', year: '1st Year', section: 'Sec A', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
    { id: 'S-2024-007', name: 'Camille Aquino', course: 'BSCS', year: '2nd Year', section: 'Sec B', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    { id: 'S-2024-008', name: 'Paolo Villanueva', course: 'BSEE', year: '1st Year', section: 'Sec C', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
    { id: 'S-2024-001', name: 'Maria Santos', course: 'BSCS', year: '3rd Year', section: 'Sec A', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { id: 'S-2024-004', name: 'Carlo Mendoza', course: 'BSBA', year: '1st Year', section: 'Sec C', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: 'S-2024-002', name: 'Juan dela Cruz', course: 'BSIT', year: '2nd Year', section: 'Sec B', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' },
];

const INITIAL_RECENT_SCANS = [
    { id: '1', student: SAMPLE_STUDENTS[0], time: '10:48:38 AM', date: 'Sep 25, 2026' },
    { id: '2', student: SAMPLE_STUDENTS[1], time: '05:28:00 PM', date: 'Sep 25, 2026' },
    { id: '3', student: SAMPLE_STUDENTS[2], time: '05:24:00 PM', date: 'Sep 25, 2026' },
    { id: '4', student: SAMPLE_STUDENTS[3], time: '05:19:00 PM', date: 'Sep 25, 2026' },
    { id: '5', student: SAMPLE_STUDENTS[4], time: '05:18:00 PM', date: 'Sep 25, 2026' },
    { id: '6', student: SAMPLE_STUDENTS[5], time: '05:05:00 PM', date: 'Sep 25, 2026' },
    { id: '7', student: SAMPLE_STUDENTS[6], time: '04:49:00 PM', date: 'Sep 25, 2026' },
    { id: '8', student: SAMPLE_STUDENTS[7], time: '04:47:00 PM', date: 'Sep 25, 2026' },
];

export default function TimeOut() {
    return (
        <TimeTrackingLayout
            mode="out"
            accentColor="amber"
            sampleStudents={SAMPLE_STUDENTS}
            initialRecentScans={INITIAL_RECENT_SCANS}
        />
    );
}