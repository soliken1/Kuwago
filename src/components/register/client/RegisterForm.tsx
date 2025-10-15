"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import useRegisterRequest from "@/hooks/auth/requestRegister";
import { useRouter } from "next/navigation";
import Link from "next/link";
import sendEmailWithLink from "@/utils/sendEmailWithLink";
import RegisterVector from "../../../../assets/images/RegisterVector.png";

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
  });
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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
      <div className="flex w-full max-w-5xl bg-white rounded-xl shadow-md overflow-hidden min-h-[600px]">
        {/* RIGHT SIDE: IMAGE - 1/2 width */}
        <div className="hidden sm:block sm:w-1/2 relative min-h-[300px]">
          <Image
            src={RegisterVector}
            alt="KuwaGo Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center w-full sm:w-1/2 px-6 border-r border-gray-200 space-y-3"
        >
          <h2 className="poppins-bold pt-6 mb-4 text-4xl text-center text-gray-700">
            Create Account
          </h2>

          <div className="grid grid-cols-2">
            {["firstName", "lastName"].map((field) => (
              <div key={field} className="flex flex-col">
                <label htmlFor={field} className="text-sm text-gray-600 pl-3">
                  {field === "firstName" ? "First Name" : "Last Name"}
                </label>
                <input
                  type="text"
                  id={field}
                  name={field}
                  placeholder={placeholderMap[field]}
                  className="px-4 mx-4 py-2 border-2 border-black rounded-4xl focus:outline-none focus:ring-1 focus:ring-gray-400"
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
          </div>

          {["email", "username", "phoneNumber", "password"].map((field) => (
            <div key={field} className="flex flex-col">
              <label htmlFor={field} className="text-sm text-gray-600 pl-3">
                {field === "phoneNumber"
                  ? "Phone Number"
                  : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={field === "password" ? "password" : "text"}
                id={field}
                name={field}
                placeholder={placeholderMap[field]}
                className="px-4 mx-4 py-2 border-2 border-black rounded-4xl focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={formData[field as keyof typeof formData]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer py-2 mt-6 mx-4 shadow-2xl text-white font-semibold rounded-4xl transition duration-200"
            style={{ backgroundColor: '#85d4a4' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#6bc48a'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#85d4a4'}
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
              onMouseEnter={(e) => e.target.style.color = '#6bc48a'}
              onMouseLeave={(e) => e.target.style.color = '#85d4a4'}
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
