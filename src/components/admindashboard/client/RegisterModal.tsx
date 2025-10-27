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
    role: 1,
    lenderInstitution: "",
    lenderAddress: "",
    businessName: "",
    businessAddress: "",
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-md overflow-hidden">
        <div className="p-8">
          <h2 className="poppins-bold text-3xl text-center text-gray-700 mb-8">
            Register New Lender
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col space-y-4">
              {[
                "firstName",
                "lastName",
                "email",
                "username",
                "phoneNumber",
                "password",
                "lenderInstitution",
                "lenderAddress",
              ].map((field) => (
                <input
                  key={field}
                  name={field}
                  type={field === "password" ? "password" : "text"}
                  placeholder={
                    field === "lenderInstitution" 
                      ? "Lender Institution" 
                      : field === "lenderAddress"
                      ? "Lender Address"
                      : field.charAt(0).toUpperCase() + field.slice(1)
                  }
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                />
              ))}

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {showSuccess && (
                <p className="text-sm" style={{ color: '#85d4a4' }}>Registration successful!</p>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl bg-gray-300 hover:bg-gray-400 transition duration-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 text-white font-bold rounded-2xl transition duration-200"
                  style={{ backgroundColor: '#2c8068' }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1a5a4a'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2c8068'}
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
