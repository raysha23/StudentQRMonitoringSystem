// File path: Frontend\src\api\student-api.js
import api from "./client";

export const getStudents = (params) => api.get("/students", { params });

export const getStudentCounts = () => api.get("/students/counts");

export const getStudent = (id) => api.get(`/students/${id}`);

export const createStudent = (data) => api.post("/students", data);

export const updateStudent = (id, data) => api.post(`/students/${id}`, data);

export const deleteStudent = (id) => api.delete(`/students/${id}`);

export const restoreStudent = (id) => api.patch(`/students/${id}/restore`);
