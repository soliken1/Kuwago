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
        <p className="px-4 lexend-semibold text-xs sm:text-xs md:text-base lg:text-lg text-gray-600">
          Your trusted partner in smart, simple, and secure lending.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="poppins-normal px-12 py-2 mx-4 text-white rounded-xl transition"
            style={{ backgroundColor: '#85d4a4' }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#6bc48a'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#85d4a4'}
          >
            Login
          </Link>
          <Link
            href="/register"
            className="poppins-normal px-12 py-2 border mx-4 text-black rounded-xl transition"
            style={{ borderColor: '#85d4a4' }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f0f9f4'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
