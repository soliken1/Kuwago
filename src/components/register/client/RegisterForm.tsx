"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import useRegisterRequest from "@/hooks/auth/requestRegister";
import { useRouter } from "next/navigation";
import Link from "next/link";
import sendEmailWithLink from "@/utils/sendEmailWithLink";
import RegisterVector from "../../../../assets/images/RegisterVector.png";
import TermsAndConditionsModal from "./TermsAndConditionsModal";

export default function RegisterForm() {
  const router = useRouter();
  const { register, loading, error, registerData } = useRegisterRequest();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phoneNumber: "",
    password: "",
    role: 2,
    lenderInstitution: "",
    lenderAddress: "",
    businessName: "",
    businessAddress: "",
  });
  const [selectedRole, setSelectedRole] = useState<"lender" | "borrower">("borrower");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const placeholderMap: Record<string, string> = {
    firstName: "'Juan'",
    lastName: "'Dela Cruz'",
    email: "abc123@example.com'",
    username: "'Juan123'",
    phoneNumber: "'09123456789'",
    password: "Create a password",
  };

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (registerData?.data?.user && registerData?.data?.verificationLink) {
      const { email, firstName, lastName } = registerData.data.user;
      const downloadURL = registerData.data.verificationLink;
      const subject = "Kuwago Email Verification";

      sendEmailWithLink(
        email,
        `${firstName} ${lastName}`,
        downloadURL,
        subject
      ).catch(() => {});

      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        router.push("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [registerData, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(formData);
  };

  return (
    <div className="flex flex-col items-center w-full bg-black/25 justify-center min-h-screen p-4 poppins-normal">
      <div className="flex w-[900px] bg-white rounded-xl shadow-md overflow-hidden">
        {/* LEFT SIDE: IMAGE - 1/2 width */}
        <div className="hidden sm:block sm:w-1/2 relative min-h-[300px]">
          <Image
            src={RegisterVector}
            alt="KuwaGo Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        {/* RIGHT SIDE: FORM - 1/2 width */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full sm:w-1/2 p-8 border-l border-gray-200 space-y-6"
        >
          <h2 className="poppins-bold pt-6 mb-12 text-4xl text-center text-gray-700">
            Create Account
          </h2>

          {/* Role Selection Buttons */}
          <div className="flex space-x-4 mb-6">
            <button
              type="button"
              onClick={() => {
                setSelectedRole("lender");
                setFormData(prev => ({ ...prev, role: 1 }));
              }}
              className={`flex-1 py-3 px-4 rounded-2xl font-medium transition duration-200 ${
                selectedRole === "lender"
                  ? "text-white"
                  : "text-gray-600 bg-gray-100 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor: selectedRole === "lender" ? '#85d4a4' : undefined
              }}
            >
              Lender
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole("borrower");
                setFormData(prev => ({ ...prev, role: 2 }));
              }}
              className={`flex-1 py-3 px-4 rounded-2xl font-medium transition duration-200 ${
                selectedRole === "borrower"
                  ? "text-white"
                  : "text-gray-600 bg-gray-100 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor: selectedRole === "borrower" ? '#85d4a4' : undefined
              }}
            >
              Borrower
            </button>
          </div>

          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {["firstName", "lastName"].map((field) => (
                <input
                  key={field}
                  type="text"
                  id={field}
                  name={field}
                  placeholder={field === "firstName" ? "First Name" : "Last Name"}
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  required
                />
              ))}
            </div>

            {["email", "username", "phoneNumber", "password"].map((field) => (
              <input
                key={field}
                type={field === "password" ? "password" : "text"}
                id={field}
                name={field}
                placeholder={field === "phoneNumber" ? "Phone Number" : field.charAt(0).toUpperCase() + field.slice(1)}
                className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                value={formData[field as keyof typeof formData]}
                onChange={handleChange}
                required
              />
            ))}

            {/* Conditional fields based on role selection */}
            {selectedRole === "lender" && (
              <>
                <input
                  type="text"
                  id="lenderInstitution"
                  name="lenderInstitution"
                  placeholder="Lender Institution"
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                  value={formData.lenderInstitution}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  id="lenderAddress"
                  name="lenderAddress"
                  placeholder="Lender Address"
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                  value={formData.lenderAddress}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            {selectedRole === "borrower" && (
              <>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  placeholder="Business Name"
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  id="businessAddress"
                  name="businessAddress"
                  placeholder="Business Address"
                  className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  required
                />
              </>
            )}
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-start space-x-3 mt-6">
            <input
              type="checkbox"
              id="agreeToTerms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-green-600 hover:text-green-700 underline font-medium"
                style={{ color: '#85d4a4' }}
              >
                Terms and Conditions
              </button>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !agreeToTerms}
            className={`w-full py-3 text-white font-bold rounded-2xl transition duration-200 mt-4 ${
              !agreeToTerms ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ 
              backgroundColor: agreeToTerms ? '#85d4a4' : '#cccccc'
            }}
            onMouseEnter={(e) => {
              if (agreeToTerms) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#6bc48a';
              }
            }}
            onMouseLeave={(e) => {
              if (agreeToTerms) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#85d4a4';
              }
            }}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {showError && (
            <div className="fixed top-4 right-4 transform transition-all duration-300 ease-in-out translate-x-0 opacity-100">
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {showSuccess && (
            <div className="fixed top-4 right-4 transform transition-all duration-300 ease-in-out translate-x-0 opacity-100">
              <div className="p-4 rounded shadow-lg" style={{ backgroundColor: '#f0f9f4', borderLeft: '4px solid #85d4a4', color: '#2d5a3d' }}>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p>Registration successful! Redirecting to login...</p>
                </div>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link
              href="/login"
              className="poppins-bold"
              style={{ color: '#85d4a4' }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#6bc48a'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#85d4a4'}
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>

      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </div>
  );
}
