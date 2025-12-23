"use client";

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Download,
  Eye,
  Loader,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { StatusBadge } from "../../components/feedback/StatusBadge";
import registrationService from "../../services/registration.service";

interface RegistrationDetails {
  id: number;
  reference_number: string;
  guardian: {
    name: string;
    email: string;
    contact_number: string;
    address: string;
  };
  inaanak_name: string;
  inaanak_birthdate: string;
  relationship: string;
  status: "pending" | "approved" | "released" | "rejected";
  live_photo_path?: string;
  video_path?: string;
  qr_code_path?: string;
  created_at: string;
}

interface FilePreview {
  type: "live_photo" | "video" | "qr_code" | null;
  url: string;
}

export default function InaanakDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [registration, setRegistration] = useState<RegistrationDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<FilePreview>({ type: null, url: "" });
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    const fetchRegistration = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Use the admin endpoint with full backend URL
        const response = await fetch(
          `http://localhost:8000/api/admin/registrations/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );

        if (response.status === 401) {
          navigate("/admin/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load registration");
        }

        const data = await response.json();
        setRegistration(data.data);
      } catch (err: any) {
        setError(err?.message || "Failed to load registration");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistration();
  }, [id, navigate]);

  const handlePreview = async (
    fileType: "live_photo" | "video" | "qr_code"
  ) => {
    if (!registration) return;

    try {
      const fileUrl = `http://localhost:8000/api/admin/registrations/${registration.id}/download/${fileType}`;
      const response = await fetch(fileUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) throw new Error("Preview failed");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      // Clean up previous preview url
      if (preview.url) URL.revokeObjectURL(preview.url);

      setPreview({ type: fileType, url: objectUrl });
    } catch (err) {
      console.error("Preview error", err);
      alert("Unable to preview file. Please try downloading instead.");
    }
  };

  const handleDownload = async (
    fileType: "live_photo" | "video" | "qr_code"
  ) => {
    if (!registration) return;

    try {
      setIsDownloading(fileType);
      const fileUrl = `http://localhost:8000/api/admin/registrations/${registration.id}/download/${fileType}`;

      // Fetch and download using the API endpoint
      const response = await fetch(fileUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileType}-${registration.reference_number}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    if (!registration || isUpdating) return;

    let rejectionReason: string | undefined;
    if (status === "rejected") {
      rejectionReason =
        window.prompt("Enter rejection reason (optional):") || undefined;
    }

    try {
      setIsUpdating(true);
      const updated = await registrationService.updateStatus(
        registration.id,
        status,
        rejectionReason
      );
      setRegistration((prev) => (prev ? { ...prev, ...updated } : prev));
    } catch (err) {
      console.error("Status update error", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-gray-600">
            {error || "Registration not found"}
          </p>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="font-medium text-red-600 hover:text-red-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const files = [
    {
      key: "live_photo",
      label: "Live Photo",
      exists: !!registration.live_photo_path,
    },
    { key: "video", label: "Video", exists: !!registration.video_path },
    { key: "qr_code", label: "QR Code", exists: !!registration.qr_code_path },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl px-6 py-4 mx-auto sm:px-8">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 mb-4 font-medium text-gray-700 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">Reference Number</p>
              <h1 className="font-mono text-3xl font-bold text-gray-900">
                {registration.reference_number}
              </h1>
            </div>
            <StatusBadge status={registration.status} size="lg" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl px-6 py-8 mx-auto space-y-6 sm:px-8">
        {/* Guardian Card */}
        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-amber-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Guardian Information
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="mb-1 text-sm text-gray-600">Full Name</p>
                <p className="font-semibold text-gray-900">
                  {registration.guardian.name}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-600">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a
                    href={`mailto:${registration.guardian.email}`}
                    className="font-medium text-red-600 hover:text-red-700"
                  >
                    {registration.guardian.email}
                  </a>
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-600">Contact Number</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {registration.guardian.contact_number}
                  </span>
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-600">Address</p>
                <div className="flex gap-2">
                  <MapPin className="flex-shrink-0 w-4 h-4 mt-1 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {registration.guardian.address}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inaanak Card */}
        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-amber-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Inaanak Information
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="mb-1 text-sm text-gray-600">Child's Name</p>
                <p className="font-semibold text-gray-900">
                  {registration.inaanak_name}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-600">Date of Birth</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {new Date(
                      registration.inaanak_birthdate
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-600">Relationship</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {registration.relationship}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Card */}
        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-amber-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Submitted Documents
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {files.map(({ key, label, exists }) => (
                <div
                  key={key}
                  className={`border rounded-lg p-4 ${
                    exists
                      ? "border-gray-200 bg-white"
                      : "border-gray-200 bg-gray-50 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <p className="font-semibold text-gray-900">{label}</p>
                  </div>
                  <p className="mb-3 text-xs text-gray-600">
                    {exists ? "File uploaded" : "No file uploaded"}
                  </p>
                  {exists && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handlePreview(key)}
                        className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm font-medium text-blue-600 transition-all border border-blue-300 rounded-lg hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownload(key)}
                        disabled={isDownloading === key}
                        className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm font-medium text-red-600 transition-all border border-red-300 rounded-lg hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {isDownloading === key ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Download
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-amber-50">
            <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-3 h-3 mt-2 bg-red-600 rounded-full" />
                <div>
                  <p className="font-semibold text-gray-900">
                    Registration Submitted
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(registration.created_at).toLocaleDateString()} at{" "}
                    {new Date(registration.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pb-8">
          <button
            onClick={() => handleStatusUpdate("rejected")}
            disabled={isUpdating}
            className="inline-flex items-center justify-center flex-1 gap-2 px-6 py-3 font-semibold text-gray-900 transition-all border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
          >
            <XCircle className="w-5 h-5" />
            {isUpdating ? "Updating..." : "Reject"}
          </button>
          <button
            onClick={() => handleStatusUpdate("approved")}
            disabled={isUpdating}
            className="inline-flex items-center justify-center flex-1 gap-2 px-6 py-3 font-semibold text-white transition-all bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-60"
          >
            <CheckCircle2 className="w-5 h-5" />
            {isUpdating ? "Updating..." : "Approve"}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {preview.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-5xl overflow-y-auto bg-white rounded-lg max-h-[85vh]">
            <div className="sticky top-0 flex items-center justify-between p-6 bg-white border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {preview.type === "live_photo"
                  ? "Live Photo"
                  : preview.type === "qr_code"
                  ? "QR Code"
                  : "Video"}
              </h2>
              <button
                onClick={() => {
                  if (preview.url) URL.revokeObjectURL(preview.url);
                  setPreview({ type: null, url: "" });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {preview.type === "video" ? (
                <video
                  controls
                  className="w-full max-h-[75vh] rounded-lg object-contain"
                  src={preview.url}
                />
              ) : (
                <img
                  src={preview.url}
                  alt={preview.type}
                  className="w-full max-h-[75vh] rounded-lg object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
