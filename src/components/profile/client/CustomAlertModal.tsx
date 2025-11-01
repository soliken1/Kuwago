"use client";
import React from "react";

interface CustomAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  showCancel?: boolean;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  confidence?: number;
}

export default function CustomAlertModal({
  isOpen,
  onClose,
  title,
  message,
  type,
  showCancel = false,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
  confidence,
}: CustomAlertModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-green-600"
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
          </div>
        );
      case "error":
        return (
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-red-600"
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
          </div>
        );
      case "warning":
        return (
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        );
      case "info":
        return (
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "success":
        return "text-white font-semibold transition-colors duration-200";
      case "error":
        return "text-white font-semibold transition-colors duration-200";
      case "warning":
        return "text-white font-semibold transition-colors duration-200";
      case "info":
        return "text-white font-semibold transition-colors duration-200";
      default:
        return "text-white font-semibold transition-colors duration-200";
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case "success":
        return { backgroundColor: "#2c8068" };
      case "error":
        return { backgroundColor: "#dc2626" };
      case "warning":
        return { backgroundColor: "#d97706" };
      case "info":
        return { backgroundColor: "#2c8068" };
      default:
        return { backgroundColor: "#2c8068" };
    }
  };

  const getButtonHoverStyle = () => {
    switch (type) {
      case "success":
        return "#256b56";
      case "error":
        return "#b91c1c";
      case "warning":
        return "#b45309";
      case "info":
        return "#256b56";
      default:
        return "#256b56";
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center px-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-8 relative animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          {getIcon()}
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2 poppins-bold">
            {title}
          </h2>
          
          <p className="text-gray-600 mb-4 poppins-normal">
            {message}
          </p>
          
          {confidence !== undefined && (
            <div className="mb-8 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-center text-gray-700 poppins-medium">
                <span className="text-2xl font-bold text-green-600">{confidence}%</span>
                <br />
                <span className="text-sm">Face Match Confidence</span>
              </p>
            </div>
          )}

          <div className="flex gap-3 w-full">
            {showCancel && (
              <button
                onClick={onClose}
                className="flex-1 py-3 px-6 text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-colors poppins-medium"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`flex-1 py-3 px-6 rounded-lg transition-colors duration-200 poppins-bold ${getButtonColor()}`}
              style={getButtonStyle()}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = getButtonHoverStyle())}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = getButtonStyle().backgroundColor)}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
