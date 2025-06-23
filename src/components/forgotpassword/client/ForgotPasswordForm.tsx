"use client";

import usePasswordRequest from "@/hooks/auth/requestPassword";
import { useState } from "react";
import Link from "next/link";
import sendEmailWithLink from "@/utils/sendEmailWithLink";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const { forgotPassword, passwordData, loading, error } = usePasswordRequest();
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [subject, setSubject] = useState("Kuwago Reset Pasword")

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-80 sm:w-96 p-8 bg-white border border-gray-300 rounded-xl shadow-md space-y-6"
      >
        <h2 className="text-2xl font-semibold  text-center">Forgot Password</h2>
        <p className="text-sm text-gray-600 text-center">
          Enter your email and we&apos;ll send you reset instructions.
        </p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <button
          type="submit"
          disabled={loading}
          onClick={() => setSubject ("Kuwago Reset Password")}
          className="bg-green-400 disabled:opacity-50 hover:bg-green-500 text-white rounded-md py-2 font-semibold transition-colors duration-200"
        >
          {loading ? "Please Wait..." : "Send Password Link"}
        </button>

        {emailSent && (
          <p className="text-green-600 text-sm text-center">
            Password reset email sent! Please check your inbox.
          </p>
        )}
        {emailError && (
          <p className="text-red-500 text-sm text-center">{emailError}</p>
        )}
        {passwordData?.message && !emailSent && (
          <p className="text-green-600 text-sm text-center">
            {passwordData?.message}
          </p>
        )}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <Link
          href="/login"
          className="text-green-500 text-sm text-center hover:underline"
        >
          Back to Login
        </Link>
      </form>
    </div>
  );
}
