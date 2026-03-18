# 快速开始

## 安装

```bash
npm install @mizuka-wu/ipc-express
```

## 基本用法

### 主进程设置

在 Electron 主进程中创建 IPC 服务器：

```typescript
import { ipcMain } from 'electron';
import express from 'express';
import { IpcServer } from '@mizuka-wu/ipc-express/server';

const app = express();
const ipcServer = new IpcServer(ipcMain);

// 使用中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 定义路由
app.get('/api/users/:id', (req, res) => {
  res.status(200).send({
    id: req.params.id,
    name: 'John Doe',
  });
});

app.post('/api/users', (req, res) => {
  res.status(201).send({
    id: '123',
    ...req.body,
  });
});

// 启动 IPC 监听
ipcServer.listen(app);
```

### 渲染进程使用

在 Electron 渲染进程中创建 IPC 客户端：

```typescript
import { ipcRenderer } from 'electron';
import { IpcClient } from '@mizuka-wu/ipc-express/client';

const ipcClient = new IpcClient(ipcRenderer);

// 发送 GET 请求
async function getUser(id: string) {
  try {
    const response = await ipcClient.get<{ id: string; name: string }>(`/api/users/${id}`);
    console.log(response.data); // { id: '123', name: 'John Doe' }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

// 发送 POST 请求
async function createUser(name: string) {
  try {
    const response = await ipcClient.post<{ id: string; name: string }>('/api/users', {
      name,
    });
    console.log(response.data); // { id: '123', name: 'John Doe' }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

// 调用函数
getUser('123');
createUser('Jane Doe');
```

## 支持的 HTTP 方法

ipc-express 支持以下 HTTP 方法：

- `GET` - 获取数据
- `POST` - 创建数据
- `PUT` - 更新数据
- `PATCH` - 部分更新数据
- `DELETE` - 删除数据

## 类型安全

ipc-express 提供完整的 TypeScript 支持，包括泛型类型推断：

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

// 类型会自动推断为 User
const response = await ipcClient.get<User>('/api/users/123');
console.log(response.data.name); // 类型安全
```

## 自定义命名空间

默认情况下，ipc-express 使用 `'api-request'` 作为 IPC 命名空间。你可以自定义它：

```typescript
// 主进程
import { IpcServer } from '@mizuka-wu/ipc-express/server';
const ipcServer = new IpcServer(ipcMain);
ipcServer.listen(app, 'custom-namespace');

// 渲染进程
import { IpcClient } from '@mizuka-wu/ipc-express/client';
const ipcClient = new IpcClient(ipcRenderer, 'custom-namespace');
```

## 下一步

- 查看 [API 文档](/api/client) 了解更多细节
- 浏览 [示例](/examples/basic) 学习高级用法
- 阅读 [最佳实践](/guide/best-practices)
