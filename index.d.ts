import { IpcMain, IpcRenderer } from 'electron';

declare module '@mizuka-wu/ipc-express' {
  export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

  export interface IResponseObject<T = any> {
    data: T;
    statusCode: number;
  }

  export interface IpcClientOptions {
    namespace?: string;
  }

  export interface IpcServerOptions {
    namespace?: string;
  }

  export class IpcClient {
    namespace: string;
    ipcRenderer: IpcRenderer;
    methods: Method[];
    constructor(ipcRenderer: IpcRenderer, namespace?: string);
    get<T = any>(path: string, body?: any): Promise<IResponseObject<T>>;
    post<T = any>(path: string, body?: any): Promise<IResponseObject<T>>;
    put<T = any>(path: string, body?: any): Promise<IResponseObject<T>>;
    patch<T = any>(path: string, body?: any): Promise<IResponseObject<T>>;
    delete<T = any>(path: string, body?: any): Promise<IResponseObject<T>>;
  }

  export class IpcServer {
    ipcMain: IpcMain;
    namespace: string;
    listen(expressApp: any, namespace?: string): void;
    removeAllListeners(): void;
    constructor(ipcMain: IpcMain);
  }
}
