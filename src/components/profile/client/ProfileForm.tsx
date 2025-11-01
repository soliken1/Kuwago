"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import { useProfile, UserProfile } from "@/hooks/users/useProfile";
import useGetLenderDetails from "@/hooks/users/useLenderDetails";
import useUpdateLenderDetails, { UpdateLenderDetailsPayload } from "@/hooks/users/useUpdateLenderDetails";
import useCreateLenderDetails, { CreateLenderDetailsPayload } from "@/hooks/users/useCreateLenderDetails";
import sendEmailWithLink from "@/utils/sendEmailWithLink";

export default function ProfileForm() {
  const [isEditing, setIsEditing] = useState(false);
  const { profile, isLoading, updateProfile, error, fetchUserData } = useProfile();
  const { lenderUsers, lendersData, loading: lenderLoading, error: lenderError } = useGetLenderDetails();
  const { updateLenderDetails, loading: updatingLender, error: updateLenderError } = useUpdateLenderDetails();
  const { createLenderDetails, loading: creatingLender, error: createLenderError } = useCreateLenderDetails();
  const [isCreatingLender, setIsCreatingLender] = useState(false);
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
  const [lenderFormData, setLenderFormData] = useState<UpdateLenderDetailsPayload>({
    principalAmount: 0,
    termsOfPayment: [],
    interestRates: [],
    subscriptionType: 0,
    gracePeriod: 0,
    lenderTIN: "",
  });
  const [termsOfPaymentInput, setTermsOfPaymentInput] = useState<string>("");
  const [interestRatesInput, setInterestRatesInput] = useState<string>("");

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

  // Fetch lender details if user is a Lender
  useEffect(() => {
    if (storedUser.role === "Lenders") {
      lenderUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedUser.role]);

  // Initialize lender form data when lender details are loaded
  useEffect(() => {
    if (lendersData?.data) {
      const details = lendersData.data;
      setLenderFormData({
        principalAmount: details.principalAmount || 0,
        termsOfPayment: details.termsOfPayment || [],
        interestRates: details.interestRates || [],
        subscriptionType: details.subscriptionType || 0,
        gracePeriod: details.gracePeriod || 0,
        lenderTIN: details.lenderTIN || "",
      });
      // Initialize input strings from arrays
      setTermsOfPaymentInput(details.termsOfPayment ? details.termsOfPayment.join(", ") : "");
      setInterestRatesInput(details.interestRates ? details.interestRates.join(", ") : "");
    }
  }, [lendersData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLenderInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setLenderFormData((prev) => ({
      ...prev,
      [name]: name === "principalAmount" || name === "subscriptionType" || name === "gracePeriod"
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleArrayInputChange = (
    name: "termsOfPayment" | "interestRates",
    value: string
  ) => {
    // Store the raw input value for display
    if (name === "termsOfPayment") {
      setTermsOfPaymentInput(value);
    } else {
      setInterestRatesInput(value);
    }

    // Parse numbers from the input
    const numbers = value
      .split(",")
      .map((item) => parseFloat(item.trim()))
      .filter((item) => !isNaN(item));
    
    setLenderFormData((prev) => ({
      ...prev,
      [name]: numbers,
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
      // Reload user data after successful update
      fetchUserData();
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("userDataUpdated"));
    }
  };

  const handleLenderUpdate = async () => {
    try {
      // Use original subscriptionType from lenderDetails (not editable)
      const updatePayload = {
        ...lenderFormData,
        subscriptionType: lenderDetails?.subscriptionType || 0,
      };
      const response = await updateLenderDetails(updatePayload);
      if (response && response.success) {
        alert("Lender details updated successfully!");
        lenderUsers(); // Refresh lender details
        // Exit edit mode after successful update
        setIsEditing(false);
      } else {
        alert(response?.message || "Failed to update lender details");
      }
    } catch (error) {
      alert(updateLenderError || "Failed to update lender details");
    }
  };

  const handleLenderCancel = () => {
    // Reset lender form data to original values
    if (lendersData?.data) {
      const details = lendersData.data;
      setLenderFormData({
        principalAmount: details.principalAmount || 0,
        termsOfPayment: details.termsOfPayment || [],
        interestRates: details.interestRates || [],
        subscriptionType: details.subscriptionType || 0,
        gracePeriod: details.gracePeriod || 0,
        lenderTIN: details.lenderTIN || "",
      });
    } else {
      // Reset to empty values if creating new
      setLenderFormData({
        principalAmount: 0,
        termsOfPayment: [],
        interestRates: [],
        subscriptionType: 0,
        gracePeriod: 0,
        lenderTIN: "",
      });
      setTermsOfPaymentInput("");
      setInterestRatesInput("");
    }
    // Exit edit/create mode
    setIsEditing(false);
    setIsCreatingLender(false);
  };

  const handleCreateLender = async () => {
    try {
      const createPayload: CreateLenderDetailsPayload = {
        principalAmount: lenderFormData.principalAmount,
        termsOfPayment: lenderFormData.termsOfPayment,
        interestRates: lenderFormData.interestRates,
        subscriptionType: lenderFormData.subscriptionType || 0,
        gracePeriod: lenderFormData.gracePeriod,
        lenderTIN: lenderFormData.lenderTIN,
      };
      const response = await createLenderDetails(createPayload);
      if (response && response.success) {
        alert("Lender details created successfully!");
        lenderUsers(); // Refresh lender details
        setIsCreatingLender(false);
        setIsEditing(false);
      } else {
        alert(response?.message || "Failed to create lender details");
      }
    } catch (error) {
      alert(createLenderError || "Failed to create lender details");
    }
  };

  const getSubscriptionTypeLabel = (type: number | undefined): string => {
    switch (type) {
      case 0:
        return "Free Account";
      case 1:
        return "Monthly Subscription";
      case 2:
        return "Annual Subscription";
      default:
        return "N/A";
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

  const lenderDetails = lendersData?.data;
  const isLender = storedUser.role === "Lenders";
  // Check if lender details is 404 or doesn't exist
  const isLenderDetailsNotFound = !lenderLoading && !lenderDetails && (
    !lenderError || 
    lenderError?.includes("404") || 
    lenderError?.includes("Not Found") ||
    (lenderError && !lenderError.includes("Failed to fetch")) ||
    lendersData?.statusCode === 404
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
            <p className="text-gray-600 text-sm">View and manage your profile details</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors"
              style={{ backgroundColor: '#2c8068' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1f5a4a'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2c8068'}
            >
              <FiEdit2 size={20} />
              Edit Profile
            </button>
          )}
        </div>

        {/* Section 1: Profile Picture */}
        {!isLoading && storedUser.fullName && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-5 rounded bg-[#2c8068]" />
              <span className="font-semibold text-sm text-gray-700">
                Profile Picture
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-center">
              <div className="relative w-32 h-32">
                {formData.profilePicture instanceof File ? (
                  <Image
                    src={URL.createObjectURL(formData.profilePicture)}
                    alt="Profile"
                    fill
                    className="rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : storedUser.profilePicture ? (
                  <Image
                    src={storedUser.profilePicture}
                    alt="Profile"
                    fill
                    className="rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
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
                      className="absolute bottom-0 right-0 text-white p-2 rounded-full cursor-pointer shadow-lg"
                      style={{ backgroundColor: '#2c8068' }}
                      onMouseEnter={(e) => (e.target as HTMLLabelElement).style.backgroundColor = '#1f5a4a'}
                      onMouseLeave={(e) => (e.target as HTMLLabelElement).style.backgroundColor = '#2c8068'}
                    >
                      <FiEdit2 size={20} />
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Section 2: Profile Information */}
        {!isLoading && storedUser.fullName && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-5 rounded bg-[#2c8068]" />
              <span className="font-semibold text-sm text-gray-700">
                Profile Information
              </span>
            </div>
          {isEditing ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm text-gray-500">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ""}
                    placeholder="John"
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#2c8068] focus:border-transparent bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-gray-500">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ""}
                    placeholder="Doe"
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#2c8068] focus:border-transparent bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-gray-500">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    placeholder={storedUser.email || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#2c8068] focus:border-transparent bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-gray-500">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    placeholder={storedUser.phoneNumber || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#2c8068] focus:border-transparent bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-gray-500">Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword || ""}
                    onChange={handleInputChange}
                    placeholder="Leave blank to keep current"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#2c8068] focus:border-transparent bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-gray-500">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword || ""}
                    onChange={handleInputChange}
                    placeholder="Leave blank to keep current"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#2c8068] focus:border-transparent bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg transition-colors hover:bg-gray-300"
                >
                  <FiX size={20} />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#2c8068' }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1f5a4a'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2c8068'}
                >
                  <FiSave size={20} />
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              {isLoading || !storedUser.fullName ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: '#2c8068' }}></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Full Name</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {storedUser.fullName}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {storedUser.email}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Phone Number</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {storedUser.phoneNumber}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Role</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {storedUser.role}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        )}

        {/* Section 3: Lender Information */}
        {isLender && !isLoading && storedUser.fullName && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-5 rounded bg-blue-400" />
              <span className="font-semibold text-sm text-gray-700">
                Lender Information
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              {lenderLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: '#2c8068' }}></div>
                </div>
              ) : isLenderDetailsNotFound && !isCreatingLender && !isEditing ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">Lender information not found</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingLender(true);
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-[#2c8068] text-white rounded-lg hover:bg-[#1f5a4a] transition-colors mx-auto"
                  >
                    <FiEdit2 size={20} />
                    Create Information
                  </button>
                </div>
              ) : lenderError && !isLenderDetailsNotFound ? (
                <div className="text-red-500 text-center py-4">
                  <p>Error loading lender details: {lenderError}</p>
                </div>
              ) : lenderDetails || isCreatingLender ? (
                <>
                  {(isEditing || isCreatingLender) ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm text-gray-500">Principal Amount</label>
                          <input
                            type="number"
                            name="principalAmount"
                            value={lenderFormData.principalAmount}
                            onChange={handleLenderInputChange}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#2c8068] focus:border-transparent bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm text-gray-500">Grace Period (days)</label>
                          <input
                            type="number"
                            name="gracePeriod"
                            value={lenderFormData.gracePeriod}
                            onChange={handleLenderInputChange}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#2c8068] focus:border-transparent bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm text-gray-500">Lender TIN</label>
                          <input
                            type="text"
                            name="lenderTIN"
                            value={lenderFormData.lenderTIN}
                            onChange={handleLenderInputChange}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#2c8068] focus:border-transparent bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm text-gray-500">Terms of Payment (comma-separated, e.g., 1, 2, 3)</label>
                          <input
                            type="text"
                            value={termsOfPaymentInput}
                            onChange={(e) => handleArrayInputChange("termsOfPayment", e.target.value)}
                            placeholder="1, 2, 3, 5"
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#2c8068] focus:border-transparent bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm text-gray-500">Interest Rates (comma-separated, e.g., 1, 2, 3)</label>
                          <input
                            type="text"
                            value={interestRatesInput}
                            onChange={(e) => handleArrayInputChange("interestRates", e.target.value)}
                            placeholder="1, 2, 3, 4"
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#2c8068] focus:border-transparent bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleLenderCancel}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg transition-colors hover:bg-gray-300"
                        >
                          <FiX size={20} />
                          Cancel
                        </button>
                        {isCreatingLender ? (
                          <button
                            type="button"
                            onClick={handleCreateLender}
                            disabled={creatingLender}
                            className="flex items-center gap-2 px-4 py-2 bg-[#2c8068] text-white rounded-lg hover:bg-[#1f5a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiSave size={20} />
                            {creatingLender ? "Creating..." : "Create Lender Details"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleLenderUpdate}
                            disabled={updatingLender}
                            className="flex items-center gap-2 px-4 py-2 bg-[#2c8068] text-white rounded-lg hover:bg-[#1f5a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiSave size={20} />
                            {updatingLender ? "Saving..." : "Save Lender Details"}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : lenderDetails ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Principal Amount</span>
                        <span className="mt-1 text-gray-800 font-medium">
                          ₱{lenderDetails.principalAmount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Subscription Type</span>
                        <span className="mt-1 text-gray-800 font-medium">
                          {getSubscriptionTypeLabel(lenderDetails.subscriptionType)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Grace Period</span>
                        <span className="mt-1 text-gray-800 font-medium">
                          {lenderDetails.gracePeriod} days
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Lender TIN</span>
                        <span className="mt-1 text-gray-800 font-medium">
                          {lenderDetails.lenderTIN}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Institution</span>
                        <span className="mt-1 text-gray-800 font-medium">
                          {lenderDetails.lenderInstitution}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Address</span>
                        <span className="mt-1 text-gray-800 font-medium">
                          {lenderDetails.lenderAddress}
                        </span>
                      </div>
                      {lenderDetails.termsOfPayment && lenderDetails.termsOfPayment.length > 0 && (
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500">Terms of Payment</span>
                          <span className="mt-1 text-gray-800 font-medium">
                            {lenderDetails.termsOfPayment.map((term, index) => (
                              <span key={index}>
                                {term} {term === 1 ? "month" : "months"}{index < lenderDetails.termsOfPayment!.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </span>
                        </div>
                      )}
                      {lenderDetails.interestRates && lenderDetails.interestRates.length > 0 && (
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500">Interest Rates</span>
                          <span className="mt-1 text-gray-800 font-medium">
                            {lenderDetails.interestRates.map((rate, index) => (
                              <span key={index}>
                                {rate}%{index < lenderDetails.interestRates!.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
