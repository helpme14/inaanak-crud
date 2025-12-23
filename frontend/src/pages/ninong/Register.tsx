import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ninongService from "../../services/ninong.service";

export default function NinongRegister() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await ninongService.register({
        name,
        email,
        password,
        password_confirmation: password2,
      });
      navigate("/ninong/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

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
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
              minLength={8}
            />
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
