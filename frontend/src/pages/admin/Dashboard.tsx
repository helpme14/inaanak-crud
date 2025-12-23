"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, Eye, Loader, LogOut, Home } from "lucide-react";
import { StatusBadge } from "../../components/feedback/StatusBadge";
import registrationService, {
  type Registration,
} from "../../services/registration.service";
import authService from "../../services/auth.service";

// removed unused PreviewModal interface

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved" | "released" | "rejected"
  >("all");
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await registrationService.getAllRegistrations();
        if (active) setRows(data);
      } catch (e: any) {
        if (active)
          setError(
            e?.response?.data?.message || "Failed to load registrations"
          );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rows.filter((item) => {
      const matchesSearch =
        !term ||
        item.reference_number.toLowerCase().includes(term) ||
        item.inaanak_name.toLowerCase().includes(term) ||
        (item.guardian?.name || "").toLowerCase().includes(term);
      const matchesFilter =
        filterStatus === "all" || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [rows, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((d) => d.status === "pending").length;
    const approvedReleased = rows.filter(
      (d) => d.status === "approved" || d.status === "released"
    ).length;
    const rejected = rows.filter((d) => d.status === "rejected").length;

    return [
      {
        label: "Total Registrations",
        value: total,
        color: "bg-blue-50 text-blue-600",
      },
      { label: "Pending", value: pending, color: "bg-amber-50 text-amber-600" },
      {
        label: "Approved + Released",
        value: approvedReleased,
        color: "bg-green-50 text-green-600",
      },
      { label: "Rejected", value: rejected, color: "bg-red-50 text-red-600" },
    ];
  }, [rows]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl sm:px-8">
          <h1 className="text-xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Go to home"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={async () => {
                try {
                  await authService.logout();
                } finally {
                  navigate("/admin/login");
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 mx-auto max-w-7xl sm:px-8">
        {/* Stats Cards */}
        <div className="grid gap-4 mb-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-lg p-4`}>
              <p className="text-sm font-medium opacity-75">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="p-6 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
              <input
                type="text"
                placeholder="Search by name, reference number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 transition-all border border-gray-300 rounded-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as
                      | "all"
                      | "pending"
                      | "approved"
                      | "released"
                      | "rejected"
                  )
                }
                className="px-4 py-2 pr-8 transition-all bg-white border border-gray-300 rounded-lg outline-none appearance-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="released">Released</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute w-5 h-5 text-gray-400 pointer-events-none right-2 top-3" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-sm font-semibold text-left text-gray-900">
                  Reference No.
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left text-gray-900">
                  Guardian
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left text-gray-900">
                  Inaanak
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left text-gray-900">
                  Submitted
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left text-gray-900">
                  Status
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="w-5 h-5 text-red-600 animate-spin" />
                      Loading registrations...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : filteredRows.length > 0 ? (
                filteredRows.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-mono text-sm text-gray-900">
                      {item.reference_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.guardian?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.inaanak_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => navigate(`/admin/details/${item.id}`)}
                        className="flex items-center gap-1 font-medium text-red-600 transition-colors hover:text-red-700"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No registrations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
