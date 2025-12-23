"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProgressSteps } from "../../components/feedback/ProgressSteps";

const steps = ["Guardian Info", "Inaanak Info", "Review & Submit"];

export default function GuardianInfo() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    guardianName: "",
    email: "",
    contactNumber: "",
    address: "",
    ninongCode: "",
  });
  const [errors, setErrors] = useState({
    guardianName: false,
    email: false,
    contactNumber: false,
    address: false,
    ninongCode: false,
  });
  const [shake, setShake] = useState({
    guardianName: false,
    email: false,
    contactNumber: false,
    address: false,
    ninongCode: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    // Validate and animate shake on required fields
    const nextErrors = {
      guardianName: !formData.guardianName.trim(),
      email: !formData.email.trim(),
      contactNumber: !formData.contactNumber.trim(),
      address: !formData.address.trim(),
      ninongCode: !formData.ninongCode.trim(),
    };
    setErrors(nextErrors);

    const hasError = Object.values(nextErrors).some(Boolean);
    if (hasError) {
      const shaken = { ...shake } as any;
      Object.entries(nextErrors).forEach(([k, v]) => {
        if (v) {
          shaken[k] = true;
          setTimeout(() => setShake((prev) => ({ ...prev, [k]: false })), 400);
        }
      });
      setShake(shaken);
      return;
    }
    // Store in sessionStorage or state management
    sessionStorage.setItem("guardianData", JSON.stringify(formData));
    navigate("/register/inaanak-info");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-green-50 py-8 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </button>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          {/* Progress Steps - moved inside card header for proper placement */}
          <div className="mb-6 md:mb-8 -mx-2 md:mx-0">
            <ProgressSteps currentStep={1} totalSteps={3} steps={steps} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Guardian Information
          </h2>
          <p className="text-gray-600 mb-8">
            Please provide the guardian's details for the Inaanak registration.
          </p>

          <form className="space-y-6">
            {/* Guardian Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                placeholder="Enter full name"
                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all bg-white text-gray-900 placeholder-gray-500 ${
                  errors.guardianName
                    ? "border-red-500 ring-2 ring-red-200"
                    : "border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                } ${shake.guardianName ? "animate-shake" : ""}`}
                aria-invalid={errors.guardianName}
              />
              <p
                className={`text-xs mt-1 ${
                  errors.guardianName ? "text-red-600" : "text-gray-500"
                }`}
              >
                {errors.guardianName
                  ? "This field is required"
                  : "e.g., Juan Dela Cruz"}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all bg-white text-gray-900 placeholder-gray-500 ${
                  errors.email
                    ? "border-red-500 ring-2 ring-red-200"
                    : "border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                } ${shake.email ? "animate-shake" : ""}`}
                aria-invalid={errors.email}
              />
              <p
                className={`text-xs mt-1 ${
                  errors.email ? "text-red-600" : "text-gray-500"
                }`}
              >
                {errors.email
                  ? "This field is required"
                  : "We'll send a verification link here"}
              </p>
            </div>

            {/* Ninong Code (Required) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Ninong Code *
              </label>
              <input
                type="text"
                name="ninongCode"
                value={formData.ninongCode}
                onChange={handleChange}
                placeholder="Enter code provided by your Ninong"
                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all bg-white text-gray-900 placeholder-gray-500 ${
                  errors.ninongCode
                    ? "border-red-500 ring-2 ring-red-200"
                    : "border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                } ${shake.ninongCode ? "animate-shake" : ""}`}
                aria-invalid={errors.ninongCode}
              />
              <p
                className={`text-xs mt-1 ${
                  errors.ninongCode ? "text-red-600" : "text-gray-500"
                }`}
              >
                {errors.ninongCode
                  ? "Ninong code is required"
                  : "Enter the code provided by your Ninong so your registration appears on their dashboard."}
              </p>
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Enter contact number"
                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all bg-white text-gray-900 placeholder-gray-500 ${
                  errors.contactNumber
                    ? "border-red-500 ring-2 ring-red-200"
                    : "border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                } ${shake.contactNumber ? "animate-shake" : ""}`}
                aria-invalid={errors.contactNumber}
              />
              <p
                className={`text-xs mt-1 ${
                  errors.contactNumber ? "text-red-600" : "text-gray-500"
                }`}
              >
                {errors.contactNumber
                  ? "This field is required"
                  : "e.g., +63 9XX XXX XXXX"}
              </p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete address"
                rows={3}
                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all bg-white text-gray-900 placeholder-gray-500 ${
                  errors.address
                    ? "border-red-500 ring-2 ring-red-200"
                    : "border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                } ${shake.address ? "animate-shake" : ""}`}
                aria-invalid={errors.address}
              />
              <p
                className={`text-xs mt-1 ${
                  errors.address ? "text-red-600" : "text-gray-500"
                }`}
              >
                {errors.address
                  ? "This field is required"
                  : "Include street, barangay, and city"}
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-8">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                Next Step
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
