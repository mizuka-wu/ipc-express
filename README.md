# ipc-express

[English](#english) | [中文](#中文)

---

## English

Express-like IPC communication for Electron applications. Use the familiar Express API style in Electron's main process without HTTP overhead.

### Features

- 🚀 **Express-like API** - Familiar routing and middleware patterns
- 📦 **Dual Module Support** - CommonJS and ES Module
- 🔒 **Type Safe** - Full TypeScript support with generics
- 📚 **Well Documented** - Comprehensive guides and API documentation
- ⚡ **Zero HTTP Overhead** - Direct IPC communication
- 🎯 **Modern Tooling** - Built with Rolldown and TypeScript

### Quick Start

#### Installation

```bash
pnpm add @mizuka-wu/ipc-express
```

#### Main Process

```typescript
import { ipcMain } from 'electron';
import express from 'express';
import { IpcServer } from '@mizuka-wu/ipc-express/server';

const app = express();
const ipcServer = new IpcServer(ipcMain);

app.get('/api/users/:id', (req, res) => {
  res.send({
    id: req.params.id,
    name: 'John Doe'
  });
});

ipcServer.listen(app);
```

#### Renderer Process

```typescript
import { ipcRenderer } from 'electron';
import { IpcClient } from '@mizuka-wu/ipc-express/client';

interface User {
  id: string;
  name: string;
}

const client = new IpcClient(ipcRenderer);

async function getUser() {
  const response = await client.get<User>('/api/users/1');
  console.log(response.data.name); // 'John Doe'
}
```

### Documentation

- 📖 [Full Documentation](https://mizuka-wu.github.io/ipc-express/)
- 🚀 [Getting Started](https://mizuka-wu.github.io/ipc-express/guide/getting-started.html)
- 📚 [API Reference](https://mizuka-wu.github.io/ipc-express/api/client.html)
- 💡 [Examples](https://mizuka-wu.github.io/ipc-express/examples/basic.html)

### License

[MIT](http://opensource.org/licenses/MIT)

---

## 中文

为 Electron 应用提供 Express 风格的 IPC 通信。在 Electron 主进程中使用熟悉的 Express API，无需 HTTP 开销。

### 特性

- 🚀 **Express 风格 API** - 熟悉的路由和中间件模式
- 📦 **双模块支持** - CommonJS 和 ES Module
- 🔒 **类型安全** - 完整的 TypeScript 支持和泛型
- 📚 **文档完善** - 详细的指南和 API 文档
- ⚡ **零 HTTP 开销** - 直接 IPC 通信
- 🎯 **现代工具链** - 使用 Rolldown 和 TypeScript 构建

### 快速开始

#### 安装

```bash
pnpm add @mizuka-wu/ipc-express
```

#### 主进程

```typescript
import { ipcMain } from 'electron';
import express from 'express';
import { IpcServer } from '@mizuka-wu/ipc-express/server';

const app = express();
const ipcServer = new IpcServer(ipcMain);

app.get('/api/users/:id', (req, res) => {
  res.send({
    id: req.params.id,
    name: '张三'
  });
});

ipcServer.listen(app);
```

#### 渲染进程

```typescript
import { ipcRenderer } from 'electron';
import { IpcClient } from '@mizuka-wu/ipc-express/client';

interface User {
  id: string;
  name: string;
}

const client = new IpcClient(ipcRenderer);

async function getUser() {
  const response = await client.get<User>('/api/users/1');
  console.log(response.data.name); // '张三'
}
```

### 文档

- 📖 [完整文档](https://mizuka-wu.github.io/ipc-express/)
- 🚀 [快速开始](https://mizuka-wu.github.io/ipc-express/guide/getting-started.html)
- 📚 [API 参考](https://mizuka-wu.github.io/ipc-express/api/client.html)
- 💡 [示例代码](https://mizuka-wu.github.io/ipc-express/examples/basic.html)

### 许可证

[MIT](http://opensource.org/licenses/MIT)

---

**最后更新**: 2024 年 3 月 19 日
