"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface LoginResponseModalProps {
  open: boolean;
  type: "success" | "error";
  onClose: () => void;
}

export default function LoginResponseModal({
  open,
  type,
  onClose,
}: LoginResponseModalProps) {
  const [internalOpen, setInternalOpen] = useState(open);

  useEffect(() => {
    setInternalOpen(open);
    if (open) {
      const timer = setTimeout(() => {
        setInternalOpen(false);
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!internalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-white rounded-xl p-8 max-w-sm w-full mx-4 shadow-2xl"
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center ${
              type === "success" ? "" : "bg-red-100"
            }`}
            style={type === "success" ? { backgroundColor: '#f0f9f4' } : {}}
          >
            {type === "success" ? (
              <svg
                className="w-12 h-12"
                style={{ color: '#85d4a4' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
          <p className="text-center text-lg font-semibold">
            {type === "success"
              ? "Login successful!"
              : "Login failed. Please try again."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
