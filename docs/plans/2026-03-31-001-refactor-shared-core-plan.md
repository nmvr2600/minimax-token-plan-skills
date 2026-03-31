---
title: 重构为共享 core 包结构
type: refactor
status: completed
date: 2026-03-31
---

# 重构为共享 core 包结构

## Overview

将 minimax-skills 从各 skill 脚本独自携带重复代码的组织方式，改为 baoyu-skills 风格的 workspace 结构：
- 根目录 `package.json` 作为 workspace 入口（`private: true`）
- `packages/minimax-core/` 存放公共代码：错误类、类型定义、API 工具函数
- 各 skill 脚本变为独立子项目，依赖 `minimax-core`

解决各脚本间重复定义 `MinimaxError`、`getConfig()`、`makeRequest()`、`base_resp` 类型等问题。

## Problem Frame

当前问题：
- `MinimaxError` / `MinimaxAuthError` / `MinimaxRequestError` 在 `search.ts`、`analyze.ts`、`tts.ts`、`generate.ts`、`query.ts` 中各自重复定义
- `getConfig()` 在 `search.ts`、`analyze.ts` 中重复
- `makeRequest()` 在 `search.ts`、`analyze.ts` 中几乎相同但重复
- `base_resp` 类型在每个脚本里都定义了一摸一样的 interface

导致：
- LSP 报错（重复的类/接口定义）
- 代码维护困难（改一个类型要改 5 个文件）
- 无法共享工具函数

## Requirements Trace

- R1. 各脚本不再有重复的错误类、类型定义、工具函数
- R2. 共享代码集中管理，通过 `import` 引用
- R3. 各 skill 脚本可独立运行（`bun run skills/xxx/scripts/xxx.ts`）
- R4. 根目录作为 workspace 入口，不直接运行脚本
- R5. 迁移后功能完全等价，不改变 API 行为

## Scope Boundaries

- **包含**: 创建 workspace 结构、迁移共享代码到 `packages/minimax-core/`、更新各 skill 脚本引用
- **不包含**: 业务逻辑变更（API 调用、参数处理逻辑不变）
- **不包含**: SKILL.md 文档更新（命令路径不变）

## Context & Research

### 当前代码重复分析

| 重复项 | 涉及脚本 |
|--------|----------|
| `MinimaxError` | search.ts, analyze.ts, tts.ts, generate.ts, query.ts |
| `MinimaxAuthError` | search.ts, analyze.ts |
| `MinimaxRequestError` | search.ts, analyze.ts |
| `getConfig()` | search.ts, analyze.ts |
| `makeRequest()` | search.ts, analyze.ts |
| `base_resp` 类型 | 所有 5 个脚本 |
| `ModelRemain` / `UsageResponse` | query.ts |
| `CreateTaskResponse` / `QueryTaskResponse` | tts.ts |
| `ImageGenerationResponse` | generate.ts |
| `AnalysisResponse` | analyze.ts |

### 参考：baoyu-skills 结构

```
baoyu-skills/
├── package.json              # private: true, workspaces: ["packages/*"]
├── packages/
│   └── baoyu-fetch/          # 共享包
│       ├── package.json
│       └── src/
│           ├── cli.ts
│           ├── types/
│           ├── utils/
│           └── adapters/
└── skills/
    └── baoyu-xxx/
        └── scripts/
            ├── package.json  # 依赖 baoyu-fetch: "file:./vendor/baoyu-fetch"
            └── main.ts
```

### 技术决策

- **Bun workspaces**: `package.json` 的 `workspaces: ["packages/*"]` 让 Bun 自动链接本地包
- **TypeScript 类型**: `minimax-core/src/types.ts` 集中所有 API 响应类型
- **错误类**: `minimax-core/src/errors.ts` 集中所有自定义错误
- **API 工具**: `minimax-core/src/api.ts` 提供 `getConfig()` 和 `makeRequest()`
- **各 skill 独立**: scripts 目录变为独立子项目，通过 `package.json` 声明依赖

## High-Level Technical Design

```
minimax-skills/
├── package.json                      # private: true, workspaces: ["packages/*"]
├── packages/
│   └── minimax-core/                # 共享核心包
│       ├── package.json              # name: "minimax-core"
│       ├── tsconfig.json
│       ├── src/
│       │   ├── types.ts              # 所有 API 类型定义
│       │   ├── errors.ts             # 所有自定义错误类
│       │   └── api.ts                # getConfig() + makeRequest()
│       └── bun.lock
└── skills/
    ├── minimax-image/
    │   └── scripts/
    │       ├── package.json          # 依赖 "minimax-core": "file:../../../../packages/minimax-core"
    │       └── generate.ts           # import { MinimaxError, ... } from "minimax-core"
    ├── minimax-image-analysis/
    │   └── scripts/
    │       ├── package.json
    │       └── analyze.ts
    ├── minimax-search/
    │   └── scripts/
    │       ├── package.json
    │       └── search.ts
    ├── minimax-speech/
    │   └── scripts/
    │       ├── package.json
    │       └── tts.ts
    └── minimax-usage/
        └── scripts/
            ├── package.json
            └── query.ts
```

## Implementation Units

- [ ] **Unit 1: 创建根 workspace 配置**

**Goal:** 建立 Bun workspace 根配置

**Dependencies:** None

**Files:**
- Create: `package.json` (private: true, workspaces: ["packages/*"])

**Approach:**
- 根目录 package.json 仅作为 workspace 入口
- 不运行任何脚本，不依赖任何生产库

**Verification:**
- `bun install` 后 packages/* 下的包被链接

---

- [ ] **Unit 2: 创建 minimax-core 包**

**Goal:** 建立共享核心包，迁移所有重复代码

**Dependencies:** Unit 1

**Files:**
- Create: `packages/minimax-core/package.json`
- Create: `packages/minimax-core/tsconfig.json`
- Create: `packages/minimax-core/src/types.ts` — 迁移所有 API 类型（`ModelRemain`, `UsageResponse`, `CreateTaskResponse`, `QueryTaskResponse`, `FileRetrieveResponse`, `ImageGenerationResponse`, `AnalysisResponse`, `SubjectReference`, `TTSOptions` 等）
- Create: `packages/minimax-core/src/errors.ts` — 迁移所有错误类（`MinimaxError`, `MinimaxAuthError`, `MinimaxRequestError`）
- Create: `packages/minimax-core/src/api.ts` — 迁移 `getConfig()` 和 `makeRequest()`
- Create: `packages/minimax-core/src/index.ts` — 统一导出

**Approach:**
- types.ts: 所有 `base_resp` 结构统一为一个 `BaseResp` 类型，所有响应类型组合使用
- errors.ts: 三个错误类完整迁移，错误消息格式不变
- api.ts: `getConfig()` 和 `makeRequest()` 从 analyze.ts 迁移（更完整），search.ts 引用同一份
- 各 skill 特有工具函数（如 `extractMp3FromTar`）保留在原脚本

**Patterns to follow:**
- 参考 analyze.ts 的 `makeRequest()` 实现（最完整，有 status_code 错误码分支处理）
- 参考 tts.ts 的 `extractMp3FromTar`（留在原脚本，不迁移）

**Test scenarios:**
- `bun build packages/minimax-core/src/index.ts` 无错误
- 类型导出完整

**Verification:**
- `cd packages/minimax-core && bun run src/index.ts` 不报错
- 所有类型可被正确导入

---

- [ ] **Unit 3: 更新 minimax-search 脚本**

**Goal:** 移除重复代码，改为 import from minimax-core

**Dependencies:** Unit 2

**Files:**
- Modify: `skills/minimax-search/scripts/package.json` — 添加依赖 `"minimax-core": "file:../../../../packages/minimax-core"`
- Modify: `skills/minimax-search/scripts/search.ts` — 删除 `MinimaxAuthError`, `MinimaxRequestError`, `getConfig()`, `makeRequest()`，改为 import

**Approach:**
- 保留脚本特有的 `webSearch()` 函数
- 保留 `showHelp()` 和 `main()`
- import 语句: `import { MinimaxRequestError, MinimaxAuthError, getConfig, makeRequest } from "minimax-core"`

**Verification:**
- `bun run skills/minimax-search/scripts/search.ts -h` 正常输出帮助
- 功能逻辑不变

---

- [ ] **Unit 4: 更新 minimax-image-analysis 脚本**

**Goal:** 移除重复代码，改为 import from minimax-core

**Dependencies:** Unit 2

**Files:**
- Create: `skills/minimax-image-analysis/scripts/package.json`
- Modify: `skills/minimax-image-analysis/scripts/analyze.ts` — import from minimax-core，删除重复的 `MinimaxAuthError`, `MinimaxRequestError`, `getConfig()`, `makeRequest()`, `AnalysisResponse`

**Approach:**
- 保留 `processImageUrl()`, `analyzeImage()`, `DEFAULT_PROMPT`
- 保留 `showHelp()` 和 `main()`
- `AnalysisResponse` 类型从 minimax-core 导入

**Verification:**
- `bun run skills/minimax-image-analysis/scripts/analyze.ts -h` 正常

---

- [ ] **Unit 5: 更新 minimax-image 脚本**

**Goal:** 移除重复代码，改为 import from minimax-core

**Dependencies:** Unit 2

**Files:**
- Create: `skills/minimax-image/scripts/package.json`
- Modify: `skills/minimax-image/scripts/generate.ts` — import from minimax-core，删除 `MinimaxError`, `SubjectReference`, `GenerateImageOptions`, `ImageGenerationResponse`

**Approach:**
- 保留 `generateImage()`, `showHelp()`, `parseArgs()`, `main()`
- `MinimaxError` 从 minimax-core 导入

**Verification:**
- `bun run skills/minimax-image/scripts/generate.ts -h` 正常

---

- [ ] **Unit 6: 更新 minimax-speech 脚本**

**Goal:** 移除重复代码，改为 import from minimax-core

**Dependencies:** Unit 2

**Files:**
- Create: `skills/minimax-speech/scripts/package.json`
- Modify: `skills/minimax-speech/scripts/tts.ts` — import from minimax-core，删除 `MinimaxError`, `TTSOptions`, `CreateTaskResponse`, `QueryTaskResponse`, `FileRetrieveResponse`

**Approach:**
- 保留所有业务逻辑：tar 解析、同步/异步合成、轮询下载
- 保留 `extractMp3FromTar()`（纯 TS 实现，skill 特有）
- 保留 `parseArgs()`, `showHelp()`, `main()`

**Verification:**
- `bun run skills/minimax-speech/scripts/tts.ts -h` 正常

---

- [ ] **Unit 7: 更新 minimax-usage 脚本**

**Goal:** 移除重复代码，改为 import from minimax-core

**Dependencies:** Unit 2

**Files:**
- Create: `skills/minimax-usage/scripts/package.json`
- Modify: `skills/minimax-usage/scripts/query.ts` — import from minimax-core，删除 `MinimaxError`, `ModelRemain`, `UsageResponse`

**Approach:**
- 保留所有业务逻辑：fetch 用量 API、格式化输出
- 保留 `formatDate()`, `formatDuration()`, `queryUsage()`, `showHelp()`, `main()`

**Verification:**
- `bun run skills/minimax-usage/scripts/query.ts -h` 正常

---

- [ ] **Unit 8: 验证与清理**

**Goal:** 确保所有脚本正常运行，清理遗留文件

**Dependencies:** Unit 3-7

**Files:**
- Delete: `skills/minimax-speech/scripts/voices.ts` (如不再需要，检查是否有独立用途)
- Delete: 根目录遗留的 `tsconfig.json`, `biome.json`（如无其他用途）

**Verification:**
- 所有 skill 脚本 `-h` 正常
- LSP 不再报重复定义错误
- `bun run skills/*/scripts/*.ts -h` 全部正常

---

## System-Wide Impact

- **运行方式**: 脚本现在需要 `cd skills/xxx/scripts && bun run xxx.ts` 或通过 workspace 方式
- **环境变量**: 不变（`MINIMAX_API_KEY`, `MINIMAX_API_HOST`）
- **编辑体验**: LSP 不再报重复定义错误

## Risks & Mitigation

| 风险 | 缓解 |
|------|------|
| `file:` 路径依赖脆弱 | 使用相对于 scripts 的正确相对路径 `../../../../packages/minimax-core` |
| skills 分散导致 core 修改难以追踪 | core 包版本管理，后续可升级为 npm 包发布 |
| voices.ts 可能被删除但仍有参考价值 | 先检查其用途再决定是否删除 |

## Deferred to Implementation

- voices.ts 是否保留（查询音色列表工具，可能独立有用）
- 是否需要 `bun.lock` 在根目录和 core 包都生成
