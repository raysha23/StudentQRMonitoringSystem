import api from "./client";

export const getStudentLogs = () => api.get("/student-logs");

export const getStudentLog = (id) => api.get(`/student-logs/${id}`);

export const createStudentLog = (data) => api.post("/student-logs", data);

export const updateStudentLog = (id, data) =>
    api.put(`/student-logs/${id}`, data);

export const deleteStudentLog = (id) => api.delete(`/student-logs/${id}`);
