"use client";
import React, { useState, useEffect } from "react";
import useRegisterRequest from "@/hooks/auth/requestRegister";
import sendEmailWithLink from "@/utils/sendEmailWithLink";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function RegisterModal({ isOpen, onClose }: Props) {
  const { register, loading, error, registerData } = useRegisterRequest();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phoneNumber: "",
    password: "",
    role: 1, // 👈 set to 1 for this modal
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (registerData?.data?.user && registerData?.data?.verificationLink) {
      const { email, firstName, lastName } = registerData.data.user;
      const downloadURL = registerData.data.verificationLink;

      sendEmailWithLink(
        email,
        `${firstName} ${lastName}`,
        downloadURL,
        "Kuwago Email Verification"
      ).catch(() => {});
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    }
  }, [registerData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Register New User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            "firstName",
            "lastName",
            "email",
            "username",
            "phoneNumber",
            "password",
          ].map((field) => (
            <input
              key={field}
              name={field}
              type={field === "password" ? "password" : "text"}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={formData[field as keyof typeof formData]}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded"
            />
          ))}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {showSuccess && (
            <p className="text-green-500 text-sm">Registration successful!</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
