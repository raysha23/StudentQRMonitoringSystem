// File Path: Frontend\src\routes\routes.jsx
import { User, Clock, FileText } from 'lucide-react';
import StudentManagementModule from '../modules/student-management/Student-Management';
import TimeIn from '../modules/time-tracking/Time-In';
import TimeOut from '../modules/time-tracking/Time-Out';
import ReportManagement from '../modules/report/Report-Management';

export const routes = [
    {
        id: 'student-management',
        label: 'Student Management',
        icon: User,
        component: StudentManagementModule,
    },
    {
        id: 'time-in',
        label: 'Time In',
        sublabel: 'Live Scanner',
        icon: Clock,
        component: TimeIn,
    },
    {
        id: 'time-out',
        label: 'Time Out',
        sublabel: 'Live Scanner',
        icon: Clock,
        component: TimeOut,
    },
    {
        id: 'report-management',
        label: 'Report Management',
        icon: FileText,
        component: ReportManagement,
    },
];