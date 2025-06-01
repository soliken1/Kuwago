"use client";
import React, { useState } from "react";
import useLoginRequest from "@/hooks/auth/requestLogin";

export default function LoginForm() {
  const { login, loading, error, loginData } = useLoginRequest();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col w-80 sm:w-96 p-8 bg-white border border-gray-300 rounded-xl shadow-md space-y-6"
    >
      <h2 className="text-2xl font-semibold text-center text-gray-700">
        Login
      </h2>

      <div className="flex flex-col space-y-1">
        <label htmlFor="email" className="text-sm text-gray-600">
          Email
        </label>
        <input
          type="email"
          id="email"
          className="px-4 py-2 border border-gray-300 rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="password" className="text-sm text-gray-600">
          Password
        </label>
        <input
          type="password"
          id="password"
          className="px-4 py-2 border border-gray-300 rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-200 disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      {loginData && (
        <p className="text-sm text-green-600 text-center">Success!</p>
      )}
    </form>
  );
}
