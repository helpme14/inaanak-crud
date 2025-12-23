function hasMessage(obj: unknown): obj is { message: string } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "message" in obj &&
    typeof (obj as { message: unknown }).message === "string"
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import api from "../../lib/axios";

import { NinongDetailsModal } from "../../components/ninong/NinongDetailsModal";

import { AxiosError } from "axios";

type StatusType = "pending" | "approved" | "released" | "rejected";

interface Registration {
  id: number;
  reference_number: string;
  inaanak_name: string;
  inaanak_birthdate: string;
  relationship: string;
  created_at: string;
  status: StatusType;
  guardian?: {
    name: string;
    email: string;
    contact_number: string;
    address: string;
  };
}

type RegistrationDetails = Registration & {
  rejection_reason?: string;
  live_photo_path?: string;
  video_path?: string;
  qr_code_path?: string;
};

export default function NinongRegistrations() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Registration[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalId, setModalId] = useState<number | null>(null);
  const [modalData, setModalData] = useState<RegistrationDetails | null>(null);
  const [, setModalLoading] = useState(false);
  const [, setModalError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api.get("/ninong/registrations");
      setItems(res.data?.data ?? []);
    } catch (e: unknown) {
      if (
        typeof e === "object" &&
        e !== null &&
        "isAxiosError" in e &&
        (e as AxiosError).isAxiosError &&
        (e as AxiosError).response?.data
      ) {
        const data: unknown = (e as AxiosError).response?.data;
        if (hasMessage(data)) {
          setError(data.message);
        } else {
          setError("Failed to load registrations");
        }
      } else {
        setError("Failed to load registrations");
      }
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openModal = async (id: number) => {
    setModalId(id);
    setModalLoading(true);
    setModalError(null);
    setModalData(null);
    try {
      const res = await api.get(`/registrations/${id}`);
      setModalData(res.data?.data ?? null);
    } catch (e: unknown) {
      if (
        typeof e === "object" &&
        e !== null &&
        "isAxiosError" in e &&
        (e as AxiosError).isAxiosError &&
        (e as AxiosError).response?.data
      ) {
        const data: unknown = (e as AxiosError).response?.data;
        if (hasMessage(data)) {
          setModalError(data.message);
        } else {
          setModalError("Failed to load details");
        }
      } else {
        setModalError("Failed to load details");
      }
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalId(null);
    setModalData(null);
    setModalError(null);
    setModalLoading(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-amber-50 via-red-50 to-green-50">
      <div className="max-w-5xl mx-auto">
        <div className="p-0 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-green-50">
            <button
              onClick={() => navigate("/ninong/dashboard")}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:text-gray-900 hover:border-gray-300"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              My Registrations
            </h1>
            <div className="w-[140px]" />
          </div>
          <div className="p-6">
            <p className="mb-6 text-gray-600">
              Registrations associated with your invite codes.
            </p>

            {error && (
              <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-600">
                    <th className="py-2">Reference</th>
                    <th className="py-2">Child</th>
                    <th className="py-2">Birthdate</th>
                    <th className="py-2">Relationship</th>
                    <th className="py-2">Guardian</th>
                    <th className="py-2">Created</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2 font-mono">{r.reference_number}</td>
                      <td className="py-2">{r.inaanak_name}</td>
                      <td className="py-2">
                        {new Date(r.inaanak_birthdate).toLocaleDateString()}
                      </td>
                      <td className="py-2 capitalize">{r.relationship}</td>
                      <td className="py-2">{r.guardian?.name ?? "—"}</td>
                      <td className="py-2">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => openModal(r.id)}
                          className="flex items-center gap-1 font-medium text-green-600 transition-colors hover:text-green-700"
                        >
                          <Eye className="w-4 h-4" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td className="py-3 text-gray-600" colSpan={7}>
                        No registrations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for registration details */}
      <NinongDetailsModal
        open={modalId !== null}
        onClose={closeModal}
        data={modalData as any}
      />
    </div>
  );
}
