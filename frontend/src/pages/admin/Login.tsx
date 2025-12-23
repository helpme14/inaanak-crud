import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import authService from "../../services/auth.service";
import { useToast, ToastContainer } from "../../hooks/useToast";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

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

      await authService.loginAdmin(formData);
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

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 font-semibold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="pt-6 mt-6 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">
                Demo: admin@inaanak.ph / admin123456
              </p>
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
