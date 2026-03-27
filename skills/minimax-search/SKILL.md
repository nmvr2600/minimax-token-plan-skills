---
name: minimax-search
description: 当用户需要搜索网络信息、查找最新资料、查询实时信息、或说"搜索一下"、"查一下"、"联网搜索"、"web search"、"search for"时触发。
---

# MiniMax Web Search

MiniMax 联网搜索 API，基于 MiniMax 联网搜索能力获取网络信息。使用 Bun + TypeScript 实现，跨平台兼容。

## Quick Reference

| 任务 | 命令 | 输出格式 |
|------|------|----------|
| 基础搜索 | `bun run scripts/search.ts "关键词"` | JSON |
| 在代码中使用 | `web_search(api_key, api_host, "关键词")` | Object |
| 格式化展示 | `search_and_display("关键词")` | 人类可读文本 |

## 前置要求

**必需环境变量：**

```bash
export MINIMAX_API_KEY="your_api_key_here"
```

**可选环境变量：**

```bash
export MINIMAX_API_HOST="https://api.minimaxi.com"  # 默认，可不设置
```

## 使用方式

### 方式一：命令行脚本（推荐）

```bash
# 基础搜索
bun run skills/minimax-search/scripts/search.ts "Python 教程"

# 或使用快捷命令
bun run search "Python 教程"

# 搜索最新新闻
bun run skills/minimax-search/scripts/search.ts "2024年 AI 发展趋势"

# 搜索技术文档
bun run skills/minimax-search/scripts/search.ts "Docker 安装指南"
```

### 方式二：TypeScript 函数调用

```typescript
import { webSearch, getConfig } from "./scripts/search";

// 获取配置
const { apiKey, apiHost } = getConfig();

// 执行搜索
const result = await webSearch(apiKey, apiHost, "Claude AI 使用指南");

// 处理结果
for (const item of result.organic || []) {
    console.log(`${item.title}: ${item.link}`);
}
```

### 方式三：直接 HTTP 请求

```bash
curl -X POST "https://api.minimaxi.chat/v1/coding_plan/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MINIMAX_API_KEY" \
  -d '{"q": "搜索关键词"}'
```

## API 规范

### Endpoint

```
POST https://api.minimaxi.com/v1/coding_plan/search
```

### Request 参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `q` | string | 是 | 搜索关键词 |

### Response 结构

```json
{
  "organic": [
    {
      "title": "搜索结果标题",
      "link": "URL链接",
      "snippet": "摘要",
      "date": "日期"
    }
  ],
  "related_searches": [
    {"query": "相关搜索词"}
  ],
  "base_resp": {
    "status_code": 0,
    "status_msg": "success"
  }
}
```

### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `organic` | array | 搜索结果列表 |
| `organic[].title` | string | 结果标题 |
| `organic[].link` | string | 结果链接 |
| `organic[].snippet` | string | 结果摘要 |
| `organic[].date` | string | 结果日期（可能为空） |
| `related_searches` | array | 相关搜索推荐 |
| `base_resp.status_code` | int | 状态码，0 表示成功 |
| `base_resp.status_msg` | string | 状态消息 |

## 常见场景

### 搜索技术文档

```bash
bun run scripts/search.ts "FastAPI 教程"
```

### 查询最新信息

```bash
bun run scripts/search.ts "2024年最新 AI 模型"
```

### 在代码中集成搜索

```typescript
import { webSearch, getConfig, MinimaxAuthError, MinimaxRequestError } from "./scripts/search";

// 获取配置
const { apiKey, apiHost } = getConfig();

// 搜索并处理结果
try {
    const result = await webSearch(apiKey, apiHost, "Python 最佳实践");

    // 提取前 3 个结果
    const topResults = (result.organic || []).slice(0, 3);
    for (let i = 0; i < topResults.length; i++) {
        const item = topResults[i];
        console.log(`${i + 1}. ${item.title}`);
        console.log(`   ${item.snippet?.substring(0, 100)}...`);
        console.log(`   ${item.link}`);
    }
} catch (error) {
    if (error instanceof MinimaxAuthError) {
        console.log("认证失败，请检查 MINIMAX_API_KEY");
    } else if (error instanceof MinimaxRequestError) {
        console.log(`请求错误: ${error.message}`);
    }
}
```

## ❌ WRONG / ✅ CORRECT

### ❌ WRONG - 不处理错误

```typescript
// 不处理可能的异常
const result = await webSearch(apiKey, apiHost, "query");
console.log(result.organic);  // 如果出错，这里会崩溃
```

### ✅ CORRECT - 正确处理异常

```typescript
// 使用 try-catch 处理可能的错误
import { MinimaxAuthError, MinimaxRequestError } from "./scripts/search";

try {
    const result = await webSearch(apiKey, apiHost, "query");
    console.log(result.organic);
} catch (error) {
    if (error instanceof MinimaxAuthError) {
        console.log("认证失败，请检查 API Key");
    } else if (error instanceof MinimaxRequestError) {
        console.log(`请求失败: ${error.message}`);
    }
}
```

### ❌ WRONG - 不检查环境变量

```typescript
// 直接使用，不检查是否设置
const apiKey = process.env.MINIMAX_API_KEY;
const result = await webSearch(apiKey, apiHost, "query");
```

### ✅ CORRECT - 使用 getConfig() 检查配置

```typescript
// 使用内置函数获取配置，会自动检查
import { getConfig } from "./scripts/search";

try {
    const { apiKey, apiHost } = getConfig();  // 会自动检查并抛出异常
    const result = await webSearch(apiKey, apiHost, "query");
} catch (error) {
    console.log(`配置错误: ${(error as Error).message}`);
}
```

### ❌ WRONG - 未安装依赖

```bash
# 需要先安装依赖
bun run scripts/search.ts "搜索词"  # 会报错
```

### ✅ CORRECT - 先安装依赖

```bash
# 首次使用前安装依赖
bun install
bun run scripts/search.ts "搜索词"
```

## 错误处理

### 异常类说明

| 异常类 | 说明 | 触发场景 |
|--------|------|----------|
| `MinimaxAuthError` | 认证错误 | API Key 无效或过期 |
| `MinimaxRequestError` | 请求错误 | 网络问题、API 错误、参数错误 |

### API 错误码

| status_code | 说明 | 解决方案 |
|-------------|------|----------|
| 0 | 成功 | - |
| 1004 | 认证失败 | 检查 MINIMAX_API_KEY 是否正确 |
| 2038 | 需实名认证 | 在 MiniMax 平台完成实名认证 |
| 其他 | API 错误 | 查看 status_msg 获取详细信息 |

### 在代码中处理错误

```typescript
import {
    webSearch,
    getConfig,
    MinimaxAuthError,
    MinimaxRequestError
} from "./scripts/search";

try {
    const { apiKey, apiHost } = getConfig();
    const result = await webSearch(apiKey, apiHost, "搜索词");

    // 处理结果
    for (const item of result.organic || []) {
        console.log(`- ${item.title}`);
    }
} catch (error) {
    if (error instanceof MinimaxAuthError) {
        console.log("✗ 认证失败");
        console.log("  请检查 MINIMAX_API_KEY 环境变量是否正确设置");
        console.log("  export MINIMAX_API_KEY=\"your-key\"");
    } else if (error instanceof MinimaxRequestError) {
        console.log(`✗ 请求错误: ${error.message}`);
        console.log("  请检查网络连接或稍后重试");
    } else {
        console.log(`✗ 未知错误: ${(error as Error).message}`);
    }
}
```

## 脚本使用帮助

```bash
bun run scripts/search.ts -- --help
```

输出：
```
用法: search.ts <搜索关键词>

环境变量:
    MINIMAX_API_KEY  - 必需，MiniMax API 密钥
    MINIMAX_API_HOST - 可选，API 主机地址（默认: https://api.minimaxi.com）

示例:
    export MINIMAX_API_KEY="your-key"
    bun run scripts/search.ts "Python 教程"
```

## 最佳实践

1. **始终处理异常** - API 可能返回错误或网络问题
2. **使用 get_config()** - 自动检查环境变量
3. **检查结果存在性** - `organic` 可能为空列表
4. **控制结果数量** - 取前 N 个结果，避免过多数据
5. **检查相关搜索** - `related_searches` 可能提供更好关键词

## 注意事项

- **无需第三方依赖** - 脚本使用 Python 标准库 `urllib`
- **API 调用限制** - 注意 MiniMax 平台的调用频率限制
- **结果数量** - 默认返回约 10 条搜索结果
- **超时时间** - 脚本使用默认超时，网络慢时可能超时
