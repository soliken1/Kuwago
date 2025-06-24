"use client";
import Link from "next/link";
import Image from "next/image";
import KuwagoLogo from "../../assets/images/KuwagoLogo.png";

export default function Home() {
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-white">
      <div className="text-center space-y-6 max-w-xl">
        <div className="flex justify-center">
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto aspect-[3/1]">
            <Image
              src={KuwagoLogo}
              alt="KuwaGo Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <p className="lexend-semibold text-xs sm:text-xs md:text-base lg:text-lg text-gray-600">
          Your trusted partner in smart, simple, and secure lending.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className=" px-10 py-2 bg-green-400 text-white rounded-xl hover:bg-green-500 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-10 py-2 border border-green-400 text-black rounded-xl hover:bg-green-50 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
