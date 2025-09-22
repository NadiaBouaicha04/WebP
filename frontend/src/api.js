import axios from "axios";

// URL de ton backend Flask
const API_URL = "http://127.0.0.1:5000/api"; // <-- /api, pas /api/auth

const api = axios.create({
  baseURL: API_URL,
});

export default api;
