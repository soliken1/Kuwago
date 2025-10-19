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
}

export interface LoanInfo {
  loanRequestID: string;
  uid: string;
  maritalStatus: string;
  highestEducation: string;
  employmentInformation: string;
  detailedAddress: string;
  residentType: string;
  loanType: string;
  loanPurpose: string;
  loanAmount: number;
  loanStatus: "Pending" | "InProgress" | "Approved" | "Denied" | "Completed";
  createdAt: string;
  payableID?: string;
  payable_id?: string;
  payableId?: string;
  paymentType?: string;
  firstName?: string;
  lastName?: string;
}

export interface UserInfo {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface LoanWithUserInfo {
  loanInfo: LoanInfo;
  userInfo: UserInfo;
  payableID?: string;
  payable_id?: string;
  payableId?: string;
}
