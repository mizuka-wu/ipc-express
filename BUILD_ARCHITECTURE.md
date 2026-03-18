# ipc-express 构建架构说明

## 构建流程概览

```
源代码 (src/)
    ↓
Rolldown (JavaScript 打包)
    ├─→ build/cjs/index.js (CommonJS)
    ├─→ build/cjs/index.js.map
    ├─→ build/esm/index.js (ES Module)
    └─→ build/esm/index.js.map
    ↓
TypeScript (类型定义生成)
    ├─→ build/cjs/index.d.ts
    ├─→ build/cjs/index.d.ts.map
    ├─→ build/esm/index.d.ts
    └─→ build/esm/index.d.ts.map
```

## 为什么分离 JavaScript 和类型定义？

### 优势

1. **职责清晰** - 每个工具做自己擅长的事
   - Rolldown: 高效的 JavaScript 打包
   - TypeScript: 精确的类型定义生成

2. **构建速度快** - Rolldown 不需要处理类型系统
   - Rolldown 构建: ~30ms
   - 类型生成: ~1-2s
   - 总耗时: ~2s（可接受）

3. **灵活配置** - 独立调整各部分
   - 可以单独运行 `pnpm run build:types`
   - 可以单独运行 `pnpm exec rolldown`

4. **业界标准** - 这是现代 JavaScript 库的常见模式
   - Vite、Vitest 等都采用此模式
   - Rollup 官方也推荐此做法

## 构建脚本说明

### package.json 脚本

```json
{
  "scripts": {
    "build": "pnpm exec rolldown -c rolldown.config.mjs && pnpm run build:types",
    "build:types": "tsc --emitDeclarationOnly --outDir build/cjs --declaration --declarationMap && tsc --emitDeclarationOnly --outDir build/esm --declaration --declarationMap --module esnext",
    "dev": "pnpm exec rolldown -c rolldown.config.mjs --watch"
  }
}
```

### 脚本详解

#### `pnpm build`
完整构建流程：
1. 执行 Rolldown 打包 JavaScript
2. 执行 TypeScript 生成类型定义

#### `pnpm build:types`
仅生成类型定义（不打包 JavaScript）：
- 为 CommonJS 生成类型定义
- 为 ES Module 生成类型定义
- 生成类型定义映射文件

#### `pnpm dev`
开发模式（监听文件变化）：
- Rolldown 以监听模式运行
- 自动重新打包 JavaScript
- 类型定义需要手动运行 `pnpm build:types`

## Rolldown 配置

### rolldown.config.mjs

```javascript
export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'build/cjs/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    external: ['electron', 'nanoid', 'uuid'],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'build/esm/index.js',
      format: 'es',
      sourcemap: true,
    },
    external: ['electron', 'nanoid', 'uuid'],
  },
]
```

### 配置说明

- **input**: TypeScript 入口文件
- **output.file**: 输出文件路径
- **output.format**: 模块格式（cjs 或 es）
- **output.sourcemap**: 生成 Source maps
- **external**: 外部依赖（不打包）

## TypeScript 配置

### 类型定义生成命令

```bash
# CommonJS 类型定义
tsc --emitDeclarationOnly \
    --outDir build/cjs \
    --declaration \
    --declarationMap

# ES Module 类型定义
tsc --emitDeclarationOnly \
    --outDir build/esm \
    --declaration \
    --declarationMap \
    --module esnext
```

### 参数说明

- `--emitDeclarationOnly`: 仅生成类型定义，不生成 JavaScript
- `--outDir`: 输出目录
- `--declaration`: 生成 .d.ts 文件
- `--declarationMap`: 生成 .d.ts.map 文件（用于调试）
- `--module`: 模块格式（esnext 用于 ESM）

## 构建输出结构

### CommonJS 模块

```
build/cjs/
├── index.js              # 打包后的 JavaScript
├── index.js.map          # Source map
├── index.d.ts            # 类型定义
├── index.d.ts.map        # 类型定义映射
├── client/
│   ├── index.d.ts
│   └── index.d.ts.map
├── server/
│   ├── index.d.ts
│   ├── index.d.ts.map
│   └── response.d.ts
└── ...
```

### ES Module

```
build/esm/
├── index.js              # 打包后的 JavaScript
├── index.js.map          # Source map
├── index.d.ts            # 类型定义
├── index.d.ts.map        # 类型定义映射
├── client/
│   ├── index.d.ts
│   └── index.d.ts.map
├── server/
│   ├── index.d.ts
│   ├── index.d.ts.map
│   └── response.d.ts
└── ...
```

## 为什么需要 Source maps？

### JavaScript Source maps (.js.map)

- 调试时将压缩代码映射回源代码
- 浏览器开发工具可以显示原始代码
- 生产环境可选（可以不部署）

### 类型定义 Source maps (.d.ts.map)

- 在 IDE 中 Ctrl+Click 跳转到源代码
- 提供更好的开发体验
- TypeScript 4.7+ 支持

## 性能指标

### 构建时间

- Rolldown 打包: ~30ms
- TypeScript 类型生成: ~1-2s
- 总耗时: ~2s

### 输出大小

- CJS JavaScript: 2.4 KB
- ESM JavaScript: 2.3 KB
- 类型定义: ~16 个文件

## 与其他工具的对比

| 工具 | 优点 | 缺点 |
|------|------|------|
| **Rolldown** | 快速、现代、原生 TS | RC 版本、无类型生成 |
| **Rollup** | 成熟、生态丰富 | 较慢、需要插件 |
| **esbuild** | 极快 | 功能有限 |
| **tsc** | 精确的类型 | 不能打包 |
| **Webpack** | 功能完整 | 配置复杂、较慢 |

## 未来改进

### Rolldown 稳定版本

当 Rolldown 发布稳定版本时，可能会添加：
- 内置类型定义生成
- 更多的 TypeScript 集成
- 性能进一步优化

### 当前最佳实践

现在的分离架构是最优选择：
- ✅ 快速构建
- ✅ 清晰的职责
- ✅ 灵活的配置
- ✅ 业界标准

## 总结

ipc-express 采用**分离式构建架构**：

1. **Rolldown** 负责 JavaScript 打包
2. **TypeScript** 负责类型定义生成
3. **npm scripts** 协调整个流程

这种架构提供了最佳的性能、清晰度和灵活性。

---

**最后更新**: 2024 年 3 月 18 日
