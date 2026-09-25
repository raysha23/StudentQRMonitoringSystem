// File Path: Frontend\src\modules\time-tracking\Time-In.jsx

import React from 'react';
import TimeTrackingLayout from './time-tracking-layout';

const SAMPLE_STUDENTS = [
    { id: 'S-2024-004', name: 'Carlo Mendoza', course: 'BSBA', year: '1st Year', section: 'Sec C', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: 'S-2024-009', name: 'Nico Espinosa', course: 'BSBA', year: '2nd Year', section: 'Sec D', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { id: 'S-2024-008', name: 'Paolo Villanueva', course: 'BSEE', year: '1st Year', section: 'Sec C', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
    { id: 'S-2024-007', name: 'Camille Aquino', course: 'BSCS', year: '2nd Year', section: 'Sec B', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    { id: 'S-2024-003', name: 'Ana Reyes', course: 'BSEd', year: '4th Year', section: 'Sec A', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { id: 'S-2024-006', name: 'Miguel Torres', course: 'BSCPE', year: '3rd Year', section: 'Sec D', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
    { id: 'S-2024-001', name: 'Maria Santos', course: 'BSCS', year: '3rd Year', section: 'Sec A', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { id: 'S-2024-010', name: 'Jasmine Florendo', course: 'BSN', year: '1st Year', section: 'Sec A', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
];

const INITIAL_RECENT_SCANS = [
    { id: '1', student: SAMPLE_STUDENTS[0], time: '10:46:59 AM', date: 'Sep 25, 2026' },
    { id: '2', student: SAMPLE_STUDENTS[1], time: '07:57:00 AM', date: 'Sep 25, 2026' },
    { id: '3', student: SAMPLE_STUDENTS[2], time: '07:58:00 AM', date: 'Sep 25, 2026' },
    { id: '4', student: SAMPLE_STUDENTS[3], time: '07:58:00 AM', date: 'Sep 25, 2026' },
    { id: '5', student: SAMPLE_STUDENTS[4], time: '07:45:00 AM', date: 'Sep 25, 2026' },
    { id: '6', student: SAMPLE_STUDENTS[5], time: '07:45:00 AM', date: 'Sep 25, 2026' },
    { id: '7', student: SAMPLE_STUDENTS[6], time: '07:44:00 AM', date: 'Sep 25, 2026' },
    { id: '8', student: SAMPLE_STUDENTS[7], time: '07:42:00 AM', date: 'Sep 25, 2026' },
];

export default function TimeIn() {
    return (
        <TimeTrackingLayout
            mode="in"
            accentColor="blue"
            sampleStudents={SAMPLE_STUDENTS}
            initialRecentScans={INITIAL_RECENT_SCANS}
        />
    );
}