"use client";
import React, { useEffect, useState } from "react";
import useGetAllUsers from "@/hooks/users/requestAllUsers";
import RegisterModal from "./RegisterModal";

export default function Users() {
  const { allUsers, allUsersData, error, loading } = useGetAllUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    allUsers(); // Fetch users on mount
  }, []);

  return (
    <section id="users" className="min-h-screen py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Users</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-white rounded"
          style={{ backgroundColor: '#85d4a4' }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#6bc48a'}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#85d4a4'}
        >
          Register User
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading users...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {allUsersData?.data ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(allUsersData.data) &&
                allUsersData.data.map((user) => (
                  <tr key={user.uid}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.fullName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" style={{ backgroundColor: '#f0f9f4', color: '#2d5a3d' }}>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <p>No users found.</p>
      )}

      <RegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
