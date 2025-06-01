"use client";
import React, { useState } from "react";
import useRegisterRequest from "@/hooks/auth/requestRegister";
import { useRouter } from "next/navigation";

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
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Check if any field is empty (except role since it has a default value)
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "role" && !value.toString().trim()) {
        errors[key] = `${
          key.charAt(0).toUpperCase() + key.slice(1)
        } is required`;
      }
    });

    // Password validation
    if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone number validation (basic)
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid phone number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await register(formData, () => router.push("/login"));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col w-80 sm:w-96 p-8 bg-white border border-gray-300 rounded-xl shadow-md space-y-4"
    >
      <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
        Register
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
            className={`px-4 py-2 border ${
              validationErrors.firstName ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          {validationErrors.firstName && (
            <p className="text-xs text-red-500">{validationErrors.firstName}</p>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <label htmlFor="lastName" className="text-sm text-gray-600">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className={`px-4 py-2 border ${
              validationErrors.lastName ? "border-red-500" : "border-gray-300"
            } rounded-md`}
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          {validationErrors.lastName && (
            <p className="text-xs text-red-500">{validationErrors.lastName}</p>
          )}
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
          className={`px-4 py-2 border ${
            validationErrors.email ? "border-red-500" : "border-gray-300"
          } rounded-md`}
          value={formData.email}
          onChange={handleChange}
          required
        />
        {validationErrors.email && (
          <p className="text-xs text-red-500">{validationErrors.email}</p>
        )}
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="username" className="text-sm text-gray-600">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          className={`px-4 py-2 border ${
            validationErrors.username ? "border-red-500" : "border-gray-300"
          } rounded-md`}
          value={formData.username}
          onChange={handleChange}
          required
        />
        {validationErrors.username && (
          <p className="text-xs text-red-500">{validationErrors.username}</p>
        )}
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="phoneNumber" className="text-sm text-gray-600">
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          className={`px-4 py-2 border ${
            validationErrors.phoneNumber ? "border-red-500" : "border-gray-300"
          } rounded-md`}
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
        {validationErrors.phoneNumber && (
          <p className="text-xs text-red-500">{validationErrors.phoneNumber}</p>
        )}
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="password" className="text-sm text-gray-600">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className={`px-4 py-2 border ${
            validationErrors.password ? "border-red-500" : "border-gray-300"
          } rounded-md`}
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
        />
        {validationErrors.password && (
          <p className="text-xs text-red-500">{validationErrors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-200 disabled:opacity-50 mt-4"
      >
        {loading ? "Registering..." : "Register"}
      </button>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      {registerData && (
        <p className="text-sm text-green-600 text-center">
          Registration successful!
        </p>
      )}
    </form>
  );
}
