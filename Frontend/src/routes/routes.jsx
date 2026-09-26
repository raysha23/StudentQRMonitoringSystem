import { User, Clock, FileText } from "lucide-react";
import StudentManagementModule from "../modules/student-management/Student-Management";
import TimeTracking from "../modules/time-tracking/TimeTracking";
import ReportManagement from "../modules/report/Report-Management";

export const routes = [
    {
        id: "student-management",
        label: "Student Management",
        icon: User,
        component: StudentManagementModule,
    },
    {
        id: "time-tracking",
        label: "Time Tracking",
        sublabel: "Live Scanner",
        icon: Clock,
        component: TimeTracking,
    },
    {
        id: "report-management",
        label: "Report Management",
        icon: FileText,
        component: ReportManagement,
    },
];
