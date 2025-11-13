export interface LenderInfo {
  lenderFullName: string;
  lenderProfilePicture: string | null;
  lenderTIN: string;
  interestRates: number[];
  termsOfPayment: number[];
  gracePeriod: string;
}

export interface Application {
  loanRequestID: string;
  uid: string;
  maritalStatus: string;
  highestEducation: string;
  employmentInformation: string;
  residentType: string;
  detailedAddress: string;
  loanType: string;
  loanPurpose: string;
  loanAmount: string;
  loanStatus: "Pending" | "InProgress" | "Approved" | "Denied" | "Completed";
  createdAt: string;
  lenderInfo?: LenderInfo;
  businessName?: string;
  businessAddress?: string;
  businessTIN?: string;
  businessType?: number;
}

export interface LoanInfo {
  loanRequestID: string;
  uid: string;
  businessType: number;
  businessTIN: string;
  loanType: number;
  loanPurpose: string;
  loanAmount: number;
  loanStatus: "Pending" | "InProgress" | "Approved" | "Denied" | "Completed";
  createdAt: string;
  payableID?: string;
  paymentType?: string;
  maritalStatus?: string;
  highestEducation?: string;
  employmentInformation?: string;
  detailedAddress?: string;
  residentType?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  interestRate?: number;
  termsofMonths: string;
}

export interface UserInfo {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  lenderInstitution: string;
  lenderAddress: string;
  businessAddress: string;
  businessName: string;
}

export interface LoanWithUserInfo {
  loanInfo: LoanInfo;
  userInfo: UserInfo;
  payableID?: string;
  payable_id?: string;
  payableId?: string;
}
