import { IpcMainEvent } from 'electron';
import { ServerResponse, IncomingMessage, OutgoingHttpHeaders } from 'http';

import { IResponseObject } from '../interfaces';

// 创建一个假的 IncomingMessage 用于初始化 ServerResponse
function createFakeRequest(): IncomingMessage {
  const req = new IncomingMessage(null as any);
  req.method = 'GET';
  req.url = '/';
  req.headers = {};
  return req;
}

export default class IpcResponse extends ServerResponse {
  private originalEvent: IpcMainEvent;
  private responseId: string;
  private _sent: boolean;
  private _body: any;

  constructor(originalEvent: IpcMainEvent, responseId: string) {
    super(createFakeRequest());
    this.originalEvent = originalEvent;
    this.responseId = responseId;
    this._sent = false;
    this._body = null;

    // 初始化 headers
    this.locals = {};

    // 绑定方法到实例，防止 Express 覆盖原型链后丢失
    this.end = this.end.bind(this);
    this.write = this.write.bind(this);
    this.writeHead = this.writeHead.bind(this);
  }

  // 重写 writeHead 来拦截头部设置 - 匹配 ServerResponse 的重载签名
  override writeHead(statusCode: number, statusMessage?: string, headers?: OutgoingHttpHeaders): this;
  override writeHead(statusCode: number, headers?: OutgoingHttpHeaders): this;
  override writeHead(
    statusCode: number,
    statusMessageOrHeaders?: string | OutgoingHttpHeaders,
    headers?: OutgoingHttpHeaders,
  ): this {
    this.statusCode = statusCode;

    let headersToSet: OutgoingHttpHeaders | undefined;
    if (typeof statusMessageOrHeaders === 'object') {
      headersToSet = statusMessageOrHeaders;
    } else if (headers) {
      headersToSet = headers;
    }

    if (headersToSet) {
      Object.entries(headersToSet).forEach(([key, value]) => {
        if (value !== undefined) {
          this.setHeader(key, value);
        }
      });
    }
    return this;
  }

  // 重写 end 方法来拦截响应体
  override end(chunk?: any, encoding?: any, cb?: any): this {
    if (this._sent) {
      return this;
    }
    this._sent = true;

    // 收集响应体
    if (chunk) {
      this._body = chunk;
    }

    // 发送 IPC 消息
    const responseObject: IResponseObject<any> = {
      data: this._body,
      statusCode: this.statusCode,
      headers: this.getHeaders() as Record<string, string | number | string[]>,
    };

    try {
      this.originalEvent.sender.send(this.responseId, responseObject);
    } catch (err) {
      console.error('[IpcResponse] Failed to send IPC message:', err);
    }

    // 调用父类的 end（但不实际写入 socket）
    super.end();

    if (typeof cb === 'function') {
      cb();
    }

    return this;
  }

  // 重写 write 方法来收集响应体
  override write(chunk: any, _encoding?: any, _cb?: any): boolean {
    if (!this._body) {
      this._body = '';
    }
    this._body += chunk;
    return true;
  }

  // 提供 status 链式调用方法
  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  // 提供 send 方法 - 简单版本，用于错误处理等场景
  send<T = any>(result: T): this {
    this._body = result;
    return this.end();
  }

  // 提供 json 方法
  json<T = any>(result: T): this {
    if (!this.hasHeader('content-type')) {
      this.setHeader('Content-Type', 'application/json');
    }
    this._body = JSON.stringify(result);
    return this.end();
  }

  // 提供 type 方法
  type(contentType: string): this {
    this.setHeader('Content-Type', contentType);
    return this;
  }

  // 提供 set 方法（别名给 header）
  set(field: string, value: string): this;
  set(fields: Record<string, string>): this;
  set(field: string | Record<string, string>, value?: string): this {
    if (typeof field === 'string' && value) {
      this.setHeader(field, value);
    } else if (typeof field === 'object') {
      Object.entries(field).forEach(([key, val]) => {
        this.setHeader(key, val);
      });
    }
    return this;
  }

  // 提供 get 方法
  get(field: string): string | number | string[] | undefined {
    return this.getHeader(field);
  }

  // Express 兼容属性
  locals!: Record<string, any>;
}
