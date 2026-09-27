import {
    formatDate,
    formatTime12Hour,
    parseScannedAt,
    yearSuffix,
} from "../../utils/global-helper";
export function mapLogToRecord(log) {
    const student = log.student || {};
    return {
        id: String(log.LogID),
        logType: log.LogType, // "TIME IN" or "TIME OUT" — now decided server-side
        __scannedAt: log.ScannedAt, // raw timestamp, kept only for sorting merged lists
        time: formatTime12Hour(parseScannedAt(log.ScannedAt)),
        date: formatDate(parseScannedAt(log.ScannedAt)),
        student: {
            id: student.StudentNumber,
            name: `${student.FirstName ?? ""} ${student.LastName ?? ""}`.trim(),
            course:
                student.course?.CourseCode ?? student.course?.CourseName ?? "—",
            year: student.YearLevel
                ? `${student.YearLevel}${yearSuffix(student.YearLevel)} Year`
                : "—",
            section: student.section?.SectionName ?? "—",
            avatar:
                student.ProfilePicture ||
                `https://api.dicebear.com/9.x/initials/svg?seed=${student.FirstName}-${student.LastName}`,
        },
    };
}
