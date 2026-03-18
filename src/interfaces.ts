export interface IResponseObject<T = any> {
  data: T;
  statusCode: number;
  headers?: Record<string, string | number | string[]>;
}
