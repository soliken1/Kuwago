"use client";
import React from "react";

export default function Settings() {
  return (
    <section id="settings" className="min-h-screen py-8">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">General Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Enable Notifications</span>
                <button className="bg-gray-200 relative inline-flex h-6 w-11 items-center rounded-full">
                  <span className="sr-only">Enable notifications</span>
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Dark Mode</span>
                <button className="bg-gray-200 relative inline-flex h-6 w-11 items-center rounded-full">
                  <span className="sr-only">Enable dark mode</span>
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
