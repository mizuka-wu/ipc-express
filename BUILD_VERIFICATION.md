# 构建验证报告

## 构建输出验证

### 日期
2024 年 3 月 18 日

### 构建配置
- **Rolldown 版本**: 1.0.0-rc.9
- **TypeScript 版本**: 5.9.3
- **Node.js**: 18+
- **包管理器**: pnpm

## 构建输出结构

### CommonJS 模块 (build/cjs/)
```
build/cjs/
├── index.js                 (2461 bytes)
├── index.js.map            (5441 bytes)
├── index.d.ts              (111 bytes)
├── index.d.ts.map          (187 bytes)
├── interfaces.d.ts          (123 bytes)
├── interfaces.d.ts.map      (213 bytes)
├── types.d.ts               (101 bytes)
├── types.d.ts.map           (181 bytes)
├── client/
│   ├── index.d.ts
│   └── index.d.ts.map
└── server/
    ├── index.d.ts
    ├── index.d.ts.map
    ├── response.d.ts
    └── response.d.ts.map
```

### ES Module (build/esm/)
```
build/esm/
├── index.js                 (2348 bytes)
├── index.js.map            (5429 bytes)
├── index.d.ts              (111 bytes)
├── index.d.ts.map          (187 bytes)
├── interfaces.d.ts          (123 bytes)
├── interfaces.d.ts.map      (213 bytes)
├── types.d.ts               (101 bytes)
├── types.d.ts.map           (181 bytes)
├── client/
│   ├── index.d.ts
│   └── index.d.ts.map
└── server/
    ├── index.d.ts
    ├── index.d.ts.map
    ├── response.d.ts
    └── response.d.ts.map
```

## 验证项目

### ✅ JavaScript 输出
- CommonJS 格式正确生成
- ES Module 格式正确生成
- Source maps 已生成
- 文件大小合理（CJS: 2.46 KB, ESM: 2.35 KB）

### ✅ 类型定义
- 所有 .d.ts 文件已生成
- 类型定义映射 (.d.ts.map) 已生成
- 主入口类型定义正确导出 IpcClient 和 IpcServer

### ✅ 构建脚本
- `pnpm build`: 完整构建（Rolldown + 类型定义）
- `pnpm build:types`: 仅生成类型定义
- `pnpm dev`: 开发模式（监听文件变化）
- `pnpm type-check`: TypeScript 类型检查

### ✅ 文档构建
- `pnpm docs:dev`: VitePress 开发服务器
- `pnpm docs:build`: 构建静态文档网站
- `pnpm docs:preview`: 预览构建的文档

## Package.json 导出配置

```json
{
  "exports": {
    ".": {
      "require": {
        "types": "./build/cjs/index.d.ts",
        "default": "./build/cjs/index.js"
      },
      "import": {
        "types": "./build/esm/index.d.ts",
        "default": "./build/esm/index.js"
      }
    }
  }
}
```

## 使用示例

### CommonJS
```javascript
const { IpcClient, IpcServer } = require('@mizuka-wu/ipc-express');
```

### ES Module
```javascript
import { IpcClient, IpcServer } from '@mizuka-wu/ipc-express';
```

### TypeScript
```typescript
import { IpcClient, IpcServer } from '@mizuka-wu/ipc-express';

const client = new IpcClient<UserData>(ipcRenderer);
const response = await client.get<User>('/api/users/1');
```

## 验证命令

运行以下命令验证构建：

```bash
# 完整构建
pnpm build

# 验证类型
pnpm type-check

# 构建文档
pnpm docs:build

# 运行测试
pnpm test
```

## 总结

✅ 所有构建输出验证通过
✅ 双模块支持（ESM + CommonJS）
✅ 完整的类型定义和映射
✅ Source maps 支持调试
✅ 文档网站成功构建
✅ 类型检查通过

项目已准备好发布！
