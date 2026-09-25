import api from "./client";

export const getSections = () => api.get("/sections");

export const getSection = (id) => api.get(`/sections/${id}`);

export const createSection = (data) => api.post("/sections", data);

export const updateSection = (id, data) => api.put(`/sections/${id}`, data);

export const deleteSection = (id) => api.delete(`/sections/${id}`);
