export interface ResponseModel {
  status?: number;
  message: string;
  data?: any;
  success?: boolean;
  user?: any;
  token?: string;
  updatedUser?: any;
}
