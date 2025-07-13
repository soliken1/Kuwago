"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import useLoginRequest from "@/hooks/auth/requestLogin";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loader from "../../../../assets/loader/Loader";
import LoginVector from "../../../../assets/images/LoginVector.png";
import LoginResponseModal from "./LoginResponseModal";

export default function LoginForm() {
  const router = useRouter();
  const { login, loginData, loading, error } = useLoginRequest();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [storedUser, setStoredUser] = useState<{
    role?: string;
  }>({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");

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

  useEffect(() => {
    if (!loading && (loginData || error)) {
      if (loginData && !error) {
        setModalType("success");
        setShowModal(true);
        const userRole = storedUser.role;
        if (userRole === "Admin") {
          router.push("/admindashboard");
        } else if (userRole === "Lender") {
          router.push("/lenderdashboard");
        } else {
          router.push("/dashboard");
        }
      } else if (error) {
        setModalType("error");
        setShowModal(true);
      }
    }
  }, [loginData, error, loading, storedUser.role, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <>
      {isLoading && <Loader />}
      <LoginResponseModal
        open={showModal}
        type={modalType}
        onClose={() => setShowModal(false)}
      />
      <div className="flex flex-col items-center w-full bg-black/25 justify-center min-h-screen p-4 poppins-normal">
        <div className="flex w-full max-w-4xl bg-white rounded-xl shadow-md overflow-hidden">
          {/* LEFT SIDE: FORM - 1/2 width */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full sm:w-1/2 p-8 border-r border-gray-200 space-y-6 "
          >
            <h2 className="poppins-bold pt-6 mb-12 text-4xl text-center text-gray-700">
              L o g i n !
            </h2>

            <div className="flex flex-col space-y-1">
              <label
                htmlFor="email"
                className="text-sm text-gray-600 pl-3 pt-1 "
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="px-4 mx-4 py-2 border-2 border-black rounded-4xl focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label
                htmlFor="password"
                className="text-sm text-gray-600 pl-3 pt-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                className="px-4 mx-4 py-2 border-2 border-black rounded-4xl focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer py-2 my-8 mx-4 shadow-2xl bg-green-400 text-white font-semibold rounded-4xl hover:bg-green-500 transition duration-200 "
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="poppins-bold text-green-400 hover:text-green-500"
              >
                Register
              </Link>
            </p>

            <Link
              href="/forgotpassword"
              className="poppins-bold pt-6 text-sm text-black text-center"
            >
              Forgot Password?
            </Link>
          </form>

          {/* RIGHT SIDE: IMAGE - 1/2 width */}
          <div className="hidden sm:block sm:w-1/2 relative min-h-[300px]">
            <Image
              src={LoginVector}
              alt="KuwaGo Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </>
  );
}
