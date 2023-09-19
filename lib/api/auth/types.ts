export interface GetVerificationCodeParams {
  email: string;
}

export interface SignParams {
  email: string;
  code: string;
}
