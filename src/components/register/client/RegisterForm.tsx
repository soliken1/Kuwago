"use client";
import React, { useState, useEffect } from "react";
import useRegisterRequest from "@/hooks/auth/requestRegister";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (registerData) {
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(formData);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-80 sm:w-xl p-8 bg-white border border-gray-300 rounded-xl shadow-md space-y-4 relative"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
          Create Account
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1">
            <label htmlFor="firstName" className="text-sm text-gray-600">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="lastName" className="text-sm text-gray-600">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <label htmlFor="email" className="text-sm text-gray-600">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label htmlFor="username" className="text-sm text-gray-600">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label htmlFor="phoneNumber" className="text-sm text-gray-600">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label htmlFor="password" className="text-sm text-gray-600">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-green-400 text-white font-semibold rounded-xl hover:bg-green-500 transition duration-200 disabled:opacity-50 mt-4"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Registering...
            </span>
          ) : (
            "Register"
          )}
        </button>

        {/* Error Toast */}
        <div
          className={`fixed top-4 right-4 transform transition-all duration-300 ease-in-out ${
            showError
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }`}
        >
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

        {/* Success Toast */}
        <div
          className={`fixed top-4 right-4 transform transition-all duration-300 ease-in-out ${
            showSuccess
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }`}
        >
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg">
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

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-green-400 hover:text-green-500">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
