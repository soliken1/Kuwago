"use client";
import React, { useEffect, useState } from "react";
import useGetAllUsers from "@/hooks/users/requestAllUsers";
import RegisterModal from "./RegisterModal";
import UserDetailsModal from "./UserDetailsModal";
import useDisableUser from "@/hooks/users/useDisableUser";
import toast from "react-hot-toast";

export default function Users() {
  const { allUsers, allUsersData, error, loading } = useGetAllUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { disableUser, loading: disableLoading } = useDisableUser();

  useEffect(() => {
    allUsers(); // Fetch users on mount
  }, []);

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsUserDetailsModalOpen(true);
  };

  const handleDisableUser = async (user: any) => {
    if (window.confirm(`Are you sure you want to disable ${user.fullName || user.email}'s account?`)) {
      try {
        await disableUser({
          uid: user.uid,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber || "",
        });
        toast.success("User account disabled successfully");
        allUsers(); // Refresh the users list
      } catch (error) {
        toast.error("Failed to disable user account");
      }
    }
  };

  const handleUserUpdated = () => {
    allUsers(); // Refresh the users list
  };

  return (
    <div className="py-8">
      <div className="bg-white rounded-2xl shadow-lg">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Users Management</h2>
              <p className="text-gray-600 text-sm">Manage all platform users</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#2c8068' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1a5a4a'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2c8068'}
            >
              Register User
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-red-500">
                    Error: {error}
                  </td>
                </tr>
              )}
              {!loading && (!allUsersData?.data || !Array.isArray(allUsersData.data) || allUsersData.data.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
              {Array.isArray(allUsersData?.data) &&
                allUsersData.data.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt="Profile"
                            className="w-8 h-8 rounded-full object-cover mr-3 "
                          />
                        ) : (
                          <div className="w-8 h-8 bg-[#2c8068] rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-sm font-bold">
                              {(user.fullName || "U").charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.role || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-300">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-[#2c8068] hover:text-[#1f5a4a] transition-colors"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDisableUser(user)}
                          disabled={disableLoading}
                          className="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Disable Account"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <RegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <UserDetailsModal
        isOpen={isUserDetailsModalOpen}
        onClose={() => setIsUserDetailsModalOpen(false)}
        user={selectedUser}
        onUserDisabled={handleUserUpdated}
      />
    </div>
  );
}
