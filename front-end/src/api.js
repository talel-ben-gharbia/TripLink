import axios from "axios";
import { API_URL } from "./config";

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors consistently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Backend returned an error response
      const { data, status } = error.response;

      // Handle standardized error format
      if (data.error || data.errors) {
        error.message =
          data.error ||
          (Array.isArray(data.errors) ? data.errors[0] : data.errors);
        error.errors = data.errors || [];
      }

      // Handle 401 - Unauthorized (token expired/invalid)
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Only redirect if not on a public page
        if (
          window.location.pathname !== "/" &&
          !window.location.pathname.includes("/email-verification")
        ) {
          window.location.href = "/";
        }
      }
    } else if (error.request) {
      // Request was made but no response received
      error.message = `Could not connect to server. Please make sure the backend is running on ${API_URL}`;
    } else {
      // Something else happened
      error.message = error.message || "An unexpected error occurred";
    }

    return Promise.reject(error);
  }
);

export default api;
