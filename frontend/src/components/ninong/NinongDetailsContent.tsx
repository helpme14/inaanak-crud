import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Eye,
  Download,
  Loader,
} from "lucide-react";
import { StatusBadge } from "../../components/feedback/StatusBadge";

export interface NinongDetailsData {
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

interface NinongDetailsContentProps {
  data: NinongDetailsData;
  onPreview: (type: "live_photo" | "video" | "qr_code") => void;
  onDownload: (type: "live_photo" | "video" | "qr_code") => void;
  isDownloading?: string | null;
}

export function NinongDetailsContent({
  data,
  onPreview,
  onDownload,
  isDownloading,
}: NinongDetailsContentProps) {
  const files = [
    { key: "live_photo", label: "Live Photo", exists: !!data.live_photo_path },
    { key: "video", label: "Video", exists: !!data.video_path },
    { key: "qr_code", label: "QR Code", exists: !!data.qr_code_path },
  ] as const;

  return (
    <div className="bg-white rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm text-gray-600">Reference Number</p>
            <h1 className="font-mono text-2xl font-bold text-gray-900">
              {data.reference_number}
            </h1>
          </div>
          <StatusBadge status={data.status} size="lg" />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 space-y-6">
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
                  {data.guardian.name}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-600">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a
                    href={`mailto:${data.guardian.email}`}
                    className="font-medium text-red-600 hover:text-red-700"
                  >
                    {data.guardian.email}
                  </a>
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-600">Contact Number</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {data.guardian.contact_number}
                  </span>
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-600">Address</p>
                <div className="flex gap-2">
                  <MapPin className="flex-shrink-0 w-4 h-4 mt-1 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {data.guardian.address}
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
                  {data.inaanak_name}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-600">Date of Birth</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {new Date(data.inaanak_birthdate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-600">Relationship</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {data.relationship}
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
                        onClick={() => onPreview(key)}
                        className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm font-medium text-blue-600 transition-all border border-blue-300 rounded-lg hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" /> Preview
                      </button>
                      <button
                        onClick={() => onDownload(key)}
                        disabled={isDownloading === key}
                        className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm font-medium text-red-600 transition-all border border-red-300 rounded-lg hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {isDownloading === key ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />{" "}
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" /> Download
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
                    {new Date(data.created_at).toLocaleDateString()} at{" "}
                    {new Date(data.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
