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

export type BusinessType = keyof typeof BUSINESS_TYPE_LABELS;
export type LoanType = keyof typeof LOAN_TYPE_LABELS;

// Helper functions for getting labels
export const getBusinessTypeLabel = (type: number): string => {
  return BUSINESS_TYPE_LABELS[type as BusinessType] || "Unknown";
};

export const getLoanTypeLabel = (type: number): string => {
  return LOAN_TYPE_LABELS[type as LoanType] || "Unknown";
};
