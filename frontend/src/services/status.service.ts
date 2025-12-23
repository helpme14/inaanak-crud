import api from "../lib/axios";

export interface StatusCheckResponse {
  reference_number: string;
  inaanak_name: string;
  status: "pending" | "approved" | "released" | "rejected";
  created_at: string;
  updated_at: string;
  guardian_email: string;
  rejection_reason?: string;
}

class StatusService {
  async checkStatus(
    referenceNumber: string,
    email: string
  ): Promise<StatusCheckResponse> {
    const response = await api.get<{
      success: boolean;
      data: StatusCheckResponse;
    }>(`/registrations/check-status/${referenceNumber}`, {
      params: { email },
    });
    return response.data.data;
  }
}

export default new StatusService();
