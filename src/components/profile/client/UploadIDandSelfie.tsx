"use client";
import React, { useState } from "react";
import useIDSelfieUploadRequest from "@/hooks/auth/requestIDSelfieUpload";
import Image from "next/image";

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
      });
    } catch (err) {
      alert(`Upload failed: ${err}`);
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
              <Image
                src={idPreview}
                alt="ID Preview"
                width={1920}
                height={1080}
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
              <Image
                alt="Selfie Preview"
                src={selfiePreview}
                width={1920}
                height={1080}
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
