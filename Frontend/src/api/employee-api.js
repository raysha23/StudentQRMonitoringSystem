// File Path: Frontend\src\api\employee-api.js
import api from "./client";

export const getEmployees = async (status = "Active") =>
    (await api.get("/employees", { params: { status } })).data;

export const getEmployeeCounts = async () =>
    (await api.get("/employees/counts")).data;

export const restoreEmployee = async (id) =>
    (await api.patch(`/employees/${id}/restore`)).data;

// Both calls take FormData because of the profile picture upload
export const createEmployee = async (formData) =>
    (await api.post("/employees", formData)).data;

// PHP can't read multipart data on a real PUT, so we POST with _method=PUT
export const updateEmployee = async (id, formData) => {
    formData.append("_method", "PUT");
    return (await api.post(`/employees/${id}`, formData)).data;
};

export const deleteEmployee = async (id) =>
    (await api.delete(`/employees/${id}`)).data;
