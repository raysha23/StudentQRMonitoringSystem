import api from "./client";

export const getSchoolYears = () => api.get("/school-years");

export const getSchoolYear = (id) => api.get(`/school-years/${id}`);

export const createSchoolYear = (data) => api.post("/school-years", data);

export const updateSchoolYear = (id, data) =>
    api.put(`/school-years/${id}`, data);

export const deleteSchoolYear = (id) => api.delete(`/school-years/${id}`);
