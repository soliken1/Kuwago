"use client";
import React from "react";

interface IncomingCallModalProps {
  fromName: string;
  fromImage?: string;
  callLink: string;
  onAccept: () => void;
  onDecline: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  fromName,
  fromImage,
  callLink,
  onAccept,
  onDecline,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-50 z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 max-w-xs w-full">
        {fromImage && (
          <img
            src={fromImage}
            alt={fromName}
            className="w-20 h-20 rounded-full object-cover"
          />
        )}
        <h2 className="text-lg font-semibold">{fromName}</h2>
        <p>is calling you...</p>
        <div className="flex gap-4 mt-4">
          <button
            onClick={onAccept}
            className="text-white px-4 py-2 rounded-lg"
            style={{ backgroundColor: '#85d4a4' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#6bc48a'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#85d4a4'}
          >
            Accept
          </button>
          <button
            onClick={onDecline}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
