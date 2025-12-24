import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ninongService from "../../services/ninong.service";
import { containsHTML, sanitizeInput } from "../../lib/validations";

export default function NinongRegister() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [xssWarning, setXssWarning] = useState({ name: false, email: false });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) {
      setError("Passwords do not match");
      return;
    }

    // Client-side password strength validation
    const pwStrong = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/;
    if (!pwStrong.test(password)) {
      setPwError(
        "Password must be at least 8 characters and include uppercase, lowercase, number and symbol."
      );
      return;
    }
    setPwError(null);

    // sanitize inputs to avoid accidental HTML
    const safeName = sanitizeInput(name);
    const safeEmail = sanitizeInput(email);
    // ensure captcha token is present
    let token = captchaToken;
    if (!token && window.grecaptcha && widgetIdRef.current !== null) {
      token = window.grecaptcha.getResponse(widgetIdRef.current);
    }

    if (!token) {
      setError("Please complete the reCAPTCHA to prove you are not a robot.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await ninongService.register({
        name: safeName,
        email: safeEmail,
        password,
        password_confirmation: password2,
        recaptcha_token: token ?? undefined,
      });
      navigate("/ninong/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
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
          callback: (t: string) => setCaptchaToken(t),
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
        setTimeout(() => renderWidget(), 50);
      };
      document.head.appendChild(s);
    } else if (window.grecaptcha) {
      setTimeout(() => renderWidget(), 50);
    } else {
      const t = setTimeout(() => {
        if (window.grecaptcha) renderWidget();
      }, 200);
      return () => clearTimeout(t);
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
        <h1 className="mb-1 text-2xl font-bold text-gray-900">
          Ninong Registration
        </h1>
        <p className="mb-6 text-gray-600">Create your account</p>
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Full Name</label>
            <input
              className="w-full px-3 py-2 border rounded-lg"
              value={name}
              onChange={(e) => {
                const v = e.target.value;
                if (containsHTML(v)) {
                  setXssWarning((s) => ({ ...s, name: true }));
                  setName(sanitizeInput(v));
                } else {
                  setXssWarning((s) => ({ ...s, name: false }));
                  setName(v);
                }
              }}
              required
            />
            {xssWarning.name && (
              <div className="mt-2 text-xs text-amber-700">
                HTML tags are not allowed and were removed.
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              className="w-full px-3 py-2 border rounded-lg"
              type="email"
              value={email}
              onChange={(e) => {
                const v = e.target.value;
                if (containsHTML(v)) {
                  setXssWarning((s) => ({ ...s, email: true }));
                  setEmail(sanitizeInput(v));
                } else {
                  setXssWarning((s) => ({ ...s, email: false }));
                  setEmail(v);
                }
              }}
              required
            />
            {xssWarning.email && (
              <div className="mt-2 text-xs text-amber-700">
                HTML tags are not allowed and were removed.
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Password</label>
            <input
              className="w-full px-3 py-2 border rounded-lg"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            {pwError && (
              <div className="mt-2 text-sm text-red-700">{pwError}</div>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Confirm Password
            </label>
            <input
              className="w-full px-3 py-2 border rounded-lg"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="mt-3" ref={captchaRef} />
          <button
            className="w-full py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <div className="mt-4 text-sm text-center">
          <span className="text-gray-600">Already have an account?</span>{" "}
          <Link
            to="/ninong/login"
            className="font-medium text-red-600 hover:text-red-700"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
