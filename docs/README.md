# ipc-express 文档

欢迎来到 ipc-express 文档！这是一个为 Electron 应用设计的库，允许在主进程中使用 Express 框架的 API 风格，但无需 HTTP 开销。

## 快速导航

### 🚀 开始使用

- [快速开始](/guide/getting-started.md) - 5 分钟快速上手
- [安装指南](/guide/installation.md) - 详细的安装步骤

### 📖 学习资源

- [架构设计](/guide/architecture.md) - 了解 ipc-express 的设计原理
- [最佳实践](/guide/best-practices.md) - 编写高质量代码的建议

### 🔧 API 文档

- [IpcClient API](/api/client.md) - 客户端 API 参考
- [IpcServer API](/api/server.md) - 服务器 API 参考
- [类型定义](/api/types.md) - TypeScript 类型参考

### 💡 示例代码

- [基础示例](/examples/basic.md) - 完整的 Todo 应用示例
- [高级用法](/examples/advanced.md) - 认证、数据库、文件上传等

### 📊 项目分析

- [项目分析](/analysis.md) - 项目架构和改进方向

## 主要特性

- ⚡ **高性能** - 使用 IPC 替代 HTTP，消除网络开销
- 🎯 **Express 风格** - 熟悉的 API，降低学习成本
- 📦 **双模块支持** - 同时支持 ESM 和 CommonJS
- 🔒 **类型安全** - 完整的 TypeScript 支持和泛型
- 🚀 **现代化** - 支持最新 Electron 版本
- 📚 **文档完善** - 详细的 API 文档和实用示例

## 版本信息

- **当前版本**: 1.0.0
- **Node.js**: >= 14.0.0
- **Electron**: >= 13.0.0
- **TypeScript**: >= 4.5.0（可选）

## 安装

```bash
npm install @mizuka-wu/ipc-express
```

## 基本用法

### 主进程

```typescript
import { ipcMain } from 'electron';
import express from 'express';
import { IpcServer } from '@mizuka-wu/ipc-express/server';

const app = express();
const ipcServer = new IpcServer(ipcMain);

app.get('/api/users/:id', (req, res) => {
  res.send({ id: req.params.id, name: 'John' });
});

ipcServer.listen(app);
```

### 渲染进程

```typescript
import { ipcRenderer } from 'electron';
import { IpcClient } from '@mizuka-wu/ipc-express/client';

const client = new IpcClient(ipcRenderer);

const response = await client.get<User>('/api/users/1');
console.log(response.data);
```

## 常见问题

### Q: ipc-express 和 Express 有什么区别？

A: ipc-express 使用 IPC 替代 HTTP 进行通信，专门为 Electron 应用设计。它提供了 Express 风格的 API，但不是完整的 Express 实现。

### Q: 我可以在 ipc-express 中使用 Express 中间件吗？

A: 可以！ipc-express 完全支持 Express 中间件。你可以使用任何标准的 Express 中间件。

### Q: ipc-express 支持 WebSocket 吗？

A: 不支持。ipc-express 是基于请求-响应模式的，不支持持久连接。如果需要实时通信，可以考虑使用其他解决方案。

### Q: 如何处理大文件传输？

A: 由于 IPC 的限制，不建议传输大文件。建议使用文件系统直接访问，或将大文件分块传输。

## 贡献指南

我们欢迎贡献！请查看 [GitHub 仓库](https://github.com/mizuka-wu/ipc-express) 了解如何参与。

## 许可证

MIT License - 详见 [LICENSE](https://github.com/mizuka-wu/ipc-express/blob/main/LICENSE)

## 相关资源

- [Electron 官方文档](https://www.electronjs.org/docs)
- [Express 官方文档](https://expressjs.com/)
- [GitHub 仓库](https://github.com/mizuka-wu/ipc-express)

---

**最后更新**: 2024 年
