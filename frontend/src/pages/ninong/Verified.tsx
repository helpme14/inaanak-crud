import { Link } from "react-router-dom";

export default function NinongVerified() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-amber-50 via-red-50 to-green-50">
      <div className="w-full max-w-md p-6 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Email Verified
        </h1>
        <p className="mb-6 text-gray-600">
          Your email has been verified successfully.
        </p>
        <Link
          to="/ninong/dashboard"
          className="inline-block px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
