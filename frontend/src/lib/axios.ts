import axios from "axios";

// Dedicated API client instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
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

// Handle 401/403 errors for auth flows
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const path = typeof url === "string" ? url : "";
      const isAuthEndpoint =
        /\/admin\/login|\/guardian\/login|\/guardian\/register|\/ninong\/login|\/ninong\/register/.test(
          path
        );
      const isOnLoginPage =
        typeof window !== "undefined" &&
        window.location?.pathname === "/admin/login";

      if (!isAuthEndpoint && !isOnLoginPage) {
        const userType = localStorage.getItem("user_type");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        if (userType === "ninong" || /\/ninong\//.test(path)) {
          window.location.href = "/ninong/login";
        } else if (userType === "guardian") {
          window.location.href = "/";
        } else {
          window.location.href = "/admin/login";
        }
      }
    }

    if (error.response?.status === 403) {
      const url = error.config?.url || "";
      const path = typeof url === "string" ? url : "";
      const isAuthEndpoint =
        /\/admin\/login|\/guardian\/login|\/guardian\/register|\/ninong\/login|\/ninong\/register/.test(
          path
        );
      const isOnLoginPage =
        typeof window !== "undefined" &&
        window.location?.pathname === "/admin/login";

      // Don't logout on 403 for ninong verification routes - they need auth but not verified
      const isUnverifiedNinongRoute = /\/ninong\/(invites|registrations)/.test(
        path
      );
      const user = localStorage.getItem("user");
      const isEmailUnverified = user
        ? !JSON.parse(user)?.email_verified_at
        : false;

      if (
        !isAuthEndpoint &&
        !isOnLoginPage &&
        !(isUnverifiedNinongRoute && isEmailUnverified)
      ) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        localStorage.removeItem("user_type");
        if (/\/ninong\//.test(path)) {
          window.location.href = "/ninong/login";
        } else {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
