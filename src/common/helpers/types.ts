export interface NestResponse<T> {
  statusCode: number;
  message: string[] | string;
  data?: T | T[];
}
