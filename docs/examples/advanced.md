# 高级用法

## 1. 认证和授权

### JWT 认证示例

```typescript
import jwt from 'jsonwebtoken';

const SECRET = 'your-secret-key';

// 生成 token
function generateToken(userId: number): string {
  return jwt.sign({ userId }, SECRET, { expiresIn: '24h' });
}

// 验证 token
function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, SECRET) as { userId: number };
  } catch {
    return null;
  }
}

// 认证中间件
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).send({ error: 'Missing token' });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).send({ error: 'Invalid token' });
  }
  
  req.user = decoded;
  next();
};

// 应用中间件
app.use(authenticate);

// 受保护的路由
app.get('/api/profile', (req, res) => {
  res.send({ userId: req.user.userId });
});

// 登录路由
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // 验证用户名和密码
  if (username === 'admin' && password === 'password') {
    const token = generateToken(1);
    return res.send({ token });
  }
  
  res.status(401).send({ error: 'Invalid credentials' });
});
```

### 客户端使用

```typescript
let authToken: string;

// 登录
async function login(username: string, password: string) {
  const response = await client.post<{ token: string }>('/api/login', {
    username,
    password,
  });
  authToken = response.data.token;
}

// 发送认证请求
async function getProfile() {
  const response = await client.get('/api/profile', {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  console.log(response.data);
}
```

## 2. 数据库集成

### 使用 TypeORM

```typescript
import { createConnection, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
}

// 初始化数据库
let db;

async function initDatabase() {
  db = await createConnection({
    type: 'sqlite',
    database: 'app.db',
    entities: [User],
    synchronize: true,
  });
}

// 路由
app.get('/api/users/:id', async (req, res) => {
  const user = await db.getRepository(User).findOne(req.params.id);
  
  if (!user) {
    return res.status(404).send({ error: 'User not found' });
  }
  
  res.send(user);
});

app.post('/api/users', async (req, res) => {
  const user = db.getRepository(User).create(req.body);
  await db.getRepository(User).save(user);
  res.status(201).send(user);
});
```

## 3. 文件上传处理

### 处理文件上传

```typescript
import fs from 'fs';
import path from 'path';

// 创建上传目录
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 文件上传路由
app.post('/api/upload', (req, res) => {
  const { filename, data } = req.body;
  
  if (!filename || !data) {
    return res.status(400).send({ error: 'Missing filename or data' });
  }
  
  const filepath = path.join(uploadDir, filename);
  
  // 防止路径遍历攻击
  if (!filepath.startsWith(uploadDir)) {
    return res.status(400).send({ error: 'Invalid filename' });
  }
  
  fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
  
  res.status(201).send({
    filename,
    path: `/uploads/${filename}`,
  });
});

// 文件下载路由
app.get('/api/download/:filename', (req, res) => {
  const filepath = path.join(uploadDir, req.params.filename);
  
  if (!filepath.startsWith(uploadDir) || !fs.existsSync(filepath)) {
    return res.status(404).send({ error: 'File not found' });
  }
  
  const data = fs.readFileSync(filepath);
  res.send({
    filename: req.params.filename,
    data: data.toString('base64'),
  });
});
```

### 客户端上传文件

```typescript
async function uploadFile(file: File) {
  const reader = new FileReader();
  
  reader.onload = async (e) => {
    const data = e.target?.result as string;
    const base64 = data.split(',')[1];
    
    const response = await client.post('/api/upload', {
      filename: file.name,
      data: base64,
    });
    
    console.log('File uploaded:', response.data);
  };
  
  reader.readAsDataURL(file);
}
```

## 4. 实时数据同步

### 使用事件发射器

```typescript
import { EventEmitter } from 'events';

const dataEmitter = new EventEmitter();

// 数据变化时发出事件
function updateData(data: any) {
  dataEmitter.emit('data-changed', data);
}

// 轮询获取最新数据
app.get('/api/data/latest', (req, res) => {
  let latestData = null;
  
  const listener = (data) => {
    latestData = data;
  };
  
  dataEmitter.on('data-changed', listener);
  
  // 等待数据变化或超时
  const timeout = setTimeout(() => {
    dataEmitter.removeListener('data-changed', listener);
    res.send({ data: latestData });
  }, 30000); // 30 秒超时
  
  // 如果立即有数据变化
  if (latestData) {
    clearTimeout(timeout);
    dataEmitter.removeListener('data-changed', listener);
    res.send({ data: latestData });
  }
});
```

## 5. 错误恢复和重试

### 客户端重试逻辑

```typescript
async function requestWithRetry<T>(
  fn: () => Promise<IResponseObject<T>>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<IResponseObject<T>> {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 不重试 4xx 错误
      if (error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }
      
      // 等待后重试
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }
  
  throw lastError;
}

// 使用
const response = await requestWithRetry(
  () => client.get<User>('/api/users/1'),
  3,
  1000
);
```

## 6. 批量操作

### 批量获取数据

```typescript
app.post('/api/users/batch', (req, res) => {
  const { ids } = req.body;
  
  if (!Array.isArray(ids)) {
    return res.status(400).send({ error: 'ids must be an array' });
  }
  
  const users = ids
    .map(id => getUser(id))
    .filter(user => user !== null);
  
  res.send(users);
});

// 客户端
async function getMultipleUsers(ids: number[]) {
  const response = await client.post<User[]>('/api/users/batch', { ids });
  return response.data;
}
```

## 7. 缓存策略

### 实现缓存层

```typescript
class CacheManager<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private ttl: number; // 毫秒

  constructor(ttlSeconds: number = 300) {
    this.ttl = ttlSeconds * 1000;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// 使用
const userCache = new CacheManager<User>(300); // 5 分钟缓存

app.get('/api/users/:id', (req, res) => {
  const cacheKey = `user:${req.params.id}`;
  
  // 检查缓存
  const cached = userCache.get(cacheKey);
  if (cached) {
    return res.send(cached);
  }
  
  // 从数据库获取
  const user = getUser(req.params.id);
  if (!user) {
    return res.status(404).send({ error: 'Not found' });
  }
  
  // 存储到缓存
  userCache.set(cacheKey, user);
  res.send(user);
});
```

## 8. 性能监控

### 添加性能指标

```typescript
interface RequestMetrics {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
}

const metrics: RequestMetrics[] = [];

app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    metrics.push({
      method: req.method,
      path: req.url,
      statusCode: res.statusCode,
      duration: Date.now() - startTime,
      timestamp: new Date(),
    });
  });
  
  next();
});

// 获取性能报告
app.get('/api/metrics', (req, res) => {
  const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
  const slowRequests = metrics.filter(m => m.duration > 1000);
  
  res.send({
    totalRequests: metrics.length,
    avgDuration,
    slowRequests,
  });
});
```

## 9. 版本控制

### API 版本管理

```typescript
// v1 路由
const v1Router = express.Router();

v1Router.get('/users/:id', (req, res) => {
  res.send({
    id: req.params.id,
    name: 'John',
  });
});

// v2 路由（改进的响应格式）
const v2Router = express.Router();

v2Router.get('/users/:id', (req, res) => {
  res.send({
    data: {
      id: req.params.id,
      name: 'John',
      email: 'john@example.com',
    },
    meta: {
      version: 'v2',
      timestamp: new Date(),
    },
  });
});

// 挂载路由
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);
```

## 10. 优雅关闭

### 处理应用关闭

```typescript
import { app } from 'electron';

let isShuttingDown = false;

// 标记关闭状态
app.on('before-quit', () => {
  isShuttingDown = true;
});

// 拒绝新请求
app.use((req, res, next) => {
  if (isShuttingDown) {
    return res.status(503).send({ error: 'Server is shutting down' });
  }
  next();
});

// 清理资源
app.on('before-quit', async () => {
  // 关闭数据库连接
  if (db) {
    await db.close();
  }
  
  // 移除 IPC 监听器
  ipcServer.removeAllListeners();
  
  // 等待待处理请求完成
  await new Promise(resolve => setTimeout(resolve, 5000));
});
```

这些高级示例展示了如何在实际应用中使用 ipc-express。根据你的具体需求选择合适的模式。
