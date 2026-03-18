# IpcServer API

`IpcServer` 是在 Electron 主进程中使用的服务器类，用于监听和处理来自渲染进程的 IPC 请求。

## 构造函数

```typescript
constructor(ipcMain: IpcMain)
```

### 参数

- `ipcMain` - Electron 的 `ipcMain` 对象

### 示例

```typescript
import { ipcMain } from 'electron';
import { IpcServer } from '@mizuka-wu/ipc-express';

const server = new IpcServer(ipcMain);
```

## 方法

### listen

启动 IPC 服务器，开始监听来自渲染进程的请求。

```typescript
listen(expressApp: any, namespace?: string): void
```

#### 参数

- `expressApp` - Express 应用实例
- `namespace` - 可选，IPC 通道名称，默认为 `'api-request'`

#### 示例

```typescript
import express from 'express';

const app = express();

// 定义路由
app.get('/api/users/:id', (req, res) => {
  res.send({ id: req.params.id, name: 'John' });
});

// 启动监听
server.listen(app);

// 或使用自定义命名空间
server.listen(app, 'custom-namespace');
```

### removeAllListeners

移除所有 IPC 监听器。在应用关闭或需要清理资源时使用。

```typescript
removeAllListeners(): void
```

#### 示例

```typescript
// 应用关闭时清理
app.on('before-quit', () => {
  server.removeAllListeners();
});
```

## 与 Express 的集成

`IpcServer` 与 Express 应用完全兼容。你可以使用所有 Express 的功能：

### 中间件

```typescript
const app = express();

// 使用中间件
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

server.listen(app);
```

### 路由

```typescript
// GET 请求
app.get('/api/users', (req, res) => {
  res.send([{ id: 1, name: 'John' }]);
});

// POST 请求
app.post('/api/users', (req, res) => {
  res.status(201).send({ id: 2, ...req.body });
});

// 路由参数
app.get('/api/users/:id', (req, res) => {
  res.send({ id: req.params.id });
});

// 查询参数
app.get('/api/search', (req, res) => {
  const query = req.query.q;
  res.send({ results: [] });
});
```

### 响应对象

使用 Express 的 Response 对象方法：

```typescript
app.get('/api/data', (req, res) => {
  // 设置状态码
  res.status(200);
  
  // 发送响应
  res.send({ data: 'value' });
  
  // 或链式调用
  res.status(201).send({ id: 123 });
});
```

## 属性

### namespace

获取当前使用的 IPC 命名空间。

```typescript
server.listen(app, 'custom');
console.log(server.namespace); // 'custom'
```

### ipcMain

获取底层的 `ipcMain` 对象。

```typescript
const main = server.ipcMain;
```

## 完整示例

```typescript
import { app, BrowserWindow, ipcMain } from 'electron';
import express from 'express';
import { IpcServer } from '@mizuka-wu/ipc-express';

const expressApp = express();
const ipcServer = new IpcServer(ipcMain);

// 配置中间件
expressApp.use(express.json());

// 定义 API 路由
expressApp.get('/api/config', (req, res) => {
  res.send({
    version: '1.0.0',
    environment: 'production',
  });
});

expressApp.post('/api/data', (req, res) => {
  const data = req.body;
  res.status(201).send({ success: true, data });
});

// 启动 IPC 服务
ipcServer.listen(expressApp);

// 应用关闭时清理
app.on('before-quit', () => {
  ipcServer.removeAllListeners();
});
```
