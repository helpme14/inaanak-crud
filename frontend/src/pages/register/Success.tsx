"use client";

import { useNavigate } from "react-router-dom";
import { CheckCircle2, Home, FileText } from "lucide-react";
import { StatusBadge } from "../../components/feedback/StatusBadge";
import jsPDF from "jspdf";

export default function Success() {
  const navigate = useNavigate();
  const referenceNumber =
    sessionStorage.getItem("referenceNumber") || "REG-XXXX-XX-XX";
  const registrationDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDownloadReceipt = () => {
    try {
      // Create PDF with A4 size
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Set font
      pdf.setFont("helvetica");

      // Header - INAANAK
      pdf.setFontSize(32);
      pdf.setTextColor(220, 38, 38); // Red
      pdf.text("INAANAK", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 12;

      // Subtitle
      pdf.setFontSize(11);
      pdf.setTextColor(102, 102, 102);
      pdf.text("AGUINALDO REGISTRATION RECEIPT", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 10;

      // Horizontal line
      pdf.setDrawColor(220, 38, 38);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Reference Number Box
      pdf.setFillColor(254, 226, 226); // Light red
      pdf.setDrawColor(220, 38, 38);
      pdf.setLineWidth(0.7);
      pdf.rect(margin, yPosition, contentWidth, 25, "FD");

      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      pdf.text("REFERENCE NUMBER", pageWidth / 2, yPosition + 6, {
        align: "center",
      });

      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(220, 38, 38);
      pdf.text(referenceNumber, pageWidth / 2, yPosition + 17, {
        align: "center",
      });
      yPosition += 30;

      // Details Section
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(51, 51, 51);

      const details = [
        { label: "Registration Date:", value: registrationDate },
        { label: "Status:", value: "PENDING REVIEW" },
        { label: "Receipt Type:", value: "Aguinaldo Registration Receipt" },
      ];

      details.forEach((detail) => {
        pdf.setFont("helvetica", "bold");
        pdf.text(detail.label, margin, yPosition);
        pdf.setFont("helvetica", "normal");
        pdf.text(detail.value, margin + 60, yPosition);
        yPosition += 8;
      });

      yPosition += 8;

      // Thank You Section
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, yPosition, contentWidth, 35, "F");
      yPosition += 5;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(51, 51, 51);
      pdf.text("Thank you for registering!", margin + 5, yPosition);
      yPosition += 7;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const thankYouText = pdf.splitTextToSize(
        "Your registration has been successfully submitted and is now pending review by our admin team. You will receive an email confirmation at your registered email address with further instructions. Please save this receipt for your records.",
        contentWidth - 10
      );
      pdf.text(thankYouText, margin + 5, yPosition);
      yPosition += thankYouText.length * 4 + 10;

      // Next Steps Section
      yPosition += 5;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(51, 51, 51);
      pdf.text("What Happens Next:", margin, yPosition);
      yPosition += 7;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const steps = [
        "1. Admin reviews your application and documents",
        "2. Status will be updated to approved or released",
        "3. You will be notified via email of any updates",
      ];

      steps.forEach((step) => {
        pdf.text(step, margin + 5, yPosition);
        yPosition += 6;
      });

      // Footer
      yPosition = pageHeight - 20;
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      pdf.setFontSize(8);
      pdf.setTextColor(153, 153, 153);
      pdf.text("INAANAK AGUINALDO PROGRAM", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 4;
      pdf.text(
        "For inquiries, contact: cpe.sicatgio14@gmail.com",
        pageWidth / 2,
        yPosition,
        {
          align: "center",
        }
      );
      yPosition += 4;
      pdf.text(
        `Generated on ${new Date().toLocaleString()}`,
        pageWidth / 2,
        yPosition,
        {
          align: "center",
        }
      );

      // Save PDF
      pdf.save(`receipt-${referenceNumber}.pdf`);
      console.log("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to download receipt. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-green-50">
      {/* Main Content */}
      <div className="flex items-center justify-center flex-1 px-4 py-20">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Celebration Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-300 via-amber-200 to-green-300 blur-3xl opacity-40 animate-pulse" />
              <div className="relative p-6 bg-white rounded-full shadow-lg">
                <CheckCircle2 className="w-16 h-16 mx-auto text-green-600" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Registration Complete!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for registering your Inaanak. Your application has been
              submitted successfully.
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <StatusBadge status="pending" size="lg" />
          </div>

          {/* Next Steps Card */}
          <div className="p-6 space-y-4 text-left bg-white border border-gray-100 shadow-sm rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-900">
              What happens next?
            </h3>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-semibold text-red-600 bg-red-100 rounded-full">
                  1
                </span>
                <span className="text-sm text-gray-700">
                  <strong>Save this reference number:</strong> Use it to track
                  your registration status
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-semibold text-red-600 bg-red-100 rounded-full">
                  2
                </span>
                <span className="text-sm text-gray-700">
                  <strong>Admin review:</strong> The admin will review your
                  application and documents
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-sm font-semibold text-red-600 bg-red-100 rounded-full">
                  3
                </span>
                <span className="text-sm text-gray-700">
                  <strong>Status update:</strong> Your status will be updated to
                  approved or released
                </span>
              </li>
            </ol>
          </div>

          {/* Reference Number Card */}
          <div className="p-4 border border-red-100 rounded-lg bg-gradient-to-r from-red-50 to-amber-50">
            <p className="text-xs tracking-widest text-gray-600 uppercase">
              Reference Number
            </p>
            <p className="font-mono text-2xl font-bold text-red-600">
              {referenceNumber}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center w-full gap-2 px-6 py-3 font-semibold text-white transition-all bg-red-600 rounded-lg hover:bg-red-700"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center justify-center w-full gap-2 px-6 py-3 font-semibold text-gray-900 transition-all border-2 border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FileText className="w-5 h-5" />
              Download Receipt
            </button>
          </div>

          {/* Help Text */}
          <p className="text-sm text-gray-600">
            Questions? Contact our support team at{" "}
            <span className="font-medium text-red-600">cpe.sicatgio14@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
