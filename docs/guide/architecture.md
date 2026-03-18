# 架构设计

## 整体架构

ipc-express 采用客户端-服务器架构，在 Electron 的主进程和渲染进程之间建立通信通道。

```
┌─────────────────────────────────────────────────────────┐
│                  Electron 应用                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────┐      ┌──────────────────────┐ │
│  │   渲染进程(Renderer)  │      │    主进程(Main)      │ │
│  │                      │      │                      │ │
│  │  ┌────────────────┐  │      │  ┌────────────────┐  │ │
│  │  │  IpcClient     │  │      │  │  IpcServer     │  │ │
│  │  │  - 发送请求   │  │      │  │  - 监听请求   │  │ │
│  │  │  - 处理响应   │  │      │  │  - 调用 Express│  │ │
│  │  └────────────────┘  │      │  │  - 返回响应   │  │ │
│  │         │            │      │         │          │  │
│  │         │ IPC Send   │      │         │          │  │ │
│  │         └────────────┼──────┼─────────┘          │  │
│  │                      │      │  ┌────────────────┐  │ │
│  │                      │      │  │ Express App    │  │ │
│  │                      │      │  │ - 路由         │  │ │
│  │                      │      │  │ - 中间件       │  │ │
│  │                      │      │  │ - 处理逻辑     │  │ │
│  │                      │      │  └────────────────┘  │ │
│  │                      │      │                      │ │
│  └──────────────────────┘      └──────────────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## 核心组件

### IpcClient（客户端）

运行在渲染进程中，负责：
- 生成唯一的请求 ID
- 构建请求数据
- 通过 IPC 发送请求
- 监听响应事件
- 返回 Promise 结果

### IpcServer（服务器）

运行在主进程中，负责：
- 监听 IPC 请求事件
- 解析请求数据
- 调用 Express 应用处理
- 返回响应给客户端

### Express 应用

标准的 Express 应用，负责：
- 定义路由
- 使用中间件
- 处理业务逻辑
- 生成响应

## 请求流程

```
1. 客户端调用方法
   client.get('/api/users/123')
   
2. 生成唯一 ID
   responseId = nanoid()
   
3. 构建请求数据
   {
     method: 'get',
     path: '/api/users/123',
     body: {},
     responseId: 'abc123'
   }
   
4. 发送 IPC 消息
   ipcRenderer.send('api-request', data)
   
5. 服务器接收请求
   ipcMain.on('api-request', (event, data) => {
     expressApp(request, response)
   })
   
6. Express 处理请求
   app.get('/api/users/:id', (req, res) => {
     res.send({ id: '123', name: 'John' })
   })
   
7. 返回响应
   response.send(result)
   
8. 服务器发送 IPC 响应
   event.sender.send(responseId, {
     data: result,
     statusCode: 200
   })
   
9. 客户端接收响应
   ipcRenderer.on(responseId, (_, result) => {
     resolve(result)
   })
   
10. 返回 Promise 结果
    Promise<IResponseObject>
```

## 数据结构

### 请求数据

```typescript
interface SendData {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;      // 请求路径，如 '/api/users/123?page=1'
  body: any;         // 请求体
  responseId: string; // 唯一响应标识符
}
```

### 响应数据

```typescript
interface IResponseObject<T = any> {
  data: T;           // 响应数据
  statusCode: number; // HTTP 状态码
}
```

## 性能特性

### 优势

1. **无 HTTP 开销** - 直接使用 IPC，避免网络开销
2. **低延迟** - 进程间通信比网络通信快得多
3. **类型安全** - 完整的 TypeScript 支持
4. **熟悉的 API** - 使用 Express 风格的 API

### 限制

1. **仅限本地** - 只能在同一应用内通信
2. **单向通信** - 不支持 WebSocket 等持久连接
3. **序列化限制** - 数据需要能被序列化

## 扩展性

### 中间件支持

ipc-express 完全支持 Express 中间件：

```typescript
app.use(express.json());
app.use(cors());
app.use(logger);
app.use(authentication);
```

### 路由组织

使用 Express Router 组织路由：

```typescript
const userRouter = express.Router();
userRouter.get('/:id', (req, res) => { /* ... */ });
userRouter.post('/', (req, res) => { /* ... */ });

app.use('/api/users', userRouter);
```

### 错误处理

使用 Express 错误处理中间件：

```typescript
app.use((err, req, res, next) => {
  res.status(500).send({ error: err.message });
});
```

## 最佳实践

1. **使用类型定义** - 充分利用 TypeScript 的类型系统
2. **合理使用中间件** - 日志、验证、错误处理等
3. **遵循 REST 设计** - 使用正确的 HTTP 方法和状态码
4. **错误处理** - 正确处理和返回错误
5. **性能优化** - 避免在 IPC 中传输大量数据

## 与标准 Express 的区别

| 特性 | ipc-express | Express |
|------|-----------|---------|
| 传输方式 | IPC | HTTP |
| 请求对象 | 简化版 | 完整 |
| 响应对象 | 简化版 | 完整 |
| 中间件 | 支持 | 支持 |
| 路由 | 支持 | 支持 |
| WebSocket | 不支持 | 需要额外库 |
| 跨域 | N/A | 需要 CORS |
| 认证 | 支持 | 支持 |

## 安全考虑

1. **验证输入** - 始终验证来自渲染进程的输入
2. **限制权限** - 不要暴露敏感的主进程功能
3. **错误信息** - 不要在错误消息中泄露敏感信息
4. **身份验证** - 实现适当的身份验证机制

```typescript
// 验证示例
app.post('/api/admin', (req, res) => {
  if (!req.body.token || !verifyToken(req.body.token)) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  // 处理请求
});
```
