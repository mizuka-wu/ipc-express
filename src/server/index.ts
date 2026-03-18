import { IpcMain, IpcMainEvent } from 'electron';

import CustomResponse from './response';

export class IpcServer {
  private ipcMain: IpcMain;
  private namespace: string;

  constructor(ipcMain: IpcMain) {
    this.ipcMain = ipcMain;
    this.namespace = '';
  }

  listen(expressApp: any, namespace: string = 'api-request'): void {
    this.namespace = namespace;
    this.ipcMain.on(this.namespace, async (originalEvent: IpcMainEvent, { method, path, body, responseId }: any) => {
      expressApp({ method, body, url: path }, new CustomResponse(originalEvent, responseId));
    });
  }

  removeAllListeners(): void {
    this.ipcMain.removeAllListeners(this.namespace);
  }
}
