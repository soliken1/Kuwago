"use client";
import React, { useEffect, useState } from "react";
import { UserData } from "@/hooks/users/requestAllUsers";
import useUserDocuments from "@/hooks/users/useUserDocuments";
import useDisableUser from "@/hooks/users/useDisableUser";
import toast from "react-hot-toast";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  onUserDisabled?: () => void;
}

export default function UserDetailsModal({
  isOpen,
  onClose,
  user,
  onUserDisabled,
}: UserDetailsModalProps) {
  const { userDocuments, loading: documentsLoading, fetchUserDocuments } = useUserDocuments();
  const { disableUser, approveUser, denyUser, loading: disableLoading } = useDisableUser();
  const [isApproving, setIsApproving] = useState(false);
  const [isDenying, setIsDenying] = useState(false);

  useEffect(() => {
    if (isOpen && user?.uid) {
      fetchUserDocuments(user.uid);
    }
  }, [isOpen, user?.uid, fetchUserDocuments]);

  const handleApprove = async () => {
    if (!user) return;
    
    setIsApproving(true);
    try {
      await approveUser({
        uid: user.uid,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        phoneNumber: user.phoneNumber || "",
      });
      toast.success("User approved successfully");
      onUserDisabled?.(); // Refresh the users list
      onClose();
    } catch (error) {
      toast.error("Failed to approve user");
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeny = async () => {
    if (!user) return;
    
    setIsDenying(true);
    try {
      await denyUser({
        uid: user.uid,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        phoneNumber: user.phoneNumber || "",
      });
      toast.success("User denied successfully");
      onUserDisabled?.(); // Refresh the users list
      onClose();
    } catch (error) {
      toast.error("Failed to deny user");
    } finally {
      setIsDenying(false);
    }
  };

  const handleDisableUser = async () => {
    if (!user) return;
    
    try {
      await disableUser({
        uid: user.uid,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        phoneNumber: user.phoneNumber || "",
      });
      toast.success("User account disabled successfully");
      onUserDisabled?.();
      onClose();
    } catch (error) {
      toast.error("Failed to disable user account");
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">User Details</h2>
            <p className="text-gray-600 text-sm">View and manage user information</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
            {/* Section 3: Profile Picture */}
          {user.profilePicture && (
            <div>
              <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-5 rounded bg-[#2c8068]" />
              <span className="font-semibold text-sm text-gray-700">
                Profile Information
              </span>
            </div>
              <div className="bg-white-50 rounded-lg p-4">
                <div className="flex justify-center">
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Section 1: Profile Information */}
          <div>
            
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Full Name</span>
                <span className="mt-1 text-gray-800 font-medium">
                  {user.fullName || "N/A"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Email</span>
                <span className="mt-1 text-gray-800 font-medium">
                  {user.email || "N/A"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Phone Number</span>
                <span className="mt-1 text-gray-800 font-medium">
                  {user.phoneNumber || "N/A"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Username</span>
                <span className="mt-1 text-gray-800 font-medium">
                  {user.username || "N/A"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Role</span>
                <span className="mt-1 text-gray-800 font-medium">
                  {user.role || "N/A"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Status</span>
                <span className="mt-1 inline-block w-fit px-3 py-1 text-sm rounded-full font-medium bg-green-100 text-green-700 border border-green-300">
                  {user.status || "Active"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Created At</span>
                <span className="mt-1 text-gray-800 font-medium">
                  {user.createdAt 
                    ? new Date(user.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })
                    : "N/A"
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Business Information */}
          {(user.lenderInstitution || user.lenderAddress || user.businessName || user.businessAddress) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block w-2 h-5 rounded bg-blue-400" />
                <span className="font-semibold text-sm text-gray-700">
                  Business Information
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                {user.lenderInstitution && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Lender Institution</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {user.lenderInstitution}
                    </span>
                  </div>
                )}
                {user.lenderAddress && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Lender Address</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {user.lenderAddress}
                    </span>
                  </div>
                )}
                {user.businessName && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Business Name</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {user.businessName}
                    </span>
                  </div>
                )}
                {user.businessAddress && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Business Address</span>
                    <span className="mt-1 text-gray-800 font-medium">
                      {user.businessAddress}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          

          {/* Section 4: Uploaded Documents */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-5 rounded bg-orange-400" />
              <span className="font-semibold text-sm text-gray-700">
                Uploaded Documents
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
            {documentsLoading ? (
              <p className="text-gray-500 text-center py-4">Loading documents...</p>
            ) : userDocuments.length > 0 ? (
              <div className="space-y-3">
                {userDocuments.map((doc, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Document Set {index + 1}
                      </span>
                      <span className="text-xs text-gray-500">
                        Uploaded: {new Date(doc.uploadedAtDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {doc.documentUrls.map((url, urlIndex) => (
                        <a
                          key={urlIndex}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2 bg-white rounded border hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-gray-700 truncate">
                              Document {urlIndex + 1}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                    {doc.remarks && (
                      <div className="mt-2">
                        <label className="text-xs font-medium text-gray-600">Remarks:</label>
                        <p className="text-sm text-gray-700">{doc.remarks}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No documents uploaded</p>
            )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleDisableUser}
            disabled={disableLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {disableLoading ? "Disabling..." : "Disable Account"}
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleDeny}
              disabled={isDenying}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDenying ? "Denying..." : "Deny"}
            </button>
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="px-6 py-2 bg-[#2c8068] text-white rounded-lg hover:bg-[#1f5a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApproving ? "Approving..." : "Approve"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
