"use client";
import React, { useState } from "react";
import useIDSelfieUploadRequest from "@/hooks/auth/requestIDSelfieUpload";

export default function UploadIDandSelfie() {
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

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Strip "data:image/png;base64," etc.
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPhoto || !selfiePhoto) {
      alert("Please select both ID and Selfie photos.");
      return;
    }

    try {
      const [idBase64, selfieBase64] = await Promise.all([
        fileToBase64(idPhoto),
        fileToBase64(selfiePhoto),
      ]);

      await idSelfieUpload(
        {
          idPhoto: idBase64,
          selfiePhoto: selfieBase64,
        },
        () => {
          alert("Upload successful!");
        }
      );
    } catch (err) {
      alert("Failed to upload images.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Upload ID & Selfie
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
        <div className="flex gap-5 flex-row">
          <div className="w-1/2">
            <label className="block mb-2 font-medium">Upload Valid ID</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleIdChange}
              className="w-full border p-2"
            />
            {idPreview && (
              <img
                src={idPreview}
                alt="ID Preview"
                className="mt-2 w-full h-40 object-contain rounded-md border"
              />
            )}
          </div>

          <div className="w-1/2">
            <label className="block mb-2 font-medium">
              Upload Selfie with ID
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleSelfieChange}
              className="w-full border p-2"
            />
            {selfiePreview && (
              <img
                src={selfiePreview}
                alt="Selfie Preview"
                className="mt-2 w-full h-40 object-contain rounded-md border"
              />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Submit for Verification"}
        </button>

        {error && (
          <p className="text-red-600 text-center font-medium">{error}</p>
        )}
      </form>
    </div>
  );
}
