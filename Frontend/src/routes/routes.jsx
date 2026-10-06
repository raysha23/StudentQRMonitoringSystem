import { User, Clock, FileText, Briefcase, BookOpen } from "lucide-react";
import StudentManagementModule from "../modules/student-management/Student-Management";
import TimeTracking from "../modules/time-tracking/TimeTracking";
import ReportManagement from "../modules/report/Report-Management";
import EmployeeManagement from "../modules/employee/EmployeeManagement";
import AcademicStructure from "../modules/academic-structure/academicStructure";

export const routes = [
    {
        id: "student-management",
        label: "Student Management",
        icon: User,
        component: StudentManagementModule,
    },
    {
        id: "employee-management",
        label: "Personnel",
        sublabel: "Employee Management",
        icon: Briefcase,
        component: EmployeeManagement,
    },
    {
        id: "time-tracking",
        label: "Time Tracking",
        sublabel: "Live Scanner",
        icon: Clock,
        component: TimeTracking,
    },
    {
        id: "academic-structure",
        label: "Academic Structure",
        sublabel: "Programs & Sections",
        icon: BookOpen,
        component: AcademicStructure,
    },
    {
        id: "report-management",
        label: "Report Management",
        icon: FileText,
        component: ReportManagement,
    },
];