export const BUSINESS_TYPE_LABELS = {
  1: "Micro Business",
  2: "Small Enterprise", 
  3: "Working Capital",
  4: "Equipment Purchase",
  5: "Expansion",
  6: "Emergency Business",
  7: "Others"
} as const;

export const LOAN_TYPE_LABELS = {
  1: "Retail",
  2: "Manufacturing",
  3: "Services",
  4: "Agriculture",
  5: "Technology",
  6: "Education",
  7: "HealthCare",
  8: "Logistics",
  9: "Other"
} as const;

export const LOAN_AMOUNT_VALUES = {
  5000: 5000,
  7500: 7500,
  10000: 10000,
  15000: 15000,
  20000: 20000,
  25000: 25000,
  30000: 30000,
  40000: 40000,
  50000: 50000,
  75000: 75000,
  100000: 100000
} as const;

export type BusinessType = keyof typeof BUSINESS_TYPE_LABELS;
export type LoanType = keyof typeof LOAN_TYPE_LABELS;
export type LoanAmount = keyof typeof LOAN_AMOUNT_VALUES;

// Helper functions for getting labels
export const getBusinessTypeLabel = (type: number): string => {
  return BUSINESS_TYPE_LABELS[type as BusinessType] || "Unknown";
};

export const getLoanTypeLabel = (type: number): string => {
  return LOAN_TYPE_LABELS[type as LoanType] || "Unknown";
};

export const getLoanAmountLabel = (amount: number): string => {
  return `₱${amount.toLocaleString()}`;
};
