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
  const [modalMessage, setModalMessage] = useState<string>("");

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
        setModalMessage(loginData.message);
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
        setModalMessage(error);
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
        message={modalMessage}
        onClose={() => setShowModal(false)}
      />
      <div className="flex flex-col items-center w-full bg-black/25 justify-center min-h-screen p-4 poppins-normal">
        <div className="flex w-[800px] h-[500px] bg-white rounded-xl shadow-md overflow-hidden">
          {/* LEFT SIDE: FORM - 1/2 width */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full sm:w-1/2 p-8 border-r border-gray-200 space-y-6 "
          >
            <h2 className="poppins-bold pt-6 mb-12 text-4xl text-center text-gray-700">
              Login
            </h2>

            <div className="flex flex-col space-y-4">
              <input
                type="email"
                id="email"
                placeholder="Username"
                className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                id="password"
                placeholder="Password"
                className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex justify-end">
                <Link
                  href="/forgotpassword"
                  className="text-sm"
                  style={{ color: '#85d4a4' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#6bc48a'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#85d4a4'}
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-white font-bold rounded-2xl transition duration-200 mt-6"
                style={{ backgroundColor: '#85d4a4' }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#6bc48a'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#85d4a4'}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="poppins-bold"
                  style={{ color: '#85d4a4' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#6bc48a'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#85d4a4'}
                >
                  Register
                </Link>
              </p>
            </div>
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
