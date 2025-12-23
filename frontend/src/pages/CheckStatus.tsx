import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { StatusBadge } from "../components/feedback/StatusBadge";
import statusService, {
  type StatusCheckResponse,
} from "../services/status.service";

export default function CheckStatus() {
  const navigate = useNavigate();
  const [referenceNumber, setReferenceNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<StatusCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      setError("Please enter a reference number");
      return;
    }

    if (!email.trim()) {
      setError("Please enter the guardian email used during registration");
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await statusService.checkStatus(
        referenceNumber.trim(),
        email.trim()
      );
      setResult(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("Registration not found. Please check your reference number.");
      } else {
        setError(err?.response?.data?.message || "Failed to check status");
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-6 h-6 text-amber-600" />;
      case "approved":
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case "released":
        return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      case "rejected":
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "pending":
        return "Your registration is under review. We'll notify you once the review is complete.";
      case "approved":
        return "Your registration has been approved and is pending release.";
      case "released":
        return "Your registration has been approved and released. Congratulations!";
      case "rejected":
        return "Unfortunately, your registration was not approved.";
      default:
        return "Unknown status";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-amber-50 via-red-50 to-green-50 sm:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-8 font-medium text-gray-700 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Main Card */}
        <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-amber-50">
            <h1 className="text-2xl font-bold text-gray-900">
              Check Registration Status
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Enter your reference number to check the status of your INAANAK
              registration
            </p>
          </div>

          <div className="p-8">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-8 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-800">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., REG-2025-12-23-001"
                    value={referenceNumber}
                    onChange={(e) =>
                      setReferenceNumber(e.target.value.toUpperCase())
                    }
                    className="w-full px-4 py-3 transition-all border border-gray-300 rounded-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-800">
                    Guardian Email (used during registration)
                  </label>
                  <input
                    type="email"
                    placeholder="guardian@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 transition-all border border-gray-300 rounded-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {error && searched && (
              <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-6">
                {/* Status Overview */}
                <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Status Overview
                    </h2>
                    <div className="flex">
                      <StatusBadge status={result.status} size="md" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 mb-6 bg-white rounded-lg">
                    <div className="flex-shrink-0">
                      {getStatusIcon(result.status)}
                    </div>
                    <p className="text-gray-700">
                      {getStatusMessage(result.status)}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-600">Reference Number</p>
                      <p className="font-mono font-semibold text-gray-900">
                        {result.reference_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Child's Name</p>
                      <p className="font-semibold text-gray-900">
                        {result.inaanak_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Submitted Date</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(result.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(result.updated_at)}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Guardian Email</p>
                      <p className="font-semibold text-gray-900">
                        {result.guardian_email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason (if applicable) */}
                {result.status === "rejected" && result.rejection_reason && (
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h3 className="mb-2 font-semibold text-red-900">
                      Rejection Reason
                    </h3>
                    <p className="text-red-800">{result.rejection_reason}</p>
                  </div>
                )}

                {/* Timeline Info */}
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <h3 className="mb-2 font-semibold text-blue-900">
                    What's Next?
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    {result.status === "pending" && (
                      <>
                        <li>
                          • Our team is reviewing your registration and
                          documents
                        </li>
                        <li>• Review typically takes 3-5 business days</li>
                        <li>
                          • You'll receive an email when the review is complete
                        </li>
                      </>
                    )}
                    {result.status === "approved" && (
                      <>
                        <li>• Your registration has been approved</li>
                        <li>
                          • Please wait for the final release notification
                        </li>
                        <li>• Check back soon for updates</li>
                      </>
                    )}
                    {result.status === "released" && (
                      <>
                        <li>
                          • Congratulations! Your registration is complete
                        </li>
                        <li>• You can now access your registration details</li>
                        <li>
                          • Save your reference number for future inquiries
                        </li>
                      </>
                    )}
                    {result.status === "rejected" && (
                      <>
                        <li>• Your registration was not approved</li>
                        <li>• Please review the rejection reason above</li>
                        <li>• Contact support if you have any questions</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!searched && !result && (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">
                  Enter your reference number above to check the status
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  You can find this number in your confirmation email
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="p-6 mt-8 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <h3 className="mb-2 font-semibold text-gray-900">Need Help?</h3>
          <p className="mb-3 text-sm text-gray-600">
            If you can't find your reference number or have other questions,
            please contact our support team.
          </p>
          <p className="font-medium text-red-600">cpe.sicatgio14@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
