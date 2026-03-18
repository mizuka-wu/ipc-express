# 类型定义

ipc-express 提供完整的 TypeScript 类型定义，支持泛型和类型推断。

## IResponseObject

响应对象接口，包含响应数据和状态码。

```typescript
interface IResponseObject<T = any> {
  data: T;           // 响应数据，支持泛型
  statusCode: number; // HTTP 状态码
}
```

### 使用示例

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

// 类型会自动推断为 User
const response: IResponseObject<User> = {
  data: { id: '1', name: 'John', email: 'john@example.com' },
  statusCode: 200,
};

// 或在请求中使用
const response = await client.get<User>('/api/users/1');
console.log(response.data.name); // ✓ 类型安全
```

## Method

HTTP 方法类型。

```typescript
type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';
```

## IpcClientOptions

IpcClient 初始化选项。

```typescript
interface IpcClientOptions {
  namespace?: string; // IPC 通道名称，默认为 'api-request'
}
```

## IpcServerOptions

IpcServer 初始化选项。

```typescript
interface IpcServerOptions {
  namespace?: string; // IPC 通道名称，默认为 'api-request'
}
```

## 导出的类型

所有以下类型都可以从 `@mizuka-wu/ipc-express` 导入：

```typescript
import {
  IResponseObject,
  Method,
  IpcClient,
  IpcServer,
} from '@mizuka-wu/ipc-express';
```

## 泛型使用

### 基础泛型

```typescript
// 简单类型
const response = await client.get<string>('/api/message');
console.log(response.data); // string

// 对象类型
interface Product {
  id: number;
  name: string;
  price: number;
}

const response = await client.get<Product>('/api/products/1');
console.log(response.data.price); // number
```

### 数组泛型

```typescript
interface User {
  id: number;
  name: string;
}

const response = await client.get<User[]>('/api/users');
response.data.forEach(user => {
  console.log(user.name); // string
});
```

### 嵌套泛型

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface User {
  id: number;
  name: string;
}

const response = await client.get<ApiResponse<User>>('/api/user');
console.log(response.data.data.name); // string
```

## 类型推断

ipc-express 支持自动类型推断：

```typescript
// 不指定泛型时，默认为 any
const response = await client.get('/api/data');
// response.data 的类型为 any

// 指定泛型后获得完整的类型安全
const response = await client.get<{ count: number }>('/api/data');
// response.data.count 的类型为 number
```

## 常见类型模式

### 分页响应

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface User {
  id: number;
  name: string;
}

const response = await client.get<PaginatedResponse<User>>('/api/users?page=1');
console.log(response.data.items[0].name); // string
```

### 错误响应

```typescript
interface ErrorResponse {
  error: string;
  code: number;
  details?: Record<string, any>;
}

try {
  const response = await client.post<{ id: number }>('/api/users', {});
} catch (error) {
  const errorResponse = error as IResponseObject<ErrorResponse>;
  console.log(errorResponse.data.error);
}
```

### 通用 API 响应

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

const response = await client.get<ApiResponse<User>>('/api/user/1');
if (response.data.success) {
  console.log(response.data.data?.name);
}
```
