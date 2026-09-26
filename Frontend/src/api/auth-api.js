// File path: Frontend\src\api\auth-api.js
import api from "./client";

export async function login(username, password) {
    try {
        const res = await api.post("/login", {
            Username: username,
            Password: password,
        });
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || "Login failed.");
    }
}

export async function logout() {
    const res = await api.post("/logout");
    return res.data;
}

export async function getCurrentUser() {
    const res = await api.get("/me");
    return res.data;
}
