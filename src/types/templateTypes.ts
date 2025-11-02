export interface LoanInfo {
  loanRequestID: string;
  firstName?: string;
  lastName?: string;
  loanAmount: number;
  loanType: number;
  loanPurpose: string;
}

export interface UserInfo {
  uid: string;
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  email: string;
}

export interface SelectedLoan {
  loanInfo: LoanInfo;
  userInfo: UserInfo;
}

export interface StoredUser {
  uid?: string;
  username?: string;
  email?: string;
  firstName?: string;
  company?: string;
  address: string;
  lastName?: string;
  fullName?: string;
}

export interface LoanData {
  day?: string;
  month?: string;
  year?: string;
  amountText?: string;
  amount?: number;
  interest?: number;
  monthlyAmount: number;
  frequency: string;
  firstDue: string;
  lastDue: string;
  penalty: string;
  interestIncrease: number;
}
