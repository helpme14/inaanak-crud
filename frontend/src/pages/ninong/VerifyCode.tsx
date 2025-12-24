import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ninongService from "../../services/ninong.service";

export default function NinongVerifyCode() {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await ninongService.verifyCode(code);
      if (res.success) {
        setSuccess("Email verified successfully.");
        // update local storage user to reflect verified state
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const u = JSON.parse(userStr);
          u.email_verified_at = new Date().toISOString();
          localStorage.setItem("user", JSON.stringify(u));
        }
        setTimeout(() => navigate("/ninong/verified", { replace: true }), 800);
      } else {
        setError(res.message || "Verification failed");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "Invalid or expired code.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-red-50 to-green-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-red-50">
          <button
            onClick={() => navigate("/ninong/dashboard")}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:text-gray-900 hover:border-gray-300"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-gray-900">Verify Email</h1>
          <div className="hidden sm:block sm:w-32" />
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Enter the 6-digit code sent to your email.
          </p>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Verification Code
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 tracking-widest text-center"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
                required
              />
            </div>
            <button
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 font-semibold"
              disabled={submitting}
            >
              {submitting ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
