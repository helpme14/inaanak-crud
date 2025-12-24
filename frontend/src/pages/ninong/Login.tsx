import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ninongService from "../../services/ninong.service";

declare global {
  interface Window {
    grecaptcha?: any;
  }
}

export default function NinongLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // ensure captcha token is present
    let token = captchaToken;
    if (!token && window.grecaptcha && widgetIdRef.current !== null) {
      token = window.grecaptcha.getResponse(widgetIdRef.current);
    }

    if (!token) {
      setError("Please complete the reCAPTCHA to prove you are not a robot.");
      setLoading(false);
      return;
    }
    try {
      const res = await ninongService.login({
        email,
        password,
        recaptcha_token: token,
      });
      if (res.must_verify_email) {
        navigate("/ninong/dashboard", { replace: true });
      } else {
        navigate("/ninong/dashboard", { replace: true });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (!siteKey) return;
    // avoid inserting the script multiple times
    const scriptSrc = "https://www.google.com/recaptcha/api.js?render=explicit";
    const existing = document.querySelector(`script[src="${scriptSrc}"]`);

    const renderWidget = () => {
      try {
        if (!captchaRef.current) return;
        // clear previous contents (helps when HMR or navigation leaves remnants)
        captchaRef.current.innerHTML = "";
        // reset existing widget if any
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
        // ignore render errors
      }
    };

    if (!existing) {
      const s = document.createElement("script");
      s.src = scriptSrc;
      s.async = true;
      s.defer = true;
      s.onload = () => {
        // prefer grecaptcha.ready when available
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
      // If grecaptcha is available and exposes ready(), use it; otherwise try to render after short delay
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
        // script present but grecaptcha not initialized yet — retry briefly
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
      // cleanup: try reset widget
      try {
        if (widgetIdRef.current !== null && window.grecaptcha?.reset) {
          window.grecaptcha.reset(widgetIdRef.current);
        }
      } catch (_) {}
      widgetIdRef.current = null;
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-amber-50 via-red-50 to-green-50">
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </button>
      </div>
      <div className="w-full max-w-md p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Ninong Login</h1>
        <p className="mb-6 text-gray-600">Access your dashboard</p>
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              className="w-full px-3 py-2 border rounded-lg"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Password</label>
            <input
              className="w-full px-3 py-2 border rounded-lg"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mt-3" ref={captchaRef} />
          <button
            className="w-full py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-4 text-sm text-center">
          <span className="text-gray-600">No account?</span>{" "}
          <Link
            to="/ninong/register"
            className="font-medium text-red-600 hover:text-red-700"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
