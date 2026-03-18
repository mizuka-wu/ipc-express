# 最佳实践

## 1. 类型安全

始终为请求和响应使用泛型类型参数。

### ✅ 推荐

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const response = await client.get<User>('/api/users/1');
console.log(response.data.name); // ✓ 类型安全
```

### ❌ 不推荐

```typescript
const response = await client.get('/api/users/1');
console.log((response.data as any).name); // ✗ 失去类型安全
```

## 2. 错误处理

始终使用 try-catch 处理 IPC 请求。

### ✅ 推荐

```typescript
try {
  const response = await client.post<User>('/api/users', userData);
  console.log('User created:', response.data);
} catch (error) {
  const errorResponse = error as IResponseObject;
  console.error('Failed to create user:', errorResponse.data);
  // 显示用户友好的错误消息
}
```

### ❌ 不推荐

```typescript
const response = await client.post('/api/users', userData);
console.log(response.data); // 没有错误处理
```

## 3. HTTP 状态码

使用正确的 HTTP 状态码表示不同的响应状态。

### ✅ 推荐

```typescript
// 获取成功
app.get('/api/users/:id', (req, res) => {
  const user = findUser(req.params.id);
  if (!user) {
    return res.status(404).send({ error: 'User not found' });
  }
  res.status(200).send(user);
});

// 创建成功
app.post('/api/users', (req, res) => {
  const user = createUser(req.body);
  res.status(201).send(user);
});

// 验证失败
app.post('/api/users', (req, res) => {
  if (!req.body.name) {
    return res.status(400).send({ error: 'Name is required' });
  }
  // ...
});

// 未授权
app.delete('/api/users/:id', (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  // ...
});

// 禁止访问
app.delete('/api/admin', (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).send({ error: 'Forbidden' });
  }
  // ...
});
```

## 4. 中间件使用

使用中间件处理横切关注点。

### ✅ 推荐

```typescript
// 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 身份验证中间件
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token || !verifyToken(token)) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  req.user = decodeToken(token);
  next();
};

// 应用中间件
app.use(authenticate);

// 受保护的路由
app.get('/api/profile', (req, res) => {
  res.send(req.user);
});
```

## 5. 路由组织

使用 Express Router 组织相关的路由。

### ✅ 推荐

```typescript
// routes/users.ts
const router = express.Router();

router.get('/', (req, res) => {
  res.send(getAllUsers());
});

router.get('/:id', (req, res) => {
  const user = getUser(req.params.id);
  if (!user) {
    return res.status(404).send({ error: 'Not found' });
  }
  res.send(user);
});

router.post('/', (req, res) => {
  const user = createUser(req.body);
  res.status(201).send(user);
});

export default router;

// main.ts
import userRouter from './routes/users';
app.use('/api/users', userRouter);
```

## 6. 数据验证

在处理请求前验证输入数据。

### ✅ 推荐

```typescript
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  
  // 验证必需字段
  if (!name || !email) {
    return res.status(400).send({
      error: 'Validation failed',
      details: {
        name: !name ? 'Name is required' : undefined,
        email: !email ? 'Email is required' : undefined,
      },
    });
  }
  
  // 验证格式
  if (!isValidEmail(email)) {
    return res.status(400).send({
      error: 'Invalid email format',
    });
  }
  
  const user = createUser({ name, email });
  res.status(201).send(user);
});
```

## 7. 错误处理中间件

使用错误处理中间件统一处理错误。

### ✅ 推荐

```typescript
// 错误处理中间件（必须在所有其他中间件之后）
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof ValidationError) {
    return res.status(400).send({
      error: 'Validation failed',
      details: err.details,
    });
  }
  
  if (err instanceof NotFoundError) {
    return res.status(404).send({
      error: 'Not found',
    });
  }
  
  // 默认错误
  res.status(500).send({
    error: 'Internal server error',
  });
});
```

## 8. 异步操作

正确处理异步操作。

### ✅ 推荐

```typescript
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await fetchUserFromDatabase(req.params.id);
    if (!user) {
      return res.status(404).send({ error: 'Not found' });
    }
    res.send(user);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});
```

## 9. 命名空间隔离

为不同的应用或模块使用不同的命名空间。

### ✅ 推荐

```typescript
// 主应用
const mainServer = new IpcServer(ipcMain);
mainServer.listen(mainApp, 'main-api');

// 插件系统
const pluginServer = new IpcServer(ipcMain);
pluginServer.listen(pluginApp, 'plugin-api');

// 客户端
const mainClient = new IpcClient(ipcRenderer, 'main-api');
const pluginClient = new IpcClient(ipcRenderer, 'plugin-api');
```

## 10. 性能优化

### 避免大数据传输

```typescript
// ❌ 不推荐：传输大量数据
app.get('/api/all-users', (req, res) => {
  const allUsers = getAllUsers(); // 可能是数千条记录
  res.send(allUsers);
});

// ✅ 推荐：使用分页
app.get('/api/users', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 20;
  const users = getUsersPage(page, pageSize);
  res.send({
    items: users,
    total: getTotalUserCount(),
    page,
    pageSize,
  });
});
```

### 缓存常用数据

```typescript
// 缓存用户数据
const userCache = new Map<number, User>();

app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  // 检查缓存
  if (userCache.has(id)) {
    return res.send(userCache.get(id));
  }
  
  // 从数据库获取
  const user = getUser(id);
  if (user) {
    userCache.set(id, user);
  }
  
  res.send(user);
});
```

## 11. 日志记录

使用结构化日志便于调试和监控。

### ✅ 推荐

```typescript
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  
  next();
});
```

## 12. 清理资源

应用关闭时正确清理资源。

### ✅ 推荐

```typescript
import { app } from 'electron';

app.on('before-quit', () => {
  ipcServer.removeAllListeners();
  // 关闭数据库连接等
  closeDatabase();
});
```

## 总结

- ✅ 使用 TypeScript 和类型安全
- ✅ 正确处理错误
- ✅ 使用合适的 HTTP 状态码
- ✅ 使用中间件处理横切关注点
- ✅ 验证输入数据
- ✅ 优化性能
- ✅ 记录日志
- ✅ 清理资源
