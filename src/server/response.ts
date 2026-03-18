import { IpcMainEvent } from 'electron';

import { IResponseObject } from '../interfaces';

export default class Response {
  private originalEvent: IpcMainEvent;
  private responseId: string;
  private statusCode: number;
  private headers: Record<string, string>;
  private sent: boolean;
  public locals: Record<string, any>;
  public headersSent: boolean;

  constructor(originalEvent: IpcMainEvent, responseId: string) {
    this.originalEvent = originalEvent;
    this.responseId = responseId;
    this.statusCode = 200;
    this.headers = {};
    this.sent = false;
    this.headersSent = false;
    this.locals = {};
  }

  setHeader(key: string, value: string): this {
    if (!this.sent) {
      this.headers[key] = value;
    }
    return this;
  }

  getHeader(key: string): string | undefined {
    return this.headers[key];
  }

  get(key: string): string | undefined {
    return this.getHeader(key);
  }

  has(key: string): boolean {
    return key in this.headers;
  }

  removeHeader(key: string): this {
    delete this.headers[key];
    return this;
  }

  send<T = any>(result: T): this {
    if (this.sent) {
      return this;
    }
    this.sent = true;
    this.headersSent = true;
    this.originalEvent.sender.send(this.responseId, this.getResponseObject(result));
    return this;
  }

  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  json<T = any>(result: T): this {
    this.setHeader('Content-Type', 'application/json');
    this.send(result);
    return this;
  }

  end(): this {
    if (!this.sent) {
      this.send({});
    }
    return this;
  }

  private getResponseObject<T = any>(result: T): IResponseObject<T> {
    return {
      data: result,
      statusCode: this.statusCode,
    };
  }
}
