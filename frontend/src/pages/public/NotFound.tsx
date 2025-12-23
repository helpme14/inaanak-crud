import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-green-50 px-6">
      <div className="max-w-md w-full bg-white shadow-sm rounded-xl border border-gray-200 p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Page not found
        </h1>
        <p className="text-gray-600 mb-6">
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 transition"
          >
            Go Home
          </button>
          <button
            onClick={() => navigate("/admin/login")}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}
