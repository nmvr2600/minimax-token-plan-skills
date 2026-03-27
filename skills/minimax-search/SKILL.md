---
name: minimax-search
description: |
  使用 MiniMax 联网搜索 API 进行网页搜索。当用户需要搜索网络信息、
  查找最新资料、查询实时信息、或说"搜索一下"、"查一下"、"联网搜索"、
  "web search"、"search for"时触发。此 skill 无需第三方依赖，使用 Python
  标准库即可运行。
---

# MiniMax Web Search

MiniMax 联网搜索 API，基于 MiniMax 联网搜索能力获取网络信息。无需第三方依赖，纯 Python 标准库实现。

## Quick Reference

| 任务 | 命令 | 输出格式 |
|------|------|----------|
| 基础搜索 | `python scripts/standalone_search.py "关键词"` | JSON |
| 在代码中使用 | `web_search(api_key, api_host, "关键词")` | Python dict |
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
python3 scripts/standalone_search.py "Python 教程"

# 搜索最新新闻
python3 scripts/standalone_search.py "2024年 AI 发展趋势"

# 搜索技术文档
python3 scripts/standalone_search.py "Docker 安装指南"
```

### 方式二：Python 函数调用

```python
import sys
sys.path.insert(0, 'scripts')
from standalone_search import web_search, get_config

# 获取配置
api_key, api_host = get_config()

# 执行搜索
result = web_search(api_key, api_host, "Claude AI 使用指南")

# 处理结果
for item in result["organic"]:
    print(f"{item['title']}: {item['link']}")
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
python3 scripts/standalone_search.py "FastAPI 教程"
```

### 查询最新信息

```bash
python3 scripts/standalone_search.py "2024年最新 AI 模型"
```

### 在代码中集成搜索

```python
from standalone_search import web_search, get_config, MinimaxAuthError, MinimaxRequestError

# 获取配置
api_key, api_host = get_config()

# 搜索并处理结果
try:
    result = web_search(api_key, api_host, "Python 最佳实践")

    # 提取前 3 个结果
    top_results = result["organic"][:3]
    for i, item in enumerate(top_results, 1):
        print(f"{i}. {item['title']}")
        print(f"   {item['snippet'][:100]}...")
        print(f"   {item['link']}")

except MinimaxAuthError:
    print("认证失败，请检查 MINIMAX_API_KEY")
except MinimaxRequestError as e:
    print(f"请求错误: {e}")
```

## ❌ WRONG / ✅ CORRECT

### ❌ WRONG - 不处理错误

```python
# 不处理可能的异常
result = web_search(api_key, api_host, "query")
print(result["organic"])  # 如果出错，这里会崩溃
```

### ✅ CORRECT - 正确处理异常

```python
# 使用 try-except 处理可能的错误
from standalone_search import MinimaxAuthError, MinimaxRequestError

try:
    result = web_search(api_key, api_host, "query")
    print(result["organic"])
except MinimaxAuthError:
    print("认证失败，请检查 API Key")
except MinimaxRequestError as e:
    print(f"请求失败: {e}")
```

### ❌ WRONG - 不检查环境变量

```python
# 直接使用，不检查是否设置
api_key = os.getenv("MINIMAX_API_KEY")
result = web_search(api_key, api_host, "query")
```

### ✅ CORRECT - 使用 get_config() 检查配置

```python
# 使用内置函数获取配置，会自动检查
from standalone_search import get_config

try:
    api_key, api_host = get_config()  # 会自动检查并抛出异常
    result = web_search(api_key, api_host, "query")
except MinimaxRequestError as e:
    print(f"配置错误: {e}")
```

### ❌ WRONG - 安装不必要的依赖

```bash
# 不需要安装 requests，脚本使用标准库
pip install requests  # 多余的操作
```

### ✅ CORRECT - 直接使用，无需安装

```bash
# 脚本使用 urllib，无需第三方依赖
python3 scripts/standalone_search.py "搜索词"
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

```python
from standalone_search import (
    web_search,
    get_config,
    MinimaxAuthError,
    MinimaxRequestError
)

try:
    api_key, api_host = get_config()
    result = web_search(api_key, api_host, "搜索词")

    # 处理结果
    for item in result.get("organic", []):
        print(f"- {item['title']}")

except MinimaxAuthError:
    print("✗ 认证失败")
    print("  请检查 MINIMAX_API_KEY 环境变量是否正确设置")
    print("  export MINIMAX_API_KEY=\"your-key\"")

except MinimaxRequestError as e:
    print(f"✗ 请求错误: {e}")
    print("  请检查网络连接或稍后重试")

except Exception as e:
    print(f"✗ 未知错误: {e}")
```

## 脚本使用帮助

```bash
python3 scripts/standalone_search.py --help
```

输出：
```
用法: standalone_search.py <搜索关键词>

环境变量:
    MINIMAX_API_KEY  - 必需，MiniMax API 密钥
    MINIMAX_API_HOST - 可选，API 主机地址（默认: https://api.minimaxi.com）

示例:
    export MINIMAX_API_KEY="your-key"
    python3 standalone_search.py "Python 教程"
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
