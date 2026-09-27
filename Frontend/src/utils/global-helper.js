// path: Frontend/src/utils/global-helper.js

const PHILIPPINE_TIMEZONE = "Asia/Manila";

// Treat database timestamps without an offset as Philippine local time.
export const parseScannedAt = (value) => {
    if (!value) return null;
    const normalized = typeof value === "string" ? value.replace(" ", "T") : value;
    const hasTimezone =
        typeof normalized !== "string" ||
        /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized);
    const valueWithTimezone =
        typeof normalized === "string" && !hasTimezone
            ? `${normalized}+08:00`
            : normalized;
    const parsed = new Date(valueWithTimezone);
    return isNaN(parsed.getTime()) ? null : parsed;
};

// "3:45 PM" — no seconds. Used for table/list rows.
export const formatTime12Hour = (date) => {
    return new Intl.DateTimeFormat("en-US", {
        timeZone: PHILIPPINE_TIMEZONE,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(date);
};

// "3:45:12 PM" — with seconds. Used for the live clock banner.
export const formatTime12HourWithSeconds = (date) => {
    return new Intl.DateTimeFormat("en-US", {
        timeZone: PHILIPPINE_TIMEZONE,
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    }).format(date);
};

// "Sep 27, 2026"
export const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
        timeZone: PHILIPPINE_TIMEZONE,
        month: "short",
        day: "numeric",
        year: "numeric",
    });

// "Sep 27, 2026, 2:30 PM" — combined date + time, from a raw ScannedAt string.
export const formatLogDateTime = (value) => {
    const scannedDate = parseScannedAt(value);
    if (!scannedDate) return "—";
    return `${formatDate(scannedDate)}, ${formatTime12Hour(scannedDate)}`;
};

export function yearSuffix(n) {
    if (n === 1) return "st";
    if (n === 2) return "nd";
    if (n === 3) return "rd";
    return "th";
}