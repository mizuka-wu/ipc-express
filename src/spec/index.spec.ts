import express from 'express';

import { IpcClient } from '../client';
import { IpcServer } from '../server';

import { ipcRenderer, ipcMain } from './mock/electron-mock';

describe('ipc-express', () => {
  let ipcC: IpcClient;
  let ipcS: IpcServer;
  let expressApp: any;
  beforeEach(() => {
    const cloneIpcRenderer = Object.assign(Object.create(Object.getPrototypeOf(ipcRenderer)), ipcRenderer);
    const cloneipcMain = Object.assign(Object.create(Object.getPrototypeOf(ipcMain)), ipcMain);

    expressApp = express();
    ipcC = new IpcClient(cloneIpcRenderer);
    ipcS = new IpcServer(cloneipcMain);

    ipcS.listen(expressApp);
  });

  afterEach(() => {
    ipcS.removeAllListeners();
  });

  describe('Params', () => {
    beforeEach(() => {
      expressApp.use('/test/:id', (req: any, res: any) => {
        res.send({
          params: req.params,
        });
      });
    });
    it('should return send params', async () => {
      const { data } = await ipcC.get('/test/testID');
      expect(data.params.id).toEqual('testID');
    });
  });

  describe('Query', () => {
    beforeEach(() => {
      expressApp.use('/test', (req: any, res: any) => {
        res.send({
          query: req.query,
        });
      });
    });
    it('should return send query', async () => {
      const { data } = await ipcC.get('/test?testquery=test');
      expect(data.query).toEqual({
        testquery: 'test',
      });
    });
  });

  describe('given long calculating response', () => {
    beforeEach(() => {
      expressApp.use('/test', (_: any, res: any) => {
        setTimeout(() => {
          res.send({
            long: true,
          });
        }, 5000);
      });
    });
    it('should return send data even with long computation', async () => {
      const { data } = await ipcC.get('/test');
      expect(data.long).toEqual(true);
    }, 10000);
  });
});
