"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";

interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  profilePicture: string;
}

export default function ProfileForm() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    profilePicture: "/Images/User.jpg",
  });

  useEffect(() => {
    // TODO: Fetch user profile data from API
    // For now using localStorage data
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setProfile({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        address: userData.address || "",
        profilePicture: userData.profilePicture || "/Images/User.jpg",
      });
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to update profile
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Profile Information
          </h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            {isEditing ? (
              <>
                <FiX size={20} />
                Cancel
              </>
            ) : (
              <>
                <FiEdit2 size={20} />
                Edit Profile
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 mb-4">
              <Image
                src={profile.profilePicture}
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
              {isEditing && (
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                >
                  <FiEdit2 size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={profile.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                <FiSave size={20} />
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
