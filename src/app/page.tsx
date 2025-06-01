"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-white">
      <div className="text-center space-y-6 max-w-xl">
        <h1 className="text-5xl font-bold text-gray-800">
          Welcome to <span className="text-green-400">KuwaGo</span>
        </h1>
        <p className="text-lg text-gray-600">
          Your trusted partner in smart, simple, and secure lending.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="px-6 py-2 bg-green-400 text-white rounded-xl hover:bg-green-500 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-2 border border-green-400 text-green-400 rounded-xl hover:bg-green-50 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
