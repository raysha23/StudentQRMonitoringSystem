// File Path: Frontend\src\api\person-barcode-api.js
import api from "./client";

export const getStudentBarcode = (studentId) =>
    api.get(`/students/${studentId}/barcode`);

export const reissueStudentBarcode = (studentId) =>
    api.post(`/students/${studentId}/barcode/reissue`);

export const getEmployeeBarcode = (employeeId) =>
    api.get(`/employees/${employeeId}/barcode`);

export const reissueEmployeeBarcode = (employeeId) =>
    api.post(`/employees/${employeeId}/barcode/reissue`);