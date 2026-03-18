export interface IResponseObject<T = any> {
  data: T;
  statusCode: number;
}
