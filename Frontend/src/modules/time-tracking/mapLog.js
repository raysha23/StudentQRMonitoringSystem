export function mapLogToRecord(log) {
    const student = log.student || {};
    return {
        id: String(log.LogID),
        time: new Date(log.ScannedAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        }),
        date: new Date(log.ScannedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }),
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

function yearSuffix(n) {
    if (n === 1) return "st";
    if (n === 2) return "nd";
    if (n === 3) return "rd";
    return "th";
}
