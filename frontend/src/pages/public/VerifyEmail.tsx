"use client";

import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type AlertState = "idle" | "success" | "error" | null;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [alertState, setAlertState] = useState<AlertState>(null);
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    // Simulate API call
    setTimeout(() => {
      setAlertState("success");
      setIsResending(false);
      setTimeout(() => setAlertState(null), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-green-50 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 sm:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-300 via-amber-200 to-blue-300 rounded-full blur-2xl opacity-30" />
              <div className="relative bg-white rounded-full p-6 shadow-lg">
                <Mail className="h-16 w-16 text-blue-600 mx-auto" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Check Your Email
            </h1>
            <p className="text-gray-600">
              We sent you a verification link. Click the link in your email to
              confirm your address and complete your registration.
            </p>
          </div>

          {/* Alert Messages */}
          <div className="space-y-3">
            {alertState === "success" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">
                    Email sent successfully!
                  </p>
                  <p className="text-sm text-green-700">
                    Check your inbox and spam folder.
                  </p>
                </div>
              </div>
            )}

            {alertState === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">
                    Verification failed
                  </p>
                  <p className="text-sm text-red-700">
                    Please try again or contact support.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Resend Button */}
          <div>
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-all"
            >
              {isResending ? "Sending..." : "Resend Email"}
            </button>
          </div>

          {/* Footer Message */}
          <p className="text-sm text-gray-600 text-center">
            Didn't receive the email? Check your spam folder or{" "}
            <button className="text-red-600 hover:text-red-700 font-medium">
              contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
