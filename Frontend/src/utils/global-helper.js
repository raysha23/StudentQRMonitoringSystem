// path: Frontend/src/utils/global-helper.js

// Robustly parses a ScannedAt value. Laravel sometimes returns a MySQL-style
// "2026-09-26 08:00:00" timestamp (space instead of "T"), which some browsers
// fail to parse as a valid Date, silently producing an invalid date.
export const parseScannedAt = (value) => {
    if (!value) return null;
    const normalized =
        typeof value === "string" ? value.replace(" ", "T") : value;
    const parsed = new Date(normalized);
    return isNaN(parsed.getTime()) ? null : parsed;
};

// "3:45 PM" — no seconds. Used for table/list rows.
export const formatTime12Hour = (date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;
    return `${hours}:${minutes} ${ampm}`;
};

// "3:45:12 PM" — with seconds. Used for the live clock banner.
export const formatTime12HourWithSeconds = (date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;
    return `${hours}:${minutes}:${seconds} ${ampm}`;
};

// "Sep 27, 2026"
export const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
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