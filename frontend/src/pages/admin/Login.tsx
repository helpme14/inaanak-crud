import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import authService from "../../services/auth.service";
import { useToast, ToastContainer } from "../../hooks/useToast";

declare global {
  interface Window {
    grecaptcha?: any;
  }
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.email || !formData.password) {
        addToast("Please fill in all fields", "warning");
        setLoading(false);
        return;
      }

      // ensure captcha token is present
      let token = captchaToken;
      if (!token && window.grecaptcha && widgetIdRef.current !== null) {
        token = window.grecaptcha.getResponse(widgetIdRef.current);
      }

      if (!token) {
        addToast(
          "Please complete the reCAPTCHA to prove you are not a robot.",
          "warning"
        );
        setLoading(false);
        return;
      }

      await authService.loginAdmin({ ...formData, recaptcha_token: token });
      addToast("Login successful! Redirecting...", "success");

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 500);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Invalid email or password";
      addToast(errorMessage, "error", 15000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (!siteKey) return;
    const scriptSrc = "https://www.google.com/recaptcha/api.js?render=explicit";
    const existing = document.querySelector(`script[src="${scriptSrc}"]`);

    const renderWidget = () => {
      try {
        if (!captchaRef.current) return;
        captchaRef.current.innerHTML = "";
        if (widgetIdRef.current !== null && window.grecaptcha?.reset) {
          try {
            window.grecaptcha.reset(widgetIdRef.current);
          } catch (_) {}
        }
        widgetIdRef.current = window.grecaptcha.render(captchaRef.current, {
          sitekey: siteKey,
          callback: (token: string) => setCaptchaToken(token),
        });
      } catch (e) {
        // ignore
      }
    };

    if (!existing) {
      const s = document.createElement("script");
      s.src = scriptSrc;
      s.async = true;
      s.defer = true;
      s.onload = () => {
        try {
          if (
            window.grecaptcha &&
            typeof window.grecaptcha.ready === "function"
          ) {
            window.grecaptcha.ready(() => renderWidget());
          } else {
            setTimeout(() => renderWidget(), 50);
          }
        } catch (_) {
          setTimeout(() => renderWidget(), 50);
        }
      };
      document.head.appendChild(s);
    } else {
      if (window.grecaptcha) {
        try {
          if (typeof window.grecaptcha.ready === "function") {
            window.grecaptcha.ready(() => renderWidget());
          } else {
            setTimeout(() => renderWidget(), 50);
          }
        } catch (_) {
          setTimeout(() => renderWidget(), 50);
        }
      } else {
        const t = setTimeout(() => {
          try {
            if (
              window.grecaptcha &&
              typeof window.grecaptcha.ready === "function"
            ) {
              window.grecaptcha.ready(() => renderWidget());
            } else if (window.grecaptcha) {
              renderWidget();
            }
          } catch (_) {}
        }, 200);
        return () => clearTimeout(t);
      }
    }

    return () => {
      try {
        if (widgetIdRef.current !== null && window.grecaptcha?.reset) {
          window.grecaptcha.reset(widgetIdRef.current);
        }
      } catch (_) {}
      widgetIdRef.current = null;
    };
  }, []);

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-red-50 via-amber-50 to-green-50">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full shadow-lg bg-gradient-to-br from-red-500 to-red-600">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              Admin Portal
            </h1>
            <p className="text-gray-600">INAANAK Aguinaldo Registration</p>
          </div>

          <div className="p-8 bg-white shadow-xl rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="admin@inaanak.ph"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder=""
                />
              </div>

              <div className="mt-3" ref={captchaRef} />

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 font-semibold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="pt-6 mt-6 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">EYYY-able ba?</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-gray-600 transition-colors hover:text-gray-800"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
