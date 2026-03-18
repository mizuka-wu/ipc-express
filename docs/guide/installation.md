# 安装

## npm 安装

```bash
npm install @mizuka-wu/ipc-express
```

## yarn 安装

```bash
yarn add @mizuka-wu/ipc-express
```

## pnpm 安装

```bash
pnpm add @mizuka-wu/ipc-express
```

## 环境要求

- **Node.js**: >= 14.0.0
- **Electron**: >= 13.0.0
- **TypeScript**: >= 4.5.0（可选，但推荐）

## 依赖

ipc-express 有以下依赖：

- `nanoid` - 生成唯一 ID
- `uuid` - UUID 生成

这些依赖会自动安装。

## 开发依赖

如果你要为 ipc-express 做贡献，需要以下开发依赖：

```bash
npm install --save-dev \
  typescript \
  @types/node \
  @types/express \
  electron \
  rolldown \
  jest \
  @types/jest \
  ts-jest \
  eslint \
  prettier
```

## 快速验证

安装后，你可以验证安装是否成功：

```typescript
import { IpcClient, IpcServer } from '@mizuka-wu/ipc-express';

console.log('ipc-express installed successfully!');
```

## 模块格式

ipc-express 支持两种模块格式：

### CommonJS

```javascript
const { IpcClient, IpcServer } = require('@mizuka-wu/ipc-express');
```

### ES Modules

```typescript
import { IpcClient, IpcServer } from '@mizuka-wu/ipc-express';
```

## TypeScript 配置

如果使用 TypeScript，确保你的 `tsconfig.json` 包含以下配置：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## 从旧版本升级

### 从 0.3.x 升级到 1.0.0

主要变化：

1. **模块输出** - 现在支持 ESM 和 CommonJS
2. **类型定义** - 完整的泛型支持
3. **TypeScript** - 升级到 5.x
4. **Electron** - 支持最新版本

升级步骤：

```bash
npm install @mizuka-wu/ipc-express@latest
```

更新导入（如果使用 TypeScript）：

```typescript
// 旧版本
import { IpcClient } from '@mizuka-wu/ipc-express';
const client = new IpcClient(ipcRenderer);

// 新版本（完全兼容，但现在支持泛型）
import { IpcClient } from '@mizuka-wu/ipc-express';
const client = new IpcClient(ipcRenderer);
const response = await client.get<User>('/api/users/1');
```

## 故障排除

### 模块未找到错误

如果遇到 "Cannot find module '@mizuka-wu/ipc-express'" 错误：

1. 确保已安装：`npm install @mizuka-wu/ipc-express`
2. 清除 node_modules：`rm -rf node_modules && npm install`
3. 检查 package.json 中的版本号

### TypeScript 类型错误

如果 TypeScript 无法找到类型定义：

1. 确保安装了最新版本
2. 检查 tsconfig.json 的 `moduleResolution` 设置为 `"node"`
3. 清除 TypeScript 缓存：`rm -rf dist && tsc --noEmit`

### Electron 兼容性问题

如果遇到 Electron 兼容性问题：

1. 升级 Electron 到最新版本：`npm install electron@latest`
2. 确保使用了兼容的 ipc-express 版本

## 下一步

- 查看 [快速开始](/guide/getting-started) 了解基本用法
- 阅读 [API 文档](/api/client) 了解详细 API
- 浏览 [示例](/examples/basic) 学习实际应用
