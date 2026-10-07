import {
    formatDate,
    formatTime12Hour,
    parseScannedAt,
    yearSuffix,
} from "../../utils/global-helper";

const avatarFor = (name, picture) =>
    picture ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`;

export function mapLogToRecord(log) {
    const scannedAt = parseScannedAt(log.ScannedAt);
    const base = {
        id: String(log.LogID),
        logType: log.LogType,
        personType: log.PersonType, // "Student" | "Employee"
        __scannedAt: log.ScannedAt,
        time: formatTime12Hour(scannedAt),
        date: formatDate(scannedAt),
    };

    // Employee log
    if (log.employee) {
        const e = log.employee;
        const position = e.position?.PositionTitle;
        const department = e.department?.DepartmentName;
        const name = e.FullName ?? "Unknown";

        return {
            ...base,
            student: {
                id: e.EmployeeNo,
                name,
                subtitle: [position, department].filter(Boolean).join(" · ") || "—",
                tags: [position, department].filter(Boolean),
                avatar: avatarFor(name, e.ProfilePictureUrl),
            },
        };
    }

    // Student log
    const s = log.student || {};
    const name = `${s.FirstName ?? ""} ${s.LastName ?? ""}`.trim() || "Unknown";
    const course = s.course?.CourseCode ?? s.course?.CourseName;
    const year = s.YearLevel ? `${s.YearLevel}${yearSuffix(s.YearLevel)} Year` : null;
    const section = s.section?.SectionName;

    return {
        ...base,
        student: {
            id: s.StudentNumber,
            name,
            subtitle: [course, section].filter(Boolean).join(" · ") || "—",
            tags: [course, year, section && `Section ${section}`].filter(Boolean),
            avatar: avatarFor(name, s.ProfilePictureUrl),
        },
    };
}