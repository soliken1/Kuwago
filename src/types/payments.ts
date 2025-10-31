import { UserInfo } from "./lendings";

export interface DueSoonData {
  payableID?: string;
  borrowerUID?: string;
  lenderUID?: string;
  borrowerInfo: UserInfo;
}

export interface DueSoonResponse {
  success?: string;
  message?: string;
  statusCode?: string;
  data?: DueSoonData;
}
