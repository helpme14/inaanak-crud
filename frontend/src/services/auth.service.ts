import api from "../lib/axios";
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from "../types/auth";

// Normalize varying backend auth payloads to a consistent shape
function normalizeAuthPayload(payload: any): { token?: string; user?: User } {
  if (!payload) return {};
  // Common shapes:
  // 1) { token, user }
  // 2) { data: { token, user } }
  // 3) { data: { token, admin } }
  // 4) { token, admin }
  const data = payload.data ?? payload;
  const token: string | undefined = data.token ?? payload.token;
  const user: User | undefined =
    data.user ?? data.admin ?? payload.user ?? payload.admin;

  return { token, user };
}

class AuthService {
  async loginAdmin(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post("/admin/login", credentials);
    const { token, user } = normalizeAuthPayload(response.data);
    if (token) {
      localStorage.setItem("auth_token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("user_type", "admin");
    }
    return {
      token: token ?? "",
      user: (user as User) ?? (this.getCurrentUser() as User),
      message: response.data.message,
    };
  }

  async loginGuardian(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post("/guardian/login", credentials);
    const { token, user } = normalizeAuthPayload(response.data);
    if (token) {
      localStorage.setItem("auth_token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("user_type", "guardian");
    }
    return {
      token: token ?? "",
      user: (user as User) ?? (this.getCurrentUser() as User),
      message: response.data.message,
    };
  }

  async registerGuardian(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post("/guardian/register", data);
    const { token, user } = normalizeAuthPayload(response.data);
    if (token) {
      localStorage.setItem("auth_token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("user_type", "guardian");
    }
    return {
      token: token ?? "",
      user: (user as User) ?? (this.getCurrentUser() as User),
      message: response.data.message,
    };
  }

  async getProfile(): Promise<User> {
    const userType = localStorage.getItem("user_type");
    const endpoint =
      userType === "admin" ? "/admin/profile" : "/guardian/profile";
    const response = await api.get(endpoint);
    const { user } = normalizeAuthPayload(response.data);
    return (user as User) ?? response.data;
  }

  async logout(): Promise<void> {
    const userType = localStorage.getItem("user_type");
    const endpoint =
      userType === "admin" ? "/admin/logout" : "/guardian/logout";
    try {
      await api.post(endpoint);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_type");
    }
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token");
  }

  isAdmin(): boolean {
    return localStorage.getItem("user_type") === "admin";
  }

  isGuardian(): boolean {
    return localStorage.getItem("user_type") === "guardian";
  }
}

export default new AuthService();
