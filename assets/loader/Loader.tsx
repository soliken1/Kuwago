import React from "react";

export default function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 min-w-[200px] min-h-[150px] flex flex-col items-center justify-center">
        <div className="loader">
          <div className="loader__balls">
            <div className="loader__balls__group">
              <div className="ball item1"></div>
              <div className="ball item1"></div>
              <div className="ball item1"></div>
            </div>
            <div className="loader__balls__group">
              <div className="ball item2"></div>
              <div className="ball item2"></div>
              <div className="ball item2"></div>
            </div>
            <div className="loader__balls__group">
              <div className="ball item3"></div>
              <div className="ball item3"></div>
              <div className="ball item3"></div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-gray-700 font-medium text-sm">Loading</p>
      </div>
    </div>
  );
}
