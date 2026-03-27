---
title: 迁移 Skill 脚本到 Bun + TypeScript
type: refactor
status: active
date: 2026-03-27
---

# 迁移 Skill 脚本到 Bun + TypeScript

## Overview

将所有 MiniMax Skill 脚本从 Python/Shell 统一迁移到 Bun 运行时的 TypeScript 脚本，解决跨平台兼容性问题和简化依赖管理。

## Problem Frame

当前项目使用混合运行时：
- **Shell 脚本** (`query.sh`): 在 Windows 上无法直接运行
- **Python 脚本**: 需要 Python 环境 + pip 安装依赖，对非 Python 开发者不友好
- **依赖分散**: requests 等外部依赖增加了安装复杂度

## Requirements Trace

- R1. 所有脚本使用单一运行时 (Bun)
- R2. 保持原有功能完全一致
- R3. 命令行参数保持不变
- R4. Windows/macOS/Linux 全平台兼容
- R5. 减少外部依赖，优先使用标准库

## Scope Boundaries

- **包含**: 5 个 skill 的脚本迁移
- **不包含**: SKILL.md 的功能描述内容（仅更新命令示例）
- **不包含**: API 逻辑变更

## Context & Research

### 现有脚本清单

| Skill | 当前文件 | 语言 | 功能 |
|-------|----------|------|------|
| minimax-search | `scripts/standalone_search.py` | Python | 联网搜索 |
| minimax-image | `scripts/generate_image.py` | Python | 文生图 |
| minimax-image-analysis | `scripts/image_analysis.py` | Python | 图片分析 |
| minimax-speech | `scripts/text_to_speech.py` | Python | 语音合成 |
| minimax-usage | `scripts/query.sh` | Shell | 用量查询 |

### 技术决策

- **使用 Bun 而非 Node**: Bun 内置 fetch、更好的 TypeScript 支持、更快的启动
- **标准库优先**: Bun 内置 fetch、File I/O，无需额外依赖
- **单文件脚本**: 保持简单，无需打包

### Bun API 映射

| Python 功能 | Bun/TypeScript 替代 |
|-------------|---------------------|
| `requests.post()` | 内置 `fetch()` |
| `argparse` | `process.argv` 或 `parseArgs` |
| `os.getenv()` | `process.env` |
| `base64.b64decode()` | `Buffer.from()` |
| `tarfile` | `node:tar` 或手动解析 |
| `pathlib.Path` | `node:path` |

## Implementation Units

### Unit 1: 项目初始化

**Goal:** 创建 Bun 项目配置和共享类型定义

**Dependencies:** None

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`

**Approach:**
- 初始化 Bun 项目
- 配置 TypeScript 严格模式
- 添加共享的类型定义文件

**Verification:**
- `bun --version` 可正常执行
- TypeScript 编译无错误

---

### Unit 2: 迁移 minimax-search

**Goal:** 将联网搜索脚本转为 TypeScript

**Dependencies:** Unit 1

**Files:**
- Create: `skills/minimax-search/scripts/search.ts`
- Modify: `skills/minimax-search/SKILL.md` (更新命令示例)
- Delete: `skills/minimax-search/scripts/standalone_search.py`

**Approach:**
- 使用 `fetch()` 替代 `urllib.request`
- 使用 `console.error()` 处理错误输出
- 保持 JSON 输出格式一致

**Patterns to follow:**
- 现有的错误处理逻辑（MinimaxAuthError, MinimaxRequestError）
- 环境变量读取方式

**Test scenarios:**
- 正常搜索返回 JSON
- 未设置 API Key 时显示错误
- 网络错误处理

**Verification:**
- `bun run skills/minimax-search/scripts/search.ts "test"` 正常工作

---

### Unit 3: 迁移 minimax-image

**Goal:** 将文生图脚本转为 TypeScript

**Dependencies:** Unit 1

**Files:**
- Create: `skills/minimax-image/scripts/generate.ts`
- Modify: `skills/minimax-image/SKILL.md`
- Delete: `skills/minimax-image/scripts/generate_image.py`

**Approach:**
- base64 解码使用 `Buffer.from(base64, 'base64')`
- 文件写入使用 `Bun.write()`
- 目录创建使用 `node:fs/promises`
- 保持原有文件名生成逻辑

**Test scenarios:**
- 生成单张图片
- 批量生成多张图片
- 指定输出目录
- base64 和 url 格式都支持

**Verification:**
- 生成的图片文件与 Python 版本一致

---

### Unit 4: 迁移 minimax-image-analysis

**Goal:** 将图片分析脚本转为 TypeScript

**Dependencies:** Unit 1

**Files:**
- Create: `skills/minimax-image-analysis/scripts/analyze.ts`
- Modify: `skills/minimax-image-analysis/SKILL.md`
- Delete: `skills/minimax-image-analysis/scripts/image_analysis.py`

**Approach:**
- 图像 URL 下载使用 `fetch()`
- 本地文件读取使用 `Bun.file()`
- base64 编码使用 `Buffer.from().toString('base64')`
- 保持默认提示词完全一致

**Test scenarios:**
- 分析本地图片
- 分析 HTTP URL 图片
- 使用自定义提示词
- 未传提示词时使用默认提示词

**Verification:**
- 输出格式与 Python 版本一致

---

### Unit 5: 迁移 minimax-speech

**Goal:** 将语音合成脚本转为 TypeScript

**Dependencies:** Unit 1

**Files:**
- Create: `skills/minimax-speech/scripts/tts.ts`
- Modify: `skills/minimax-speech/SKILL.md`
- Delete: `skills/minimax-speech/scripts/text_to_speech.py`

**Approach:**
- tar 包解压使用 `node:tar` 或手动解析（Bun 无内置 tar 支持）
- 轮询逻辑使用 `setTimeout` + async/await
- 保持原有参数验证逻辑

**Technical design:**
- tar 解压可考虑使用 `tar` npm 包，或手动解析头部结构
- 若引入 `tar` 包，需在 package.json 中声明

**Test scenarios:**
- 正常文本转语音
- 长文本验证（< 10万字符）
- 任务轮询直到完成
- 自定义音色参数

**Verification:**
- 生成的 MP3 文件可正常播放

---

### Unit 6: 迁移 minimax-usage

**Goal:** 将 Shell 用量查询脚本转为 TypeScript

**Dependencies:** Unit 1

**Files:**
- Create: `skills/minimax-usage/scripts/query.ts`
- Modify: `skills/minimax-usage/SKILL.md`
- Delete: `skills/minimax-usage/scripts/query.sh`

**Approach:**
- 使用 `fetch()` 替代 `curl`
- 日期格式化使用原生 `Date`
- 时间计算保持与 shell 版本一致
- 表格输出格式保持美观对齐

**Test scenarios:**
- 正常查询返回表格格式
- 错误状态码处理
- 日期格式正确显示

**Verification:**
- 输出格式与 shell 版本一致

---

### Unit 7: 统一测试与验证

**Goal:** 验证所有脚本功能完整

**Dependencies:** Unit 2-6

**Files:**
- Create: `scripts/test-all.sh` (测试脚本)

**Approach:**
- 逐个测试每个 skill 脚本
- 验证错误处理
- 验证环境变量检查

**Verification:**
- 所有脚本在无 API Key 时正确报错
- 所有脚本参数解析正确

---

## System-Wide Impact

- **用户文档**: 所有 SKILL.md 的命令示例需要更新
- **CLAUDE.md**: 运行示例需要更新为 `bun run`
- **README.md**: 安装说明需要更新为 Bun 安装

## Risks & Dependencies

| 风险 | 缓解措施 |
|------|----------|
| tar 解压无标准库支持 | 引入 `tar` npm 包或手动实现 |
| Windows 路径分隔符 | 使用 `node:path` 处理 |
| Bun 版本兼容性 | 声明最低 Bun 版本要求 |

## Deferred to Implementation

- 确切的 npm 依赖列表（tar 等）
- 是否需要共享的工具函数模块
- tsconfig 的严格程度细节
