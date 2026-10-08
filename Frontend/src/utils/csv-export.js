// path: Frontend/src/utils/excel-export.js
import ExcelJS from "exceljs";
import { parseScannedAt } from "./global-helper";
import { AlignCenter } from "lucide-react";

const HEADER_FILL = "1B2537"; // matches your app's dark navy accent
const HEADER_FONT_COLOR = "FFFFFF";

const buildLogRow = (log) => {
    const scannedDate = parseScannedAt(log.ScannedAt);
    const datePart = scannedDate
        ? scannedDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "—";
    const timePart = scannedDate
        ? scannedDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
          })
        : "—";

    const p = log.person ?? {};
    return [
        p.number ?? "—",
        p.name || "—",
        p.type ?? "—",
        p.group ?? "—",
        p.subgroup ?? "—",
        p.schoolYear ?? "—",
        p.year ?? "—",
        log.LogType,
        datePart,
        timePart,
    ];
};

export async function exportLogsToExcel(logs, fromDate, toDate) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "School Monitoring System";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Attendance Report", {
        views: [{ state: "frozen", ySplit: 5 }], // freeze everything above the header row
    });

    // ---- Title block ----
    sheet.mergeCells("A1:J1");
    sheet.getCell("A1").value = `Monitoring Report (${fromDate} to ${toDate})`;
    sheet.getCell("A1").font = { size: 14, bold: true };
    sheet.getCell("A1").alignment = {
        horizontal: "center",
        vertical: "middle",
    };

    sheet.mergeCells("A2:J2");
    sheet.getCell("A2").value =
        `Generated: ${new Date().toLocaleString("en-US")}`;
    sheet.getCell("A2").font = {
        size: 10,
        italic: true,
        color: { argb: "FF64748B" },
    };
    sheet.getCell("A2").alignment = {
        horizontal: "center",
        vertical: "middle",
    };

    sheet.mergeCells("A3:J3");
    sheet.getCell("A3").value = `Total Records: ${logs.length}`;
    sheet.getCell("A3").font = { size: 10, bold: true };
    sheet.getCell("A3").alignment = {
        horizontal: "center",
        vertical: "middle",
    };

    // Row 4 left blank as a spacer

    // ---- Column widths (this is what actually fixes cramped/hidden text) ----
    sheet.columns = [
        { key: "idNumber", width: 18 },
        { key: "name", width: 26 },
        { key: "person", width: 12 },
        { key: "group", width: 32 },
        { key: "subgroup", width: 24 },
        { key: "schoolYear", width: 14 },
        { key: "year", width: 8 },
        { key: "type", width: 12 },
        { key: "date", width: 16 },
        { key: "time", width: 14 },
    ];

    // ---- Header row (row 5) ----
    const headerRow = sheet.getRow(5);
    headerRow.values = [
        "ID NUMBER",
        "NAME",
        "PERSON",
        "COURSE / DEPT",
        "SECTION / POSITION",
        "SCHOOL YEAR",
        "YEAR",
        "TYPE",
        "DATE",
        "TIME",
    ];
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: HEADER_FONT_COLOR } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: HEADER_FILL },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
            top: { style: "thin", color: { argb: "FFCBD5E1" } },
            bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
        };
    });
    headerRow.height = 22;

    // ---- Data rows ----
    logs.forEach((log) => {
        const row = sheet.addRow(buildLogRow(log));
        row.eachCell((cell, colNumber) => {
            cell.alignment = { vertical: "middle" };
            cell.border = {
                bottom: { style: "hair", color: { argb: "FFE2E8F0" } },
            };
            // Color-code the TYPE column (7th column) like your app's badges
            if (colNumber === 8) {
                cell.font = {
                    bold: true,
                    color: {
                        argb:
                            cell.value === "TIME IN" ? "FF2563EB" : "FFB45309",
                    },
                };
            }
        });
    });

    // Alternate row shading for readability
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 5 && (rowNumber - 5) % 2 === 0) {
            row.eachCell((cell) => {
                if (!cell.fill || cell.fill.fgColor?.argb !== HEADER_FILL) {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFF8FAFC" },
                    };
                }
            });
        }
    });

    // ---- Generate and trigger download ----
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Attendance_Report_${fromDate}_to_${toDate}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
