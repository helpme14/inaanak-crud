import { useState } from "react";
import { Modal } from "../ui/Modal";
import { NinongDetailsContent } from "./NinongDetailsContent";
import type { NinongDetailsData } from "./NinongDetailsContent";
import api from "../../lib/axios";
import { Loader } from "lucide-react";

interface FilePreview {
  type: "live_photo" | "video" | "qr_code" | null;
  url: string;
}

interface NinongDetailsModalProps {
  open: boolean;
  onClose: () => void;
  data: NinongDetailsData | null;
}

export function NinongDetailsModal({
  open,
  onClose,
  data,
}: NinongDetailsModalProps) {
  const [preview, setPreview] = useState<FilePreview>({ type: null, url: "" });
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handlePreview = async (
    fileType: "live_photo" | "video" | "qr_code"
  ) => {
    if (!data) return;
    try {
      const response = await api.get(
        `/registrations/${data.id}/download/${fileType}`,
        {
          responseType: "blob",
        }
      );
      const blob = response.data;
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
    if (!data) return;
    try {
      setIsDownloading(fileType);
      const response = await api.get(
        `/registrations/${data.id}/download/${fileType}`,
        {
          responseType: "blob",
        }
      );

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileType}-${data.reference_number}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download file.");
    } finally {
      setIsDownloading(null);
    }
  };

  const handleClosePreview = () => {
    if (preview.url) URL.revokeObjectURL(preview.url);
    setPreview({ type: null, url: "" });
  };

  if (!open) return null;

  return (
    <>
      <Modal open={open} onClose={onClose} maxWidth="max-w-4xl">
        {!data ? (
          <div className="flex items-center justify-center p-12">
            <Loader className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        ) : (
          <NinongDetailsContent
            data={data}
            onPreview={handlePreview}
            onDownload={handleDownload}
            isDownloading={isDownloading}
          />
        )}
      </Modal>

      {/* Preview Modal - nested on top with higher z-index */}
      {preview.type && preview.url && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          style={{ zIndex: 9999 }}
          onClick={handleClosePreview}
        >
          <div
            className="w-full max-w-5xl overflow-y-auto bg-white rounded-lg max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {preview.type === "live_photo"
                  ? "Live Photo"
                  : preview.type === "qr_code"
                  ? "QR Code"
                  : "Video"}
              </h2>
              <button
                onClick={handleClosePreview}
                className="text-2xl font-bold text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {preview.type === "video" ? (
                <video
                  controls
                  className="w-full max-h-[75vh] rounded-lg object-contain bg-black"
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
    </>
  );
}
