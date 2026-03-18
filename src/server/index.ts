import { IpcMain, IpcMainEvent } from 'electron';

import CustomResponse from './response';

export class IpcServer {
  private ipcMain: IpcMain;
  private namespace: string;

  constructor(ipcMain: IpcMain) {
    this.ipcMain = ipcMain;
    this.namespace = '';
  }

  listen(expressApp: any, namespace = 'api-request'): void {
    this.namespace = namespace;
    this.ipcMain.on(this.namespace, async (originalEvent: IpcMainEvent, { method, path, body, responseId }: any) => {
      const req = this.createRequest(method, path, body);
      const res = new CustomResponse(originalEvent, responseId);

      try {
        const result = expressApp(req, res);
        // 如果 expressApp 返回 Promise，等待它
        if (result && typeof result.then === 'function') {
          await result;
        }
      } catch (error) {
        console.error('IPC Server error:', error);
        if (!res.headersSent) {
          res.status(500).send({ error: 'Internal Server Error' });
        }
      }
    });
  }

  private createRequest(method: string, path: string, body: any): any {
    const url = new URL(`http://localhost${path}`);
    return {
      method: method.toUpperCase(),
      url: path,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      body,
      params: {},
      headers: {},
      get(key: string) {
        return this.headers[key.toLowerCase()];
      },
    };
  }

  removeAllListeners(): void {
    this.ipcMain.removeAllListeners(this.namespace);
  }
}
