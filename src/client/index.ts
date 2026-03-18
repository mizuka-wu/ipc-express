import { IpcRenderer } from 'electron';
import { nanoid } from 'nanoid';

import { Method } from '../types';
import { IResponseObject } from '../interfaces';

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

  constructor(ipcRenderer: IpcRenderer, namespace: string = 'api-request') {
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
        const responseId = nanoid();
        this.send({
          method,
          path,
          body: body || {},
          responseId,
        });

        this.ipcRenderer.on(responseId, (_: any, result: IResponseObject<T>) => {
          if (result.statusCode >= 200 && result.statusCode < 300) {
            resolve(result);
          } else {
            reject(result);
          }
        });
      });
    };
  }
}
