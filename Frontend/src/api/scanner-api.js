import api from "./client";

export const getScanners = () => api.get("/scanners");

export const getScanner = (id) => api.get(`/scanners/${id}`);

export const createScanner = (data) => api.post("/scanners", data);

export const updateScanner = (id, data) => api.put(`/scanners/${id}`, data);

export const deleteScanner = (id) => api.delete(`/scanners/${id}`);
