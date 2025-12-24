export interface User {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  recaptcha_token?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  contact_number: string;
  address: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuardian: boolean;
  login: (
    credentials: LoginCredentials,
    userType: "admin" | "guardian"
  ) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}
