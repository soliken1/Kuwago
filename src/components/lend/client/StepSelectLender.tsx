import React from "react";

interface Lender {
  uid: string;
  username: string;
  email: string;
  profilePicture: string;
  phoneNumber: string;
}

interface StepSelectLenderProps {
  loading: boolean;
  error: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  paginatedLenders: Lender[];
  selectedLender: Lender | null;
  setSelectedLender: (lender: Lender) => void;
  setStep: (step: 1 | 2 | 3) => void;
}

const StepSelectLender: React.FC<StepSelectLenderProps> = ({
  loading,
  error,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  totalPages,
  paginatedLenders,
  selectedLender,
  setSelectedLender,
  setStep,
}) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Select a Lender</h2>

      <input
        type="text"
        placeholder="Search by name..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full mb-4 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
      />

      {loading ? (
        <p className="text-gray-500">Loading lenders...</p>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : paginatedLenders.length === 0 ? (
        <p className="text-gray-500">No lenders found.</p>
      ) : (
        <>
          <div className="grid gap-4 mb-4">
            {paginatedLenders.map((lender) => (
              <button
                key={lender.uid}
                onClick={() => {
                  setSelectedLender(lender);
                  setStep(2);
                }}
                className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm transition hover:shadow-md hover:border-blue-500 ${
                  selectedLender?.uid === lender.uid
                    ? "border-blue-500 bg-blue-50"
                    : "bg-white"
                }`}
              >
                <img
                  src={lender.profilePicture}
                  alt={lender.username}
                  className="w-14 h-14 rounded-full object-cover border"
                />
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {lender.username}
                  </h3>
                  <p className="text-sm text-gray-600">@{lender.username}</p>
                  <p className="text-sm text-gray-500">{lender.phoneNumber}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mt-2">
            <button
              onClick={() =>
                setCurrentPage((prev: number) => Math.max(prev - 1, 1))
              }
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default StepSelectLender;
