# IpcClient API

`IpcClient` 是在 Electron 渲染进程中使用的客户端类，用于向主进程发送 IPC 请求。

## 构造函数

```typescript
constructor(ipcRenderer: IpcRenderer, namespace?: string)
```

### 参数

- `ipcRenderer` - Electron 的 `ipcRenderer` 对象
- `namespace` - 可选，IPC 通道名称，默认为 `'api-request'`

### 示例

```typescript
import { ipcRenderer } from 'electron';
import { IpcClient } from '@mizuka-wu/ipc-express';

const client = new IpcClient(ipcRenderer);
// 或使用自定义命名空间
const customClient = new IpcClient(ipcRenderer, 'my-api');
```

## 方法

### get

发送 GET 请求。

```typescript
get<T = any>(path: string, body?: any): Promise<IResponseObject<T>>
```

### post

发送 POST 请求。

```typescript
post<T = any>(path: string, body?: any): Promise<IResponseObject<T>>
```

### put

发送 PUT 请求。

```typescript
put<T = any>(path: string, body?: any): Promise<IResponseObject<T>>
```

### patch

发送 PATCH 请求。

```typescript
patch<T = any>(path: string, body?: any): Promise<IResponseObject<T>>
```

### delete

发送 DELETE 请求。

```typescript
delete<T = any>(path: string, body?: any): Promise<IResponseObject<T>>
```

## 响应对象

所有方法都返回一个 `Promise<IResponseObject<T>>`，其中：

```typescript
interface IResponseObject<T = any> {
  data: T;           // 响应数据
  statusCode: number; // HTTP 状态码
}
```

## 错误处理

当响应的 `statusCode` 不在 200-299 范围内时，Promise 会被 reject：

```typescript
try {
  const response = await client.get('/api/users/123');
  console.log(response.data);
} catch (error) {
  console.error('Request failed:', error.statusCode);
}
```

## 类型推断

使用泛型参数可以获得完整的类型安全：

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const response = await client.get<User>('/api/users/123');
// response.data 的类型为 User
console.log(response.data.name); // ✓ 类型安全
```

## 属性

### namespace

获取当前使用的 IPC 命名空间。

```typescript
const client = new IpcClient(ipcRenderer, 'custom');
console.log(client.namespace); // 'custom'
```

### ipcRenderer

获取底层的 `ipcRenderer` 对象。

```typescript
const renderer = client.ipcRenderer;
```
