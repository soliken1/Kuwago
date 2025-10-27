"use client";
import React, { useState, useEffect } from "react";
import useDocumentUploadRequest from "@/hooks/auth/requestDocumentUpload";
import Image from "next/image";
import CustomAlertModal from "./CustomAlertModal";

export default function LegalDocumentsUploadModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [documents, setDocuments] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  const { uploadDocuments, uploadData, loading, error } = useDocumentUploadRequest();
  
  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      previews.forEach(({ preview }) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [previews]);

  // Watch for successful upload
  useEffect(() => {
    if (uploadData && uploadData.success && documents.length > 0) {
      const documentCount = documents.length;
      
      // Show success alert first
      showAlert("Upload Successful!", `Your ${documentCount} document(s) have been uploaded successfully.`, "success");
      
      // Then clear the form data after a short delay
      setTimeout(() => {
        setDocuments([]);
        previews.forEach(({ preview }) => URL.revokeObjectURL(preview));
        setPreviews([]);
      }, 100);
    }
  }, [uploadData, documents.length, previews]);

  // Helper function to show custom alert
  const showAlert = (title: string, message: string, type: "success" | "error" | "warning" | "info") => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = [...documents, ...files];
      setDocuments(newFiles);
      
      // Create previews for new files
      const newPreviews = files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Clean up the URL for the removed file
    URL.revokeObjectURL(previews[index].preview);
    
    setDocuments(newDocuments);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (documents.length === 0) {
      showAlert("No Documents", "Please select at least one document to upload.", "warning");
      return;
    }
    
    try {
      await uploadDocuments(documents);
    } catch (err) {
      console.error("Upload error:", err);
      showAlert("Upload Failed", `There was an error uploading your documents. Please try again. Error: ${err}`, "error");
    }
  };

  return (
    <>
      {/* Custom Alert Modal */}
      <CustomAlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          // If it's a success alert, close the main modal after user confirms
          if (alertModal.type === "success") {
            onClose();
          }
        }}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />

      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center px-4">
        <div className="bg-white max-w-4xl w-full rounded-xl shadow-lg p-8 relative">
          <h2 className="poppins-bold text-4xl mb-8 text-center text-gray-700">
            Upload Legal Documents
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
            {/* File Upload Area */}
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id="documents-upload"
              />
              <label
                htmlFor="documents-upload"
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
                    <span className="font-semibold">Click to upload</span> your legal documents
                  </p>
                  <p className="text-xs text-gray-500">PDF, JPG, PNG (MAX. 10MB each)</p>
                </div>
              </label>
            </div>

            {/* Document Previews */}
            {previews.length > 0 && (
              <div className="space-y-4">
                <h3 className="poppins-bold text-lg text-gray-700">
                  Selected Documents ({previews.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {previews.map(({ file, preview }, index) => (
                    <div key={index} className="relative border border-gray-300 rounded-2xl p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700 poppins-medium truncate">
                          {file.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                      
                      {/* File Preview */}
                      <div className="relative h-32 bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <Image
                            src={preview}
                            alt={file.name}
                            width={200}
                            height={128}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <svg
                              className="w-8 h-8 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <p className="text-xs text-center">{file.type.split('/')[1].toUpperCase()}</p>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || documents.length === 0}
              className="w-full py-3 text-white font-bold rounded-2xl transition duration-200 mt-6 disabled:opacity-50"
              style={{ backgroundColor: '#2c8068' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1f5a4a'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2c8068'}
            >
              {loading ? "Uploading..." : `Upload ${documents.length} Document${documents.length !== 1 ? 's' : ''}`}
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
