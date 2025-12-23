import api from "../lib/axios";

export interface NinongRegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface NinongLoginData {
  email: string;
  password: string;
}

export interface NinongAuthResponse {
  token: string;
  ninong: any;
  must_verify_email?: boolean;
  message?: string;
}

class NinongService {
  async register(data: NinongRegisterData): Promise<NinongAuthResponse> {
    const res = await api.post("/ninong/register", data);
    const d = res.data?.data ?? res.data;
    if (d?.token) {
      localStorage.setItem("auth_token", d.token);
      localStorage.setItem("user_type", "ninong");
      if (d?.ninong) localStorage.setItem("user", JSON.stringify(d.ninong));
    }
    return {
      token: d?.token ?? "",
      ninong: d?.ninong,
      must_verify_email: d?.must_verify_email,
      message: res.data?.message,
    };
  }

  async login(data: NinongLoginData): Promise<NinongAuthResponse> {
    const res = await api.post("/ninong/login", data);
    const d = res.data?.data ?? res.data;
    if (d?.token) {
      localStorage.setItem("auth_token", d.token);
      localStorage.setItem("user_type", "ninong");
      if (d?.ninong) localStorage.setItem("user", JSON.stringify(d.ninong));
    }
    return {
      token: d?.token ?? "",
      ninong: d?.ninong,
      must_verify_email: d?.must_verify_email,
      message: res.data?.message,
    };
  }

  async resendVerification(): Promise<{ success: boolean; message?: string }> {
    const res = await api.post("/ninong/email/verification-notification");
    return { success: !!res.data?.success, message: res.data?.message };
  }

  async verifyCode(
    code: string
  ): Promise<{ success: boolean; message?: string }> {
    const res = await api.post("/ninong/verify-code", { code });
    return { success: !!res.data?.success, message: res.data?.message };
  }
}

export default new NinongService();
