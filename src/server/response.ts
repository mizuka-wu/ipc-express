import { IpcMainEvent } from 'electron';
import { IResponseObject } from '../interfaces';

export default class Response {
  private originalEvent: IpcMainEvent;
  private responseId: string;
  private statusCode: number;

  constructor(originalEvent: IpcMainEvent, responseId: string) {
    this.originalEvent = originalEvent;
    this.responseId = responseId;
    this.statusCode = 200;
  }

  setHeader(key: string, value: string): this {
    return this;
  }

  send<T = any>(result: T): void {
    this.originalEvent.sender.send(this.responseId, this.getResponseObject(result));
  }

  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  private getResponseObject<T = any>(result: T): IResponseObject<T> {
    return {
      data: result,
      statusCode: this.statusCode,
    };
  }
}
