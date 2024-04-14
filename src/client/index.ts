import { IpcRenderer } from 'electron';
import { nanoid } from 'nanoid';

import { Method } from '../types';

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

  send(data: SendData) {
    this.ipcRenderer.send(this.namespace, data);
  }

  buildRequestHandler(method: Method): (path: string, body: any) => Promise<any> {
    return (path: string, body = {} as any) => {
      return new Promise((resolve, reject) => {
        const responseId = nanoid();
        this.send({
          method,
          path,
          body,
          responseId,
        });

        this.ipcRenderer.on(responseId, (_, result) => {
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
