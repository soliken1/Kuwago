"use client";
import React, { useEffect, useState } from "react";
import { useFetchApprovedLoans } from "@/hooks/lend/fetchApprovedLoans";

interface ApprovedLoan {
  agreedLoanID: string;
  interestRate: number;
  agreementDate: string;
  borrowerName: string;
  lenderName: string;
  loanType: string;
  loanAmount: number;
  loanPurpose: string;
  loanStatus: string;
}

const statusColor: { [key: string]: string } = {
  Approved: "bg-green-100 text-green-700 border border-green-300",
  Pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  InProgress: "bg-blue-100 text-blue-700 border border-blue-300",
  Denied: "bg-red-100 text-red-700 border border-red-300",
  Completed: "bg-gray-100 text-gray-700 border border-gray-300",
};

export default function ApprovedComponent() {
  const { submitLoanRequest, loading, error } = useFetchApprovedLoans();
  const [approvedLoans, setApprovedLoans] = useState<ApprovedLoan[]>([]);

  useEffect(() => {
    const fetchApproved = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      try {
        const { uid } = JSON.parse(storedUser);
        const response = await submitLoanRequest("Approved", uid);

        if (response?.data?.length) {
          const loans = response.data.map((loan: any) => ({
            agreedLoanID: loan.agreedLoanID,
            interestRate: loan.interestRate,
            agreementDate: new Date(loan.agreementDate).toLocaleDateString(
              "en-PH",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            ),
            borrowerName: `${loan.borrowerInfo.firstName} ${loan.borrowerInfo.lastName}`,
            lenderName: `${loan.lenderInfo.firstName} ${loan.lenderInfo.lastName}`,
            loanType: loan.updatedLoanInfo.loanType,
            loanAmount: loan.updatedLoanInfo.loanAmount,
            loanPurpose: loan.updatedLoanInfo.loanPurpose,
            loanStatus: loan.updatedLoanInfo.loanStatus,
          }));

          setApprovedLoans(loans);
        }
      } catch (err) {
        console.error("Error fetching approved loans:", err);
      }
    };

    fetchApproved();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">All Approved Loans</h3>
            <p className="text-gray-600 text-sm">View your approved loan history</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loan Purpose
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Borrower
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agreement Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Loading approved loans...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-red-500">
                  Error: {error}
                </td>
              </tr>
            )}
            {!loading && approvedLoans.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No approved loans found.
                </td>
              </tr>
            )}
            {approvedLoans.map((loan) => (
                <tr key={loan.agreedLoanID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#2c8068] rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">
                          {loan.loanPurpose.charAt(0)}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {loan.loanPurpose}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {loan.loanType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₱{loan.loanAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(loan.interestRate * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {loan.lenderName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {loan.borrowerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {loan.agreementDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor[loan.loanStatus]}`}
                    >
                      {loan.loanStatus}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
