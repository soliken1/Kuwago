export interface DueSoonData {
  payableID: string;
  borrowerUID: string;
  lenderUID: string;
  loanRequestID: string;

  totalPayableAmount: number;
  paymentPerMonth: number;
  paymentType: string;
  nextPaymentDueDate: string;
  daysUntilDue: number;

  notified: boolean;
  lastNotifiedDate: string | null;
  notifiedAt: string | null;

  borrowerInfo: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
}

export interface DueSoonResponse {
  success: boolean;
  message?: string;
  statusCode?: number;
  data: DueSoonData[];
}
