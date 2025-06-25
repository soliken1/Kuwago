"use client";
import React, { useEffect, useState } from "react";
import useLoginRequest from "@/hooks/auth/requestLogin";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loader from "../../../../assets/loader/Loader";

export default function LoginForm() {
  const router = useRouter();
  const { login, loginData, loading, error } = useLoginRequest();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [storedUser, setStoredUser] = useState<{
    role?: string;
  }>({});

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setStoredUser(JSON.parse(user));
    }
  }, []);
  useEffect(() => {
    if (loading) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000); // 3 seconds
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password }, () => {
      const userRole = storedUser.role;
      if (userRole === "Admin") {
        router.push("/admindashboard");
      } else if (userRole === "Lender") {
        router.push("/lenderdashboard");
      } else {
        router.push("/dashboard");
      }
    });
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex flex-col items-center justify-center min-h-screen p-4 poppins-normal">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-80 sm:w-96 p-8 bg-white border border-gray-300 rounded-xl shadow-md space-y-6"
        >
          <h2 className="poppins-bold text-2xl font-semibold text-center text-gray-700">
            Login!
          </h2>

          <div className="flex flex-col space-y-1">
            <label htmlFor="email" className="text-sm text-gray-600">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="px-4 py-2 border-2 border-black rounded-4xl focus:outline-none focus:ring-1 focus:ring-grey-400"
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
              placeholder="Enter your password"
              className="px-4 py-2 border-2 border-black rounded-4xl focus:outline-none focus:ring-1 focus:ring-grey-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 shadow-2xl bg-green-400 text-white font-semibold rounded-4xl hover:bg-green-500 transition duration-200 disabled:opacity-50"
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

          <Link
            href="/forgotpassword"
            className="text-sm text-green-400 text-center"
          >
            Forgot Password?
          </Link>
        </form>
      </div>
    </>
  );
}
