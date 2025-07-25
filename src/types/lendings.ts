export interface Application {
  loanRequestID: string;
  uid: string;
  maritalStatus: string;
  highestEducation: string;
  employmentInformation: string;
  residentType: string;
  loanType: string;
  loanPurpose: string;
  loanAmount: string;
  loanStatus: "Pending" | "InProgress" | "Approved" | "Denied" | "Completed";
  createdAt: string;
}
