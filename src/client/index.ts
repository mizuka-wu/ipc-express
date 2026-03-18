import { IpcRenderer } from 'electron';

import { IResponseObject } from '../interfaces';
import { Method } from '../types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
}

interface SendData {
  method: Method;
  path: string;
  body: any;
  responseId: string;
}

export class IpcClient {
  private namespace: string;
  private ipcRenderer: IpcRenderer;
  private methods: Method[];

  constructor(ipcRenderer: IpcRenderer, namespace = 'api-request') {
    this.ipcRenderer = ipcRenderer;
    this.namespace = namespace;
    this.methods = ['get', 'post', 'put', 'patch', 'delete'];
    this.methods.forEach((method) => {
      this[method] = this.buildRequestHandler(method);
    });
  }

  send(data: SendData): void {
    this.ipcRenderer.send(this.namespace, data);
  }

  get<T = any>(path: string, body?: any): Promise<IResponseObject<T>> {
    return this.buildRequestHandler('get')(path, body);
  }

  post<T = any>(path: string, body?: any): Promise<IResponseObject<T>> {
    return this.buildRequestHandler('post')(path, body);
  }

  put<T = any>(path: string, body?: any): Promise<IResponseObject<T>> {
    return this.buildRequestHandler('put')(path, body);
  }

  patch<T = any>(path: string, body?: any): Promise<IResponseObject<T>> {
    return this.buildRequestHandler('patch')(path, body);
  }

  delete<T = any>(path: string, body?: any): Promise<IResponseObject<T>> {
    return this.buildRequestHandler('delete')(path, body);
  }

  private buildRequestHandler(method: Method): <T = any>(path: string, body?: any) => Promise<IResponseObject<T>> {
    return <T = any>(path: string, body?: any): Promise<IResponseObject<T>> => {
      return new Promise((resolve, reject) => {
        const responseId = generateId();
        this.send({
          method,
          path,
          body: body || {},
          responseId,
        });

        this.ipcRenderer.on(responseId, (_: any, result: IResponseObject<T>) => {
          // 处理 Buffer 类型的 data（Electron IPC 序列化保留的 Buffer）
          let data = result.data;
          if (data && (data instanceof Uint8Array || Buffer.isBuffer(data))) {
            const str = Buffer.from(data).toString('utf-8');
            try {
              data = JSON.parse(str) as T;
            } catch {
              data = str as unknown as T; // 如果不是 JSON，保留字符串
            }
          }

          const processedResult = { ...result, data } as IResponseObject<T>;

          if (processedResult.statusCode >= 200 && processedResult.statusCode < 300) {
            resolve(processedResult);
          } else {
            reject(processedResult);
          }
        });
      });
    };
  }
}
