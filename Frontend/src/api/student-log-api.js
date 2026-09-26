import api from "./client";

export const getStudentLogs = (fromDate, toDate) =>
    api.get("/student-logs", {
        params: {
            FromDate: fromDate,
            ToDate: toDate,
        },
    });

export const getStudentLog = (id) => api.get(`/student-logs/${id}`);

export const createStudentLog = (data) => api.post("/student-logs", data);

export const updateStudentLog = (id, data) =>
    api.put(`/student-logs/${id}`, data);

export const deleteStudentLog = (id) => api.delete(`/student-logs/${id}`);

export const scanBarcode = (data) => api.post("/scan", data);

export const getTodayLogs = (logType) =>
    api.get("/student-logs/today", { params: { LogType: logType } });
