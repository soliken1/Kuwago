"use client";
import X from "../../../../assets/actions/X";

interface Props {
  setShowHelpChat: (boolean: boolean) => void;
  setShowChat: (boolean: boolean) => void;
}

export default function FAQChat({ setShowHelpChat, setShowChat }: Props) {
  return (
    <>
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="font-bold text-xl">Help Chat</h2>
        <div className="flex gap-5">
          <button
            onClick={() => setShowHelpChat(false)}
            className="border border-gray-400 rounded-xl px-4"
          >
            Go Back
          </button>
          <button
            onClick={() => setShowChat(false)}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            <X />
          </button>
        </div>
      </div>
      <div className="flex flex-1 font-bold justify-center items-center overflow-hidden">
        I'm Under Construction...
      </div>
    </>
  );
}
