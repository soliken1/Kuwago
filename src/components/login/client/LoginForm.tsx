"use client";
import React, { useState } from "react";
import useLoginRequest from "@/hooks/auth/requestLogin";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const { login, loading, error, loginData } = useLoginRequest();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password }, () => router.push("/dashboard"));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-80 sm:w-96 p-8 bg-white border border-gray-300 rounded-xl shadow-md space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-700">
          Welcome Back
        </h2>

        <div className="flex flex-col space-y-1">
          <label htmlFor="email" className="text-sm text-gray-600">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-green-400 text-white font-semibold rounded-xl hover:bg-green-500 transition duration-200 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        {loginData && (
          <p className="text-sm text-green-600 text-center">
            {loginData.message}
          </p>
        )}

        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-green-400 hover:text-green-500"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
