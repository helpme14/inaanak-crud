"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader } from "lucide-react";
import { ProgressSteps } from "../../components/feedback/ProgressSteps";
import registrationService from "../../services/registration.service";
import { useRegistration } from "../../contexts/RegistrationContext";

const steps = ["Guardian Info", "Inaanak Info", "Review & Submit"];

export default function ReviewSubmit() {
  const navigate = useNavigate();
  const { uploads, clearUploads } = useRegistration();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const registrationData = JSON.parse(
    sessionStorage.getItem("registrationData") || "{}"
  );
  const { guardian = {}, inaanak = {} } = registrationData;

  const handleSubmit = async () => {
    if (!acceptTerms) {
      setError(
        "Please accept the terms and conditions to proceed with registration."
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await registrationService.create({
        guardian_name: guardian.guardianName,
        guardian_email: guardian.email,
        guardian_contact: guardian.contactNumber,
        guardian_address: guardian.address,
        inaanak_name: inaanak.inaanakName,
        inaanak_birthdate: inaanak.birthDate,
        relationship: inaanak.relationship,
        ninong_code: guardian.ninongCode,
        live_photo: uploads.livePhoto || undefined,
        video: uploads.video || undefined,
        qr_code: uploads.qrCode || undefined,
      });

      // Clear session storage on success
      sessionStorage.removeItem("registrationData");
      sessionStorage.removeItem("guardianData");

      // Clear context uploads
      clearUploads();

      // Store reference number for success page
      sessionStorage.setItem("referenceNumber", result.reference_number);

      navigate("/register/success");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to submit registration. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-amber-50 via-red-50 to-green-50 sm:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/register/inaanak-info")}
          className="flex items-center gap-2 mb-8 font-medium text-gray-700 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Progress Steps */}
        <ProgressSteps currentStep={3} totalSteps={3} steps={steps} />

        {/* Content */}
        <div className="space-y-6">
          {/* Guardian Summary Card */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-amber-50">
              <h3 className="font-semibold text-gray-900">
                Guardian Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm text-gray-600">Full Name</p>
                  <p className="font-semibold text-gray-900">
                    {guardian.guardianName || "—"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">
                    {guardian.email || "—"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-600">Contact Number</p>
                  <p className="font-semibold text-gray-900">
                    {guardian.contactNumber || "—"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-600">Address</p>
                  <p className="font-semibold text-gray-900">
                    {guardian.address || "—"}
                  </p>
                </div>
                {guardian.ninongCode ? (
                  <div className="md:col-span-2">
                    <p className="mb-1 text-sm text-gray-600">Ninong Code</p>
                    <p className="font-semibold text-gray-900">
                      {guardian.ninongCode}
                    </p>
                  </div>
                ) : null}
              </div>
              <button
                onClick={() => navigate("/register/guardian-info")}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Edit Information
              </button>
            </div>
          </div>

          {/* Inaanak Summary Card */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-amber-50">
              <h3 className="font-semibold text-gray-900">
                Inaanak Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm text-gray-600">Child's Name</p>
                  <p className="font-semibold text-gray-900">
                    {inaanak.inaanakName || "—"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-600">Date of Birth</p>
                  <p className="font-semibold text-gray-900">
                    {inaanak.birthDate || "—"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="mb-1 text-sm text-gray-600">Relationship</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {inaanak.relationship || "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/register/inaanak-info")}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Edit Information
              </button>
            </div>
          </div>

          {/* Documents Summary Card */}
          <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-amber-50">
              <h3 className="font-semibold text-gray-900">Documents</h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm text-gray-700">Live Photo</span>
                {uploads.livePhoto ? (
                  <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                    <Check className="w-4 h-4" />
                    Uploaded
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">Not uploaded</span>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm text-gray-700">Video (MOV/MP4)</span>
                {uploads.video ? (
                  <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                    <Check className="w-4 h-4" />
                    Uploaded
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">Not uploaded</span>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm text-gray-700">InstaPay QR Code</span>
                {uploads.qrCode ? (
                  <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                    <Check className="w-4 h-4" />
                    Uploaded
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">Not uploaded</span>
                )}
              </div>
              <button
                onClick={() => navigate("/register/inaanak-info")}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Update Documents
              </button>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex gap-3 p-4 border rounded-lg bg-amber-50 border-amber-200">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I confirm that all information provided is accurate and I accept
              the terms and conditions of the INAANAK Aguinaldo Registration
              program.
            </label>
          </div>

          {error && (
            <div className="p-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
              {error}
            </div>
          )}

          {/* Submission Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => navigate("/register/inaanak-info")}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !acceptTerms}
              className="flex-1 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Registration
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
