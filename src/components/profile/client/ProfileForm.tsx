"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import { useProfile, UserProfile } from "@/hooks/users/useProfile";
import sendEmailWithLink from "@/utils/sendEmailWithLink";

export default function ProfileForm() {
  const [isEditing, setIsEditing] = useState(false);
  const { profile, isLoading, updateProfile, error } = useProfile();
  const [formData, setFormData] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    profilePicture: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [storedUser, setStoredUser] = useState<{
    fullName?: string;
    profilePicture?: string;
    email?: string;
    phoneNumber?: string;
  }>({});

  React.useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setStoredUser(JSON.parse(user));
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { newPassword, confirmPassword } = formData;

    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
    }

    const response = await updateProfile(formData);

    // If the response contains a verification link (i.e., email was changed)
    if (
      response &&
      typeof response === "object" &&
      response.data &&
      response.data.user &&
      response.data.verificationLink
    ) {
      const ownerEmail = response.data.user.email;
      const ownerName = `${response.data.user.firstName} ${response.data.user.lastName}`;
      const downloadURL = response.data.verificationLink;
      const subject = "Kuwago Email Change Verification";

      sendEmailWithLink(ownerEmail, ownerName, downloadURL, subject)
        .then(() => {
          alert("Verification email sent to your new email address!");
        })
        .catch((error) => {
          alert(
            error?.response?.data?.message ||
              "Failed to send verification email. Please try again."
          );
          console.error("EmailJS error:", error);
        });
    }

    if (response && (response === true || response.success)) {
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-red-500 text-center">
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

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
              {formData.profilePicture instanceof File ? (
                <Image
                  src={URL.createObjectURL(formData.profilePicture)}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              ) : storedUser.profilePicture ? (
                <Image
                  src={storedUser.profilePicture}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl text-gray-400">
                    {storedUser.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
              {isEditing && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="profilePictureInput"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData((prev) => ({
                          ...prev,
                          profilePicture: file,
                        }));
                      }
                    }}
                  />
                  <label
                    htmlFor="profilePictureInput"
                    className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 cursor-pointer"
                  >
                    <FiEdit2 size={20} />
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="John"
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={storedUser.fullName || ""}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder={storedUser.email || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-md border ${
                  isEditing ? "" : "placeholder:text-black"
                } border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100`}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder={storedUser.phoneNumber || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-md border ${
                  isEditing ? "" : "placeholder:text-black"
                } border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100`}
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
