import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    Accept: "application/json",
  },
  withCredentials: false,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData - let axios/browser handle it
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const path = typeof url === "string" ? url : "";
      const isAuthEndpoint =
        /\/admin\/login|\/guardian\/login|\/guardian\/register/.test(path);
      const isOnLoginPage =
        typeof window !== "undefined" &&
        window.location?.pathname === "/admin/login";

      // Do not auto-redirect on 401 for auth endpoints or when already on login page
      if (!isAuthEndpoint && !isOnLoginPage) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        window.location.href = "/admin/login";
      }
    }

    if (error.response?.status === 403) {
      const url = error.config?.url || "";
      const path = typeof url === "string" ? url : "";
      const isAuthEndpoint =
        /\/admin\/login|\/guardian\/login|\/guardian\/register/.test(path);
      const isOnLoginPage =
        typeof window !== "undefined" &&
        window.location?.pathname === "/admin/login";

      if (!isAuthEndpoint && !isOnLoginPage) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        localStorage.removeItem("user_type");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
