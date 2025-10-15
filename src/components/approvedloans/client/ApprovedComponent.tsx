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

export default function ApprovedComponent() {
  const { submitLoanRequest, loading, error } = useFetchApprovedLoans();
  const [approvedLoans, setApprovedLoans] = useState<ApprovedLoan[]>([]);

  useEffect(() => {
    const fetchApproved = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      try {
        const { uid } = JSON.parse(storedUser);
        const response = await submitLoanRequest({ uid });

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

  if (loading) return <p>Loading approved loans...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-4">
      {approvedLoans.length === 0 ? (
        <p>No approved loans found.</p>
      ) : (
        approvedLoans
          .filter((loan: any) => loan.loanStatus === "Approved")
          .map((loan) => (
            <div
              key={loan.agreedLoanID}
              className="p-4 rounded-xl shadow-sm"
              style={{ backgroundColor: '#f0f9f4', border: '1px solid #85d4a4' }}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-lg font-semibold">{loan.loanPurpose}</p>
                <span className="px-3 py-1 text-sm font-medium rounded-full" style={{ backgroundColor: '#f0f9f4', color: '#2d5a3d', border: '1px solid #85d4a4' }}>
                  {loan.loanStatus}
                </span>
              </div>
              <p className="text-sm text-gray-600">Type: {loan.loanType}</p>
              <p className="text-sm text-gray-600">
                Amount: ₱{loan.loanAmount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Interest: {(loan.interestRate * 100).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-600">Lender: {loan.lenderName}</p>
              <p className="text-sm text-gray-600">
                Borrower: {loan.borrowerName}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Agreement Date: {loan.agreementDate}
              </p>
            </div>
          ))
      )}
    </div>
  );
}
