// File path: Frontend\src\api\client.js
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api",
});

export default api;
