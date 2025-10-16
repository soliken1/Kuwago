"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import { useProfile, UserProfile } from "@/hooks/users/useProfile";
import sendEmailWithLink from "@/utils/sendEmailWithLink";

export default function ProfileForm() {
  const [isEditing, setIsEditing] = useState(false);
  const { profile, isLoading, updateProfile, error, fetchUserData } = useProfile();
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
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
  }>({});

  React.useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setStoredUser(parsedUser);
      
      // Populate formData with storedUser data if profile is not available
      if (!profile) {
        setFormData(prev => ({
          ...prev,
          firstName: parsedUser.firstName || "",
          lastName: parsedUser.lastName || "",
          email: parsedUser.email || "",
          phoneNumber: parsedUser.phoneNumber || "",
          profilePicture: parsedUser.profilePicture || "",
        }));
      }
    }
  }, [profile]);

  // Fetch user data from API on component mount
  useEffect(() => {
    fetchUserData();
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
        <div className="p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: '#2c8068' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-8">
          <div className="text-red-500 text-center">
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="p-8">

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-12">
            {/* Left Side - Large Profile Picture */}
            <div className="flex-shrink-0">
              <div className="relative w-64 h-64">
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
                    <span className="text-8xl text-gray-400">
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
                      className="absolute bottom-4 right-4 text-white p-3 rounded-full cursor-pointer shadow-lg"
                      style={{ backgroundColor: '#2c8068' }}
                      onMouseEnter={(e) => (e.target as HTMLLabelElement).style.backgroundColor = '#1f5a4a'}
                      onMouseLeave={(e) => (e.target as HTMLLabelElement).style.backgroundColor = '#2c8068'}
                    >
                      <FiEdit2 size={24} />
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Right Side - Form Fields */}
            <div className="flex-1 space-y-6">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName || ""}
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
                        value={formData.lastName || ""}
                        placeholder="Doe"
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
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
                      value={formData.phoneNumber || ""}
                      placeholder={storedUser.phoneNumber || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 rounded-md border ${
                        isEditing ? "" : "placeholder:text-black"
                      } border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword || ""}
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
                        value={formData.confirmPassword || ""}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {/* Name and Edit Button */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">
                      {storedUser.fullName || "User Name"}
                    </h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 px-4 py-2 rounded-md text-white transition-colors"
                      style={{ backgroundColor: '#2c8068' }}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1f5a4a'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2c8068'}
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

                  {/* User Details */}
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="text-gray-500 text-lg font-medium w-20">Role:</span>
                      <span className="text-gray-800 text-lg ml-4">
                        {storedUser.role || "User"}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <span className="text-gray-500 text-lg font-medium w-20">E-mail:</span>
                      <span className="text-gray-800 text-lg ml-4">
                        {storedUser.email || "No email provided"}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <span className="text-gray-500 text-lg font-medium w-20">Phone:</span>
                      <span className="text-gray-800 text-lg ml-4">
                        {storedUser.phoneNumber || "No phone provided"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-6 py-2 text-gray-700 bg-gray-200 rounded-md transition-colors hover:bg-gray-300"
                  >
                    <FiX size={20} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 text-white rounded-md transition-colors"
                    style={{ backgroundColor: '#2c8068' }}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1f5a4a'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2c8068'}
                  >
                    <FiSave size={20} />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
