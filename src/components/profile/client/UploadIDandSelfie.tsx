"use client";
import React, { useState, useEffect } from "react";
import useIDSelfieUploadRequest from "@/hooks/auth/requestIDSelfieUpload";
import useFaceVerifyRequest from "@/hooks/auth/requestFaceVerify";
import Image from "next/image";
import CustomAlertModal from "./CustomAlertModal";
import LegalDocumentsUpload from "./LegalDocumentsUpload";

export default function UploadIDandSelfieModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const { idSelfieUpload, loading, error } = useIDSelfieUploadRequest();
  const { faceVerify, faceVerifyData, loading: faceVerifyLoading } = useFaceVerifyRequest();
  
  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
    confidence?: number;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Legal documents modal state
  const [showLegalDocumentsModal, setShowLegalDocumentsModal] = useState(false);

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      if (idPreview) {
        URL.revokeObjectURL(idPreview);
      }
      if (selfiePreview) {
        URL.revokeObjectURL(selfiePreview);
      }
    };
  }, [idPreview, selfiePreview]);

  // Helper function to show custom alert
  const showAlert = (title: string, message: string, type: "success" | "error" | "warning" | "info", confidence?: number) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
      confidence,
    });
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up previous preview URL to prevent memory leaks
      if (idPreview) {
        URL.revokeObjectURL(idPreview);
      }
      setIdPhoto(file);
      setIdPreview(URL.createObjectURL(file));
    }
  };

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up previous preview URL to prevent memory leaks
      if (selfiePreview) {
        URL.revokeObjectURL(selfiePreview);
      }
      setSelfiePhoto(file);
      setSelfiePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idPhoto || !selfiePhoto) {
      showAlert("Missing Photos", "Please select both ID and Selfie photos.", "warning");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("idPhoto", idPhoto);
      formData.append("selfiePhoto", selfiePhoto);

      await idSelfieUpload(formData, async () => {
        // Clear the form data
        setIdPhoto(null);
        setSelfiePhoto(null);
        setIdPreview(null);
        setSelfiePreview(null);
        
        // Call face verification after successful upload
        try {
          await faceVerify((data) => {
            const confidencePercentage = Math.round(data.data.confidence);
            showAlert(
              "Upload & Verification Successful!", 
              `Your ID and selfie have been uploaded successfully. Face verification completed.`, 
              "success",
              confidencePercentage
            );
          });
        } catch (err) {
          // If face verification fails, still show upload success but without confidence
          showAlert("Upload Successful!", "Your ID and selfie have been uploaded successfully, but face verification failed.", "warning");
        }
      });
    } catch (err) {
      showAlert("Upload Failed", `There was an error uploading your photos. Please try again. Error: ${err}`, "error");
    }
  };

  return (
    <>
      {/* Custom Alert Modal */}
      <CustomAlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          // If it's a success alert, show legal documents modal
          if (alertModal.type === "success") {
            setShowLegalDocumentsModal(true);
          }
        }}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        confidence={alertModal.confidence}
      />

      {/* Legal Documents Upload Modal */}
      {showLegalDocumentsModal && (
        <LegalDocumentsUpload
          onClose={() => {
            setShowLegalDocumentsModal(false);
            onClose(); // Close the main modal after legal documents are uploaded
          }}
        />
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
        <div className="bg-white max-w-2xl w-full rounded-xl shadow-lg p-8 relative">
          <h2 className="poppins-bold text-4xl mb-8 text-center text-gray-700">
            Upload ID & Selfie
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
            <div className="flex gap-6 flex-row">
              <div className="w-1/2">
                <label className="block mb-3 poppins-bold text-gray-700">
                  Upload Valid ID
                </label>
                {!idPreview ? (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIdChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="id-upload"
                    />
                    <label
                      htmlFor="id-upload"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 bg-white"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 poppins-medium">
                          <span className="font-semibold">Click to upload</span> your ID
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <Image
                      src={idPreview}
                      alt="ID Preview"
                      width={1920}
                      height={1080}
                      className="w-full h-40 object-contain rounded-2xl border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (idPreview) {
                          URL.revokeObjectURL(idPreview);
                        }
                        setIdPhoto(null);
                        setIdPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="w-1/2">
                <label className="block mb-3 poppins-bold text-gray-700">
                  Upload Selfie
                </label>
                {!selfiePreview ? (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSelfieChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="selfie-upload"
                    />
                    <label
                      htmlFor="selfie-upload"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 bg-white"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 poppins-medium">
                          <span className="font-semibold">Click to upload</span> your selfie
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <Image
                      alt="Selfie Preview"
                      src={selfiePreview}
                      width={1920}
                      height={1080}
                      className="w-full h-40 object-contain rounded-2xl border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (selfiePreview) {
                          URL.revokeObjectURL(selfiePreview);
                        }
                        setSelfiePhoto(null);
                        setSelfiePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || faceVerifyLoading}
              className="w-full py-3 text-white font-bold rounded-2xl transition duration-200 mt-6 disabled:opacity-50"
              style={{ backgroundColor: '#2c8068' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1f5a4a'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2c8068'}
            >
              {loading ? "Uploading..." : faceVerifyLoading ? "Verifying..." : "Submit for Verification"}
            </button>

            {error && (
              <p className="text-red-600 text-center poppins-bold">{error}</p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
