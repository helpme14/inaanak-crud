import api from "../lib/axios";

export interface RegistrationData {
  guardian_name: string;
  guardian_email: string;
  guardian_contact: string;
  guardian_address: string;
  inaanak_name: string;
  inaanak_birthdate: string;
  relationship: string;
  live_photo?: File;
  video?: File;
  qr_code?: File;
}

export interface Registration {
  id: number;
  reference_number: string;
  guardian_id: number;
  inaanak_name: string;
  inaanak_birthdate: string;
  relationship: string;
  live_photo_path?: string;
  video_path?: string;
  qr_code_path?: string;
  status: "pending" | "approved" | "released" | "rejected";
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  guardian?: {
    id: number;
    name: string;
    email: string;
    contact_number: string;
    address: string;
  };
}

class RegistrationService {
  async create(data: RegistrationData): Promise<Registration> {
    const formData = new FormData();
    formData.append("guardian_name", data.guardian_name);
    formData.append("guardian_email", data.guardian_email);
    formData.append("guardian_contact", data.guardian_contact);
    formData.append("guardian_address", data.guardian_address);
    formData.append("inaanak_name", data.inaanak_name);
    formData.append("inaanak_birthdate", data.inaanak_birthdate);
    formData.append("relationship", data.relationship);

    if (data.live_photo) {
      formData.append("live_photo", data.live_photo);
    }
    if (data.video) {
      formData.append("video", data.video);
    }
    if (data.qr_code) {
      formData.append("qr_code", data.qr_code);
    }

    const response = await api.post<{
      success: boolean;
      message: string;
      data: Registration;
    }>("/registrations", formData);
    return response.data.data;
  }

  async getMyRegistrations(): Promise<Registration[]> {
    const response = await api.get<{ success: boolean; data: Registration[] }>(
      "/registrations/my"
    );
    return response.data.data;
  }

  async getById(id: number): Promise<Registration> {
    const response = await api.get<{ success: boolean; data: Registration }>(
      `/registrations/${id}`
    );
    return response.data.data;
  }

  // Admin methods
  async getAllRegistrations(): Promise<Registration[]> {
    const response = await api.get<{ success: boolean; data: Registration[] }>(
      "/admin/registrations"
    );
    return response.data.data;
  }

  async updateStatus(
    id: number,
    status: string,
    rejection_reason?: string
  ): Promise<Registration> {
    const response = await api.put<{
      success: boolean;
      message: string;
      data: Registration;
    }>(`/admin/registrations/${id}/status`, {
      status,
      rejection_reason,
    });
    return response.data.data;
  }
}

export default new RegistrationService();
