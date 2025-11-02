interface LoanInfo {
  loanRequestID: string;
  firstName?: string;
  lastName?: string;
  loanAmount: number;
  loanType: number;
  loanPurpose: string;
}

interface UserInfo {
  uid: string;
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  email: string;
}

interface SelectedLoan {
  loanInfo: LoanInfo;
  userInfo: UserInfo;
}

interface StoredUser {
  email?: string;
  firstName?: string;
  company?: string;
  address: string;
  lastName?: string;
}

interface LoanData {
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
