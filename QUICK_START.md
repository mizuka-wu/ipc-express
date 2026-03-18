# ipc-express 快速参考指南

## 安装

```bash
pnpm install
```

## 常用命令

### 开发
```bash
# 构建项目
pnpm build

# 开发模式（监听文件变化）
pnpm dev

# 类型检查
pnpm type-check

# 运行测试
pnpm test
```

### 文档
```bash
# 启动文档开发服务器
pnpm docs:dev

# 构建文档网站
pnpm docs:build

# 预览构建的文档
pnpm docs:preview
```

## 项目结构

```
ipc-express/
├── src/
│   ├── client/          # IpcClient 实现
│   ├── server/          # IpcServer 实现
│   ├── index.ts         # 主入口
│   ├── interfaces.ts    # 接口定义
│   └── types.ts         # 类型定义
├── docs/
│   ├── .vitepress/      # VitePress 配置
│   ├── guide/           # 指南文档
│   ├── api/             # API 文档
│   ├── examples/        # 示例代码
│   └── index.md         # 首页
├── build/               # 构建输出
│   ├── cjs/             # CommonJS 模块
│   └── esm/             # ES Module
├── rolldown.config.mjs  # Rolldown 配置
├── tsconfig.json        # TypeScript 配置
└── package.json         # 项目配置
```

## 构建输出

### CommonJS
```javascript
const { IpcClient, IpcServer } = require('@mizuka-wu/ipc-express');
```

### ES Module
```javascript
import { IpcClient, IpcServer } from '@mizuka-wu/ipc-express';
```

### TypeScript with Generics
```typescript
import { IpcClient } from '@mizuka-wu/ipc-express';

interface User {
  id: number;
  name: string;
}

const client = new IpcClient(ipcRenderer);
const response = await client.get<User>('/api/users/1');
```

## 核心 API

### IpcClient
```typescript
class IpcClient {
  constructor(ipcRenderer: IpcRenderer, namespace?: string);
  
  get<T>(path: string, body?: any): Promise<IResponseObject<T>>;
  post<T>(path: string, body?: any): Promise<IResponseObject<T>>;
  put<T>(path: string, body?: any): Promise<IResponseObject<T>>;
  patch<T>(path: string, body?: any): Promise<IResponseObject<T>>;
  delete<T>(path: string, body?: any): Promise<IResponseObject<T>>;
}
```

### IpcServer
```typescript
class IpcServer {
  constructor(ipcMain: IpcMain);
  
  listen(expressApp: any, namespace?: string): void;
  removeAllListeners(): void;
}
```

## 完整示例

### 主进程
```typescript
import { ipcMain } from 'electron';
import express from 'express';
import { IpcServer } from '@mizuka-wu/ipc-express';

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

### 渲染进程
```typescript
import { ipcRenderer } from 'electron';
import { IpcClient } from '@mizuka-wu/ipc-express';

interface User {
  id: string;
  name: string;
}

const client = new IpcClient(ipcRenderer);

async function getUser() {
  try {
    const response = await client.get<User>('/api/users/1');
    console.log(response.data.name); // 'John Doe'
  } catch (error) {
    console.error('Failed to get user:', error);
  }
}

getUser();
```

## 文档链接

- [快速开始](/docs/guide/getting-started.md)
- [安装指南](/docs/guide/installation.md)
- [API 文档](/docs/api/client.md)
- [示例代码](/docs/examples/basic.md)
- [最佳实践](/docs/guide/best-practices.md)

## 技术栈

- **TypeScript**: 5.9.3
- **Rolldown**: 1.0.0-rc.9
- **VitePress**: 1.6.4
- **Electron**: 29.4.6+
- **Express**: 4.22.1

## 支持的模块格式

- ✅ CommonJS (CJS)
- ✅ ES Module (ESM)
- ✅ TypeScript 类型定义
- ✅ Source maps

## 常见问题

### Q: 如何使用 TypeScript 泛型？
A: 在方法调用时指定类型参数：
```typescript
const response = await client.get<MyType>('/api/endpoint');
```

### Q: 支持哪些 HTTP 方法？
A: 支持 GET、POST、PUT、PATCH、DELETE，使用对应的方法名调用。

### Q: 如何自定义命名空间？
A: 在构造函数中传递 namespace 参数：
```typescript
const client = new IpcClient(ipcRenderer, 'custom-namespace');
```

### Q: 文档在哪里？
A: 运行 `pnpm docs:dev` 启动本地文档服务器，或查看 `/docs` 目录。

## 下一步

1. 查看 [快速开始](/docs/guide/getting-started.md) 了解基本用法
2. 浏览 [API 文档](/docs/api/client.md) 了解完整 API
3. 查看 [示例代码](/docs/examples/basic.md) 学习实现方式
4. 阅读 [最佳实践](/docs/guide/best-practices.md) 编写高质量代码

## 获取帮助

- 📖 查看 [完整文档](/docs)
- 🐛 报告问题：[GitHub Issues](https://github.com/mizuka-wu/ipc-express/issues)
- 💬 讨论：[GitHub Discussions](https://github.com/mizuka-wu/ipc-express/discussions)

---

**最后更新**: 2024 年 3 月 18 日
