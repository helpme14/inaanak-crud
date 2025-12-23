import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Upload, Camera } from "lucide-react";
import { ProgressSteps } from "../../components/feedback/ProgressSteps";
import { useRegistration } from "../../contexts/RegistrationContext";

const steps = ["Guardian Info", "Inaanak Info", "Review & Submit"];

export default function InaanakInfo() {
  const navigate = useNavigate();
  const { uploads, setUploads } = useRegistration();
  const [formData, setFormData] = useState({
    inaanakName: "",
    birthDate: "",
    relationship: "",
  });

  const [cameraActive, setCameraActive] = useState(false);
  const [errors, setErrors] = useState({
    livePhoto: false,
    video: false,
    qrCode: false,
  });
  const [shake, setShake] = useState(false);
  const videoRef = useState<HTMLVideoElement | null>(null)[0];
  const canvasRef = useState<HTMLCanvasElement | null>(null)[0];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: keyof typeof uploads
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploads({ ...uploads, [fileType]: file });
      setErrors((prev) => ({ ...prev, [fileType]: false }));
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setCameraActive(true);

      // Store stream for later use
      if (videoRef) {
        videoRef.srcObject = stream;
      }
    } catch (err) {
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (canvasRef && videoRef) {
      const context = canvasRef.getContext("2d");
      if (context) {
        context.drawImage(videoRef, 0, 0, canvasRef.width, canvasRef.height);
        canvasRef.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            setUploads({ ...uploads, livePhoto: file });
            setErrors((prev) => ({ ...prev, livePhoto: false }));
            setCameraActive(false);

            // Stop camera stream
            if (videoRef.srcObject instanceof MediaStream) {
              videoRef.srcObject.getTracks().forEach((track) => track.stop());
            }
          }
        }, "image/jpeg");
      }
    }
  };

  const handleNext = () => {
    // Validate basic info fields
    const basicInfoErrors = {
      inaanakName: !formData.inaanakName,
      birthDate: !formData.birthDate,
      relationship: !formData.relationship,
    };

    // Validate all files are uploaded
    const fileErrors = {
      livePhoto: !uploads.livePhoto,
      video: !uploads.video,
      qrCode: !uploads.qrCode,
    };

    // If any files are missing, show file errors with shake
    if (fileErrors.livePhoto || fileErrors.video || fileErrors.qrCode) {
      setErrors(fileErrors);
      setShake(true);
      setTimeout(() => setShake(false), 350);
      return;
    }

    // If basic info missing, show alert
    if (
      basicInfoErrors.inaanakName ||
      basicInfoErrors.birthDate ||
      basicInfoErrors.relationship
    ) {
      alert("Please fill all required fields");
      return;
    }

    const allData = {
      guardian: JSON.parse(sessionStorage.getItem("guardianData") || "{}"),
      inaanak: formData,
      // Don't store files in sessionStorage - they're in context now
    };
    sessionStorage.setItem("registrationData", JSON.stringify(allData));
    navigate("/register/review-submit");
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-amber-50 via-red-50 to-green-50 sm:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/register/guardian-info")}
          className="flex items-center gap-2 mb-8 font-medium text-gray-700 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Progress Steps */}
        <ProgressSteps currentStep={2} totalSteps={3} steps={steps} />

        {/* Form Card */}
        <div
          className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 ${
            shake ? "animate-shake" : ""
          }`}
        >
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Inaanak Information
          </h2>
          <p className="mb-8 text-gray-600">
            Provide details about the child and upload required documents.
          </p>

          <form className="space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h3>

              {/* Inaanak Name */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-900">
                  Child's Full Name *
                </label>
                <input
                  type="text"
                  name="inaanakName"
                  value={formData.inaanakName}
                  onChange={handleChange}
                  placeholder="Enter child's name"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                />
              </div>

              {/* Birth Date */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-900">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-900">
                  Relationship *
                </label>
                <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                >
                  <option value="">Select relationship</option>
                  <option value="parent">Parent</option>
                  <option value="grandparent">Grandparent</option>
                  <option value="sibling">Sibling</option>
                  <option value="guardian">Guardian</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Upload Section */}
            <div className="pt-8 space-y-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900">
                Required Documents
              </h3>

              {/* Live Photo / Camera Capture */}
              <div>
                <label className="block mb-3 text-sm font-semibold text-gray-900">
                  Live Photo <span className="text-red-600">*</span>
                </label>
                <div
                  className={`flex gap-3 ${
                    errors.livePhoto ? "animate-shake" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={handleCameraCapture}
                    className={`flex items-center justify-center flex-1 gap-2 px-4 py-3 transition-all border-2 rounded-lg ${
                      errors.livePhoto
                        ? "border-red-500 bg-red-50 hover:border-red-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Camera className="w-5 h-5" />
                    Capture Photo
                  </button>
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "livePhoto")}
                      className="hidden"
                    />
                    <div
                      className={`flex items-center justify-center gap-2 px-4 py-3 transition-all border-2 rounded-lg cursor-pointer ${
                        errors.livePhoto
                          ? "border-red-500 bg-red-50 hover:border-red-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Upload className="w-5 h-5" />
                      Upload Photo
                    </div>
                  </label>
                </div>
                {uploads.livePhoto ? (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ {uploads.livePhoto.name} uploaded
                  </p>
                ) : errors.livePhoto ? (
                  <p className="mt-2 text-sm text-red-600">
                    Live photo is required
                  </p>
                ) : null}
              </div>

              {/* Video Upload */}
              <div>
                <label className="block mb-3 text-sm font-semibold text-gray-900">
                  Video (MOV/MP4) <span className="text-red-600">*</span>
                </label>
                <label
                  className={`block ${errors.video ? "animate-shake" : ""}`}
                >
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime"
                    onChange={(e) => handleFileChange(e, "video")}
                    className="hidden"
                  />
                  <div
                    className={`px-6 py-8 text-center transition-all border-2 border-dashed rounded-lg cursor-pointer ${
                      errors.video
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-red-500 hover:bg-red-50"
                    }`}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium text-gray-900">
                      Click to upload video
                    </p>
                    <p className="text-sm text-gray-600">or drag and drop</p>
                    <p className="mt-1 text-xs text-gray-500">
                      MOV or MP4 • Max 100MB
                    </p>
                  </div>
                </label>
                {uploads.video ? (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ {uploads.video.name} uploaded
                  </p>
                ) : errors.video ? (
                  <p className="mt-2 text-sm text-red-600">Video is required</p>
                ) : null}
              </div>

              {/* QR Code Upload */}
              <div>
                <label className="block mb-3 text-sm font-semibold text-gray-900">
                  InstaPay QR Code <span className="text-red-600">*</span>
                </label>
                <label
                  className={`block ${errors.qrCode ? "animate-shake" : ""}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "qrCode")}
                    className="hidden"
                  />
                  <div
                    className={`px-6 py-8 text-center transition-all border-2 border-dashed rounded-lg cursor-pointer ${
                      errors.qrCode
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-red-500 hover:bg-red-50"
                    }`}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium text-gray-900">
                      Click to upload QR code
                    </p>
                    <p className="text-sm text-gray-600">or drag and drop</p>
                    <p className="mt-1 text-xs text-gray-500">
                      JPG, PNG or GIF • Max 10MB
                    </p>
                  </div>
                </label>
                {uploads.qrCode ? (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ {uploads.qrCode.name} uploaded
                  </p>
                ) : errors.qrCode ? (
                  <p className="mt-2 text-sm text-red-600">
                    QR code is required
                  </p>
                ) : null}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-8 border-t">
              <button
                type="button"
                onClick={() => navigate("/register/guardian-info")}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                Review & Submit
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Camera Modal */}
        {cameraActive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 space-y-4 bg-white shadow-lg rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900">
                Capture Photo
              </h3>
              <video
                ref={videoRef as any}
                autoPlay
                playsInline
                className="w-full bg-black rounded-lg"
              />
              <canvas
                ref={canvasRef as any}
                width={320}
                height={240}
                className="hidden"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCameraActive(false);
                    if (videoRef?.srcObject instanceof MediaStream) {
                      videoRef.srcObject
                        .getTracks()
                        .forEach((track) => track.stop());
                    }
                  }}
                  className="flex-1 px-4 py-2 transition-all border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 px-4 py-2 font-medium text-white transition-all bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Take Photo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
