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
        <div className="flex w-[800px] h-[500px] bg-white rounded-xl shadow-md overflow-hidden">
          {/* LEFT SIDE: IMAGE - 1/2 width */}
          <div className="hidden sm:block sm:w-1/2 relative min-h-[300px]">
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
            className="flex flex-col w-full sm:w-1/2 p-8 border-l border-gray-200 space-y-6"
          >
            <h2 className="poppins-bold pt-6 mb-4 text-4xl text-center text-gray-700">
              Forgot Password
            </h2>
            <p className="text-sm text-gray-600 text-center mb-10">
              Enter your email and we&apos;ll send you the reset verification
              link.
            </p>

            <div className="flex flex-col space-y-4">
              <input
                type="email"
                id="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-gray-400 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              onClick={() => setSubject("Kuwago Reset Password")}
              className="w-full py-3 text-white font-bold rounded-2xl transition duration-200 mt-6"
              style={{ backgroundColor: '#85d4a4' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#6bc48a'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#85d4a4'}
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
            <p className="text-center text-sm text-gray-600 mt-4">
              Remember your password?{" "}
              <Link
                href="/login"
                className="poppins-bold"
                style={{ color: '#85d4a4' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#6bc48a'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#85d4a4'}
              >
                Back to Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
