import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../lib/axios";

interface Invite {
  id: number;
  code: string;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
}

export default function NinongInvites() {
  const navigate = useNavigate();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [limit, setLimit] = useState<number | "">("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api.get("/ninong/invites");
      setInvites(res.data?.data ?? []);
    } catch (e: any) {
      if (e?.response?.status === 403) {
        setError("Please verify your email to access invites.");
      } else {
        setError(e?.response?.data?.message || "Failed to load invites");
      }
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post("/ninong/invites", {
        usage_limit: limit === "" ? null : Number(limit),
        expires_at: expiresAt || null,
      });
      setLimit("");
      setExpiresAt("");
      await load();
    } catch (e: any) {
      if (e?.response?.status === 403) {
        setError("Please verify your email before creating invite codes.");
      } else {
        setError(e?.response?.data?.message || "Failed to create invite");
      }
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-amber-50 via-red-50 to-green-50">
      <div className="max-w-4xl mx-auto">
        <div className="p-0 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-green-50">
            <button
              onClick={() => navigate("/ninong/dashboard")}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:text-gray-900 hover:border-gray-300"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-gray-900">My Invites</h1>
            <div className="w-[140px]" />
          </div>
          <div className="p-6">
            <p className="mb-6 text-gray-600">
              Generate codes to share with guardians.
            </p>

            {error && (
              <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                {error}
              </div>
            )}

            <form
              onSubmit={createInvite}
              className="grid gap-4 mb-6 md:grid-cols-3"
            >
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Usage Limit
                </label>
                <input
                  className="w-full px-3 py-2 border rounded-lg"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value as any)}
                  placeholder="e.g., 10 or blank"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Expires At
                </label>
                <input
                  className="w-full px-3 py-2 border rounded-lg"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button className="w-full py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">
                  Create Invite
                </button>
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-600">
                    <th className="py-2">Code</th>
                    <th className="py-2">Used</th>
                    <th className="py-2">Usage Limit</th>
                    <th className="py-2">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((inv) => (
                    <tr key={inv.id} className="border-t">
                      <td className="py-2 font-mono">{inv.code}</td>
                      <td className="py-2">{inv.used_count}</td>
                      <td className="py-2">{inv.usage_limit ?? "—"}</td>
                      <td className="py-2">
                        {inv.expires_at
                          ? new Date(inv.expires_at).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                  {invites.length === 0 && (
                    <tr>
                      <td className="py-3 text-gray-600" colSpan={4}>
                        No invites yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
