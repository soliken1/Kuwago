"use client";
import React, { useState, useEffect } from "react";
import UserListChat from "@/components/messaging/client/UserListChat";
import { useFetchAllLoans } from "@/hooks/lend/fetchAllLoans";
import toast from "react-hot-toast";
import { chatClient } from "@/utils/streamClient";
import { useUpdateLoanStatus } from "@/hooks/lend/requestUpdateLoan";

export default function DashboardBody() {
  const { updateLoanStatus } = useUpdateLoanStatus();
  const [showModal, setShowModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍
  const { fetchAllLoans, loading } = useFetchAllLoans();
  const [storedUser, setStoredUser] = useState<{
    uid?: string;
    username?: string;
  }>({});

  useEffect(() => {
    const getLoans = async () => {
      try {
        const data = await fetchAllLoans();
        setLoans(data);
      } catch (err) {
        toast.error("Failed to fetch loan requests.");
      }
    };
    getLoans();
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setStoredUser(JSON.parse(user));
  }, []);

  const openModal = (loan: any) => {
    setSelectedLoan(loan);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedLoan(null);
    setShowModal(false);
  };

  const sendMessage = async () => {
    await sendLoanApplicationMessage({
      borrowerId: selectedLoan.loanInfo.uid,
      lenderId: storedUser.uid,
      lenderName: storedUser.username,
      loanPurpose: selectedLoan.loanInfo.loanPurpose,
      loanAmount: selectedLoan.loanInfo.loanAmount,
      loanDate: new Date().toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });

    await updateLoanStatus(
      selectedLoan.loanInfo.loanRequestID,
      "InProgress",
      selectedLoan.loanInfo.loanAmount
    );

    closeModal();
  };

  const sendLoanApplicationMessage = async ({
    borrowerId,
    lenderId,
    lenderName,
    loanPurpose,
    loanAmount,
    loanDate,
  }: {
    borrowerId: string;
    lenderId: string | any;
    lenderName: string | any;
    loanPurpose: string;
    loanAmount: number;
    loanDate: string;
  }) => {
    try {
      const channel = chatClient.channel("messaging", {
        members: [borrowerId, lenderId],
      });

      await channel.watch();

      const messageText = `
      Your loan was acknowledged please start here!

      Lender: ${lenderName}  
      Purpose: ${loanPurpose}  
      Amount: ₱${loanAmount.toLocaleString()}  
      Date: ${loanDate}
          `.trim();

      await channel.sendMessage({ text: messageText });
    } catch (error) {
      console.error("Failed to send loan application message:", error);
    }
  };

  const filteredLoans = loans
    .filter(({ loanInfo }) => loanInfo.loanStatus === "Pending")
    .filter(({ userInfo }) => {
      const term = searchTerm.toLowerCase();
      return (
        userInfo.firstName.toLowerCase().includes(term) ||
        userInfo.lastName.toLowerCase().includes(term) ||
        userInfo.email.toLowerCase().includes(term)
      );
    });

  return (
    <div
      className={`flex w-full relative h-full ${
        showModal ? "opacity-90" : ""
      } flex-row gap-5 px-6 pb-6`}
    >
      <UserListChat />

      <div className="space-y-4 w-full overflow-y-auto max-h-[85vh] pr-3">
        {/* 🔍 Search Field */}
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2"
        />

        {loading ? (
          <p className="text-gray-500">Loading loan requests...</p>
        ) : filteredLoans.length === 0 ? (
          <p className="text-gray-500">
            No matching pending loan requests found.
          </p>
        ) : (
          filteredLoans.map((loan) => {
            const { loanInfo, userInfo } = loan;
            return (
              <div
                key={loanInfo.loanRequestID}
                onClick={() => openModal(loan)}
                className="border p-4 rounded-lg shadow-sm bg-white cursor-pointer hover:bg-gray-50 transition"
              >
                <h3 className="text-lg font-semibold mb-1">
                  {userInfo.firstName} {userInfo.lastName} — ₱
                  {loanInfo.loanAmount}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  Type: {loanInfo.loanType} | Status:{" "}
                  <span
                    className={`font-medium ${
                      loanInfo.loanStatus === "Pending"
                        ? "text-yellow-600"
                        : loanInfo.loanStatus === "Denied"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {loanInfo.loanStatus}
                  </span>
                </p>
                <p className="text-sm">Purpose: {loanInfo.loanPurpose}</p>
                <p className="text-sm">
                  Education: {loanInfo.highestEducation}
                </p>
                <p className="text-sm">Address: {loanInfo.detailedAddress}</p>
                <p className="text-sm mt-1 text-gray-500">
                  Requested: {loanInfo.createdAt}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Review Loan Request</h2>
            <p>
              <strong>Applicant:</strong> {selectedLoan.userInfo.firstName}{" "}
              {selectedLoan.userInfo.lastName}
            </p>
            <p>
              <strong>Email:</strong> {selectedLoan.userInfo.email}
            </p>
            <p>
              <strong>Amount:</strong> ₱{selectedLoan.loanInfo.loanAmount}
            </p>
            <p>
              <strong>Type:</strong> {selectedLoan.loanInfo.loanType}
            </p>
            <p>
              <strong>Purpose:</strong> {selectedLoan.loanInfo.loanPurpose}
            </p>
            <p>
              <strong>Address:</strong> {selectedLoan.loanInfo.detailedAddress}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Requested: {selectedLoan.loanInfo.createdAt}
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:text-black"
              >
                Close
              </button>
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Send A Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
