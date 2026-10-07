// File Path: Frontend\src\api\academic-management-api.js
import api from "./client";

// Builds list / get / create / update / remove for one resource
const crud = (resource) => ({
    list: async () => (await api.get(`/${resource}`)).data,
    get: async (id) => (await api.get(`/${resource}/${id}`)).data,
    create: async (payload) => (await api.post(`/${resource}`, payload)).data,
    update: async (id, payload) =>
        (await api.put(`/${resource}/${id}`, payload)).data,
    remove: async (id) => (await api.delete(`/${resource}/${id}`)).data,
});

export const programsApi = crud("courses"); // "Programs" tab
export const departmentsApi = crud("departments");
export const positionsApi = crud("positions");
export const subjectsApi = crud("subjects"); // "Courses" tab
export const sectionsApi = crud("sections");

// Reads Laravel's 422 (validation), 409 (blocked delete) and network errors
export const getErrorMessage = (err, fallback = "Something went wrong.") => {
    const data = err?.response?.data;

    if (data?.errors) {
        const first = Object.values(data.errors).flat()[0];
        if (first) return first;
    }
    if (data?.message) return data.message;
    if (err?.request && !err?.response) {
        return "Cannot reach the server. Is the backend running?";
    }
    return fallback;
};