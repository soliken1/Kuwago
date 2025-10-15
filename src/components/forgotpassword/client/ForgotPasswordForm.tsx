"use client";

import usePasswordRequest from "@/hooks/auth/requestPassword";
import { useState } from "react";
import Link from "next/link";
import sendEmailWithLink from "@/utils/sendEmailWithLink";
import Image from "next/image";
import ForgotPassVector from "../../../../assets/images/ForgotPassVector.png";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const { forgotPassword, passwordData, loading, error } = usePasswordRequest();
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [subject, setSubject] = useState("Kuwago Reset Pasword");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSent(false);
    setEmailError("");
    await forgotPassword({ email }, async (data) => {
      setEmail("");
      // If backend returns the structure you posted:
      if (data?.data?.user && data?.data?.verificationLink) {
        const ownerEmail = data.data.user.email;
        const ownerName = `${data.data.user.firstName} ${data.data.user.lastName}`;
        const downloadURL = data.data.verificationLink;
        try {
          await sendEmailWithLink(ownerEmail, ownerName, downloadURL, subject);
          setEmailSent(true);
        } catch (err) {
          setEmailError("Failed to send reset email. Please try again.");
        }
      }
    });
  };

  return (
    <>
      <div className="flex flex-col items-center w-full bg-black/25 justify-center min-h-screen p-4 poppins-normal">
        <div className="flex w-full max-w-4xl bg-white rounded-xl shadow-md overflow-hidden">
          {/* LEFT SIDE: IMAGE - 1/2 width */}
          <div className="hidden sm:block sm:w-1/2 relative min-h-[500px]">
            <Image
              src={ForgotPassVector}
              alt="Forgot Password Vector"
              fill
              className="object-contain"
              priority
            />
          </div>
          {/* RIGHT SIDE: FORM - 1/2 width */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full sm:w-1/2 p-12 border-l border-gray-200 space-y-6 min-h-[500px] justify-center"
          >
            <h2 className="poppins-bold pt-6 mb-12 text-4xl text-center text-gray-700">
              Forgot Password
            </h2>
            <p className="text-sm text-gray-600 text-center mb-4">
              Enter your email and we&apos;ll send you the reset verification
              link.
            </p>
            <div className="flex flex-col space-y-1 py-4">
              <label
                htmlFor="email"
                className="text-sm text-gray-600 pl-3 pt-1 "
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-4 mx-4 py-2 border-2 border-black rounded-4xl focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              onClick={() => setSubject("Kuwago Reset Password")}
              className="cursor-pointer py-2 my-8 mx-4 shadow-2xl text-white font-semibold rounded-4xl transition duration-200"
              style={{ backgroundColor: '#85d4a4' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#6bc48a'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#85d4a4'}
            >
              {loading ? "Please Wait..." : "Send Password Link"}
            </button>
            {emailSent && (
              <p className="text-sm text-center" style={{ color: '#85d4a4' }}>
                Password reset email sent! Please check your inbox.
              </p>
            )}
            {emailError && (
              <p className="text-red-500 text-sm text-center">{emailError}</p>
            )}
            {passwordData?.message && !emailSent && (
              <p className="text-sm text-center" style={{ color: '#85d4a4' }}>
                {passwordData?.message}
              </p>
            )}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <Link
              href="/login"
              className="poppins-bold pt-6 text-sm text-black text-center"
            >
              Back to Login
            </Link>
          </form>
        </div>
      </div>
    </>
  );
}
