"use client";
import React, { useState } from "react";
import useIDSelfieUploadRequest from "@/hooks/auth/requestIDSelfieUpload";
import Image from "next/image";

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

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdPhoto(file);
      setIdPreview(URL.createObjectURL(file));
    }
  };

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfiePhoto(file);
      setSelfiePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idPhoto || !selfiePhoto) {
      alert("Please select both ID and Selfie photos.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("idPhoto", idPhoto);
      formData.append("selfiePhoto", selfiePhoto);

      await idSelfieUpload(formData, () => {
        alert("Upload successful!");
        setIdPhoto(null);
        setSelfiePhoto(null);
        setIdPreview(null);
        setSelfiePreview(null);
        onClose();
      });
    } catch (err) {
      alert(`Upload failed: ${err}`);
    }
  };

  return (
    <>
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIdChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                />
                {idPreview && (
                  <Image
                    src={idPreview}
                    alt="ID Preview"
                    width={1920}
                    height={1080}
                    className="mt-3 w-full h-40 object-contain rounded-2xl border border-gray-300"
                  />
                )}
              </div>

              <div className="w-1/2">
                <label className="block mb-3 poppins-bold text-gray-700">
                  Upload Selfie with ID
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSelfieChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                />
                {selfiePreview && (
                  <Image
                    alt="Selfie Preview"
                    src={selfiePreview}
                    width={1920}
                    height={1080}
                    className="mt-3 w-full h-40 object-contain rounded-2xl border border-gray-300"
                  />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-bold rounded-2xl transition duration-200 mt-6 disabled:opacity-50"
              style={{ backgroundColor: '#2c8068' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1f5a4a'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2c8068'}
            >
              {loading ? "Uploading..." : "Submit for Verification"}
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
