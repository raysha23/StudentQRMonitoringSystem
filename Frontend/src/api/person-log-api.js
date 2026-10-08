// File Path: Frontend\src\api\person-log-api.js
import api from "./client";

export const getPersonLogs = (params) => api.get("/person-logs", { params });

export const exportPersonLogs = (params) =>
    api.get("/person-logs/export", { params });

export const getTodayPersonLogs = () => api.get("/person-logs/today");

export const scanBarcode = (payload) => api.post("/scan", payload);
