import api from "./client";

export const getStudentBarcodes = () => api.get("/student-barcodes");

export const getStudentBarcode = (id) => api.get(`/student-barcodes/${id}`);

export const createStudentBarcode = (data) =>
    api.post("/student-barcodes", data);

export const updateStudentBarcode = (id, data) =>
    api.put(`/student-barcodes/${id}`, data);

export const deleteStudentBarcode = (id) =>
    api.delete(`/student-barcodes/${id}`);
