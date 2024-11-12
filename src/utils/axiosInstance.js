import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";

const axiosInstance = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: true, // Ensures cookies are sent if needed
});

// Request interceptor to attach the token from cookies
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("user-token"); // Fetch token from cookies
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token expiry
axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        handleTokenExpiry();
      } else {
        handleError(error);
      }
    } else {
      console.error("Network or other error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Function to handle token expiry
const handleTokenExpiry = () => {
  Cookies.remove("user-token");
  Cookies.remove("token-expiry");
  toast.warning("Your session has expired. Please log in again.");
};

// Centralized error handling
const handleError = (error) => {
  if (error.response) {
    console.error("Response error:", {
      message: error.message,
      data: error.response.data,
      status: error.response.status,
    });
    toast.error(
      `Error: ${error.response.data.message || "Something went wrong"}`
    );
  } else if (error.request) {
    console.error("Request error:", error.request);
    toast.error("Network error. Please check your connection.");
  } else {
    console.error("Unexpected error:", error.message);
    toast.error("An unexpected error occurred.");
  }
};

export default axiosInstance;
