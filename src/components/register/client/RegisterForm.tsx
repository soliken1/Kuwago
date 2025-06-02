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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(formData, () => router.push("/login"));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col w-80 sm:w-96 p-8 bg-white border border-gray-300 rounded-xl shadow-md space-y-4"
    >
      <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
        Create an Account
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
            className="px-4 py-2 border border-gray-300 rounded-md"
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
            className="px-4 py-2 border border-gray-300 rounded-md"
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
          className="px-4 py-2 border border-gray-300 rounded-md"
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
          className="px-4 py-2 border border-gray-300 rounded-md"
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
          className="px-4 py-2 border border-gray-300 rounded-md"
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
          className="px-4 py-2 border border-gray-300 rounded-md"
          value={formData.password}
          onChange={handleChange}
          required
        />
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
