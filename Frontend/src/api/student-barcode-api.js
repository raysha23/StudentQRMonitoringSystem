import api from "./client";

export const getStudentBarcodes = () => api.get("/student-barcodes");

export const createStudentBarcode = (data) =>
    api.post("/student-barcodes", data);

export const updateStudentBarcode = (id, data) =>
    api.put(`/student-barcodes/${id}`, data);

export const deleteStudentBarcode = (id) =>
    api.delete(`/student-barcodes/${id}`);

export const getStudentBarcode = (studentId) =>
    api.get(`/students/${studentId}/barcode`);

export const reissueStudentBarcode = (studentId) =>
    api.post(`/students/${studentId}/barcode/reissue`);
