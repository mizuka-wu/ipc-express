# IpcResponse 实现原理

## 问题背景

在 Electron 应用中，我们希望复用 Express 的中间件生态系统（如 helmet、cors、compression 等）来处理 IPC 通信中的 HTTP 风格请求。但传统的 Express 应用直接写入 socket，而我们需要通过 Electron IPC 将响应发送回渲染进程。

## 核心挑战

### Express 5 的 Response 继承链

```javascript
// express/lib/response.js
var res = Object.create(http.ServerResponse.prototype)
```

Express 5 的 Response 对象继承自 Node.js 的 `http.ServerResponse`，它使用内部 Symbol `kOutHeaders` 来存储响应头。

### 为什么简单的自定义对象不行？

当 Express 中间件调用 `res.getHeader()` 时，实际调用的是 Node.js 原生的实现：

```javascript
// lib/_http_outgoing.js
OutgoingMessage.prototype.getHeader = function getHeader(name) {
  const headers = this[kOutHeaders];  // Symbol 作为 key
  if (headers === null) return;
  const entry = headers[name.toLowerCase()];
  return entry && entry[1];
};
```

由于 `kOutHeaders` 是 Node.js 内部 Symbol，外部无法访问。如果自定义对象没有继承 `ServerResponse`，中间件会访问不到 headers，导致报错：

```
TypeError: Cannot read properties of undefined (reading 'content-type')
```

## 解决方案：继承 ServerResponse

### 核心思路

`IpcResponse` 类继承 `http.ServerResponse`，获得完整的 Node.js HTTP 响应对象能力，同时重写关键方法来拦截响应数据，改为通过 IPC 发送。

### 实现要点

#### 1. 继承 ServerResponse

```typescript
import { ServerResponse, IncomingMessage } from 'http';

class IpcResponse extends ServerResponse {
  constructor(originalEvent: IpcMainEvent, responseId: string) {
    super(createFakeRequest());  // 需要传入一个伪造的 IncomingMessage
    // ...
  }
}
```

#### 2. 方法绑定到实例

**关键点**：Express 在处理请求时会修改响应对象的原型链（`res.__proto__`），将原型指向 Express 自己的 response 对象。这会导致我们自定义的 `end()` 方法被覆盖。

**解决方案**：在构造函数中将方法绑定到实例本身，而不是原型：

```typescript
constructor(originalEvent: IpcMainEvent, responseId: string) {
  // ...
  // 绑定方法到实例，防止 Express 覆盖原型链后丢失
  this.end = this.end.bind(this);
  this.write = this.write.bind(this);
  this.writeHead = this.writeHead.bind(this);
}
```

这样无论原型链如何变化，实例上的 `end`、`write`、`writeHead` 始终指向我们的实现。

#### 3. 重写关键方法

##### `write(chunk, encoding, callback)`

拦截响应体的写入，将数据收集到内部变量 `_body`，而不是写入 socket：

```typescript
override write(chunk: any, _encoding?: any, _cb?: any): boolean {
  if (!this._body) {
    this._body = '';
  }
  this._body += chunk;
  return true;  // 返回 true 表示写入成功
}
```

##### `end(chunk, encoding, callback)`

拦截响应结束，将收集到的数据通过 IPC 发送：

```typescript
override end(chunk?: any, encoding?: any, cb?: any): this {
  if (this._sent) {
    return this;  // 防止重复发送
  }
  this._sent = true;

  // 收集最后的 chunk
  if (chunk) {
    this._body = chunk;
  }

  // 组装响应对象
  const responseObject = {
    data: this._body,
    statusCode: this.statusCode,
    headers: this.getHeaders(),
  };

  // 通过 IPC 发送
  this.originalEvent.sender.send(this.responseId, responseObject);

  // 调用父类的 end（但不实际写入 socket）
  super.end();

  return this;
}
```

##### `writeHead(statusCode, statusMessage, headers)`

支持 `res.writeHead()` 调用，将头部设置到内部存储：

```typescript
override writeHead(
  statusCode: number,
  statusMessageOrHeaders?: string | OutgoingHttpHeaders,
  headers?: OutgoingHttpHeaders,
): this {
  this.statusCode = statusCode;

  let headersToSet: OutgoingHttpHeaders | undefined;
  if (typeof statusMessageOrHeaders === 'object') {
    headersToSet = statusMessageOrHeaders;
  } else if (headers) {
    headersToSet = headers;
  }

  if (headersToSet) {
    Object.entries(headersToSet).forEach(([key, value]) => {
      if (value !== undefined) {
        this.setHeader(key, value);  // 使用父类的 setHeader
      }
    });
  }
  return this;
}
```

#### 4. 提供 Express 风格的便捷方法

为了兼容 Express 路由处理器的习惯用法，提供一些便捷方法：

```typescript
// 链式设置状态码
status(code: number): this {
  this.statusCode = code;
  return this;
}

// 直接发送数据
send<T = any>(result: T): this {
  this._body = result;
  return this.end();
}

// 发送 JSON
json<T = any>(result: T): this {
  if (!this.hasHeader('content-type')) {
    this.setHeader('Content-Type', 'application/json');
  }
  this._body = JSON.stringify(result);
  return this.end();
}

// 设置 Content-Type
type(contentType: string): this {
  this.setHeader('Content-Type', contentType);
  return this;
}

// 批量设置头部
set(field: string | Record<string, string>, value?: string): this {
  // ...
}

// 获取头部
get(field: string): string | number | string[] | undefined {
  return this.getHeader(field);  // 调用父类的 getHeader
}
```

#### 5. 伪造的 IncomingMessage

`ServerResponse` 构造函数需要一个 `IncomingMessage` 对象。我们创建一个最简单的假请求：

```typescript
function createFakeRequest(): IncomingMessage {
  const req = new IncomingMessage(null as any);
  req.method = 'GET';
  req.url = '/';
  req.headers = {};
  return req;
}
```

这个假请求只是为了满足 `ServerResponse` 的初始化要求，实际的数据（如真实的 method、path、headers）由 `IpcServer.createRequest()` 在另一个地方构造。

## 数据流向

```
渲染进程                主进程 (Express)
   |                        |
   |---- IPC 请求 --------->|
   |                        |
   |                   IpcResponse
   |                   (拦截响应)
   |                        |
   |<--- IPC 响应 -----------|
   |   (data, statusCode,    |
   |    headers)             |
   |                        |
```

1. 渲染进程通过 IPC 发送 `{ method, path, body, responseId }`
2. `IpcServer` 构造 `req` 和 `res`（`IpcResponse` 实例）
3. `expressApp(req, res)` 处理请求
4. Express 路由/中间件调用 `res.send()` 或 `res.json()`
5. 这些方法最终会调用 `res.end()`
6. `IpcResponse.end()` 拦截调用，将数据通过 IPC 发送回渲染进程

## 注意事项

### 1. 流式响应

当前的 `IpcResponse` 会缓存整个响应体，不适合超大文件传输。对于流式响应，可以考虑分片发送 IPC 消息。

### 2. 文件下载

`res.sendFile()`、`res.download()` 等方法依赖文件系统操作，需要在 `IpcResponse` 中额外实现，或将文件内容读取到内存后发送。

### 3. Cookie 处理

`res.cookie()` 和 `res.clearCookie()` 设置的是 HTTP 响应头，会被正确收集到 `getHeaders()` 中，但渲染进程需要自己处理这些 cookie。

### 4. 重定向

`res.redirect()` 设置的是 `Location` 头和 3xx 状态码，会被正确收集。渲染进程可以根据响应决定如何处理重定向。

## 总结

`IpcResponse` 通过**继承 ServerResponse + 方法绑定 + 重写拦截**的技术手段，在保持与 Express 完全兼容的同时，将响应数据导向 Electron IPC 而不是 TCP socket，实现了在 IPC 通信中复用 Express 中间件生态的目标。
