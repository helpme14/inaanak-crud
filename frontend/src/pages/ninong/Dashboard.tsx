import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import ninongService from "../../services/ninong.service";

export default function NinongDashboard() {
  const [mustVerify, setMustVerify] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [invitesCount, setInvitesCount] = useState<number>(0);
  const [registrationsCount, setRegistrationsCount] = useState<number>(0);

  useEffect(() => {
    // Infer from localStorage session; could fetch profile if needed
    const user = localStorage.getItem("user");
    const verified = user ? JSON.parse(user)?.email_verified_at : null;
    setMustVerify(!verified);
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [invRes, regRes] = await Promise.all([
          api.get("/ninong/invites"),
          api.get("/ninong/registrations"),
        ]);
        setInvitesCount(
          Array.isArray(invRes.data?.data) ? invRes.data.data.length : 0
        );
        setRegistrationsCount(
          Array.isArray(regRes.data?.data) ? regRes.data.data.length : 0
        );
      } catch (_) {
        // ignore errors; counts will remain 0 or be gated by verification
      }
    };
    if (!mustVerify) fetchCounts();
  }, [mustVerify]);

  const resend = async () => {
    if (cooldown > 0) return;
    setSending(true);
    try {
      await ninongService.resendVerification();
      setCooldown(60);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-amber-50 via-red-50 to-green-50">
      <div className="max-w-4xl mx-auto">
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Ninong Dashboard
            </h1>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:text-gray-900 hover:border-gray-300"
            >
              Home
            </a>
          </div>
          <p className="mb-6 text-gray-600">
            Monitor your invites and registrations.
          </p>

          {mustVerify && (
            <div className="p-4 mb-6 border rounded-lg border-amber-200 bg-amber-50 text-amber-800">
              Please verify your email to access invites and registrations.
              <div className="mt-3">
                <button
                  onClick={resend}
                  disabled={sending || cooldown > 0}
                  className="px-4 py-2 font-semibold text-white rounded-lg bg-amber-600 disabled:bg-amber-400 hover:bg-amber-700"
                >
                  {sending
                    ? "Sending..."
                    : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend Verification Email"}
                </button>
                <button
                  onClick={() => (window.location.href = "/ninong/verify")}
                  className="px-4 py-2 ml-3 font-semibold rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200"
                >
                  Enter Verification Code
                </button>
              </div>
            </div>
          )}

          {!mustVerify && (
            <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
              <div className="p-4 bg-white border border-gray-200 rounded-xl">
                <div className="text-sm text-gray-600">Invites</div>
                <div className="text-2xl font-bold text-gray-900">
                  {invitesCount}
                </div>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-xl">
                <div className="text-sm text-gray-600">Registrations</div>
                <div className="text-2xl font-bold text-gray-900">
                  {registrationsCount}
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              to={mustVerify ? "#" : "/ninong/invites"}
              onClick={(e) => mustVerify && e.preventDefault()}
              className={`block p-5 rounded-xl border transition bg-white ${
                mustVerify
                  ? "border-gray-200 opacity-60 cursor-not-allowed"
                  : "border-gray-200 hover:border-red-300"
              }`}
            >
              <h3 className="font-semibold text-gray-900">My Invites</h3>
              <p className="text-sm text-gray-600">
                Create and manage your invite codes
              </p>
            </Link>
            <Link
              to={mustVerify ? "#" : "/ninong/registrations"}
              onClick={(e) => mustVerify && e.preventDefault()}
              className={`block p-5 rounded-xl border transition bg-white ${
                mustVerify
                  ? "border-gray-200 opacity-60 cursor-not-allowed"
                  : "border-gray-200 hover:border-green-300"
              }`}
            >
              <h3 className="font-semibold text-gray-900">My Registrations</h3>
              <p className="text-sm text-gray-600">
                View registrations linked to your codes
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
