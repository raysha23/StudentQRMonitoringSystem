// File Path: Frontend\src\api\person-log-api.js
import api from "./client";

export const getPersonLogs = (from, to) =>
    api.get("/person-logs", { params: { from, to } });

export const getTodayPersonLogs = () => api.get("/person-logs/today");

export const scanBarcode = (payload) => api.post("/scan", payload);
