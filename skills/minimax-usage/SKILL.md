---
name: minimax-usage
description: 当用户询问"还剩多少额度"、"查看用量"、"检查配额"、"账户余额"，或需要查询 MiniMax API 账户余额和用量配额时触发。
allowed-tools: Bash(curl:*) Bash(jq:*)
model: haiku
---

# MiniMax Usage Query

查询 MiniMax API 账户的剩余配额和用量统计，支持查看每个模型的使用情况。

## Quick Reference

| 任务 | 命令 |
|------|------|
| 查询账户余额/用量 | `bash scripts/query.sh` |
| 检查环境变量 | `echo $MINIMAX_API_KEY` |

## 前置要求

**必需：设置 MiniMax API Key**

```bash
export MINIMAX_API_KEY="your-api-key-here"
```

> ⚠️ **注意**: 如果不设置此环境变量，脚本将报错退出。

## 使用方式

### 进入 skill 目录执行

```bash
cd /path/to/minimax-usage
bash scripts/query.sh
```

### 输出示例

```
================================
    Minimax Account Usage
================================

Model: abab6.5s-chat
--------------------------------
  Period:         2024-03-01 00:00 to 2024-03-31 23:59
  Quota:          10000 requests
  Used:           2345 requests (23.5%)
  Remaining:      7655 requests
  Resets In:      5d 12h 30m

================================
Query Time: 2024-03-25 14:30:00
================================
```

## 常见场景

### 执行大批量任务前检查余额

```bash
# 在批量生成图片/语音前，先检查额度
bash scripts/query.sh
```

### 定期监控配额使用

```bash
# 添加到 crontab 定期提醒
0 9 * * * /path/to/minimax-usage/scripts/query.sh >> /var/log/minimax-usage.log
```

### 排查 API 调用失败

```bash
# 如果 API 返回 429 或 403，先检查是否超额
bash scripts/query.sh
```

## ❌ WRONG / ✅ CORRECT

### ❌ WRONG - 直接 curl 而不检查环境变量

```bash
# 不要直接写 curl，没有错误处理
curl -H "Authorization: Bearer $MINIMAX_API_KEY" \
  https://www.minimaxi.com/v1/api/openplatform/coding_plan/remains
```

### ✅ CORRECT - 使用提供的脚本

```bash
# 脚本会自动检查环境变量并提供友好的错误提示
bash scripts/query.sh
```

### ❌ WRONG - 不使用环境变量

```bash
# 不要在命令中直接写 API key
bash scripts/query.sh --key "sk-xxx"
```

### ✅ CORRECT - 使用环境变量

```bash
# 先设置环境变量，再执行脚本
export MINIMAX_API_KEY="your-api-key"
bash scripts/query.sh
```

## 错误处理

### 常见错误及解决方案

| 错误信息 | 原因 | 解决方案 |
|----------|------|----------|
| `Error: MINIMAX_API_KEY environment variable is not set` | 未设置 API Key | 执行 `export MINIMAX_API_KEY="your-key"` |
| `Error: Failed to connect to Minimax API` | 网络连接失败 | 检查网络连接，确认能否访问 minimaxi.com |
| `Error: Authentication failed` | API Key 无效 | 检查 API Key 是否正确，是否已过期 |
| `Error: Rate limit exceeded` | 请求过于频繁 | 稍后再试，或检查当前用量 |

### API 返回的错误码

| status_code | 含义 | 处理建议 |
|-------------|------|----------|
| 0 | 成功 | - |
| 1004 | 认证失败 | 检查 MINIMAX_API_KEY 是否有效 |
| 2038 | 需要实名认证 | 在 MiniMax 平台完成实名认证 |
| 429 | 请求频率过高 | 降低请求频率，稍后再试 |

## 输出字段说明

| 字段 | 说明 |
|------|------|
| `Model` | 模型名称（如 abab6.5s-chat） |
| `Period` | 计费周期起止时间 |
| `Quota` | 当前周期总配额 |
| `Used` | 已使用次数及百分比 |
| `Remaining` | 剩余可用次数 |
| `Resets In` | 配额重置倒计时 |

## 注意事项

1. **额度周期**：MiniMax 配额按自然月重置，非购买日起算
2. **多模型配额**：不同模型可能有独立的配额限制
3. **缓存延迟**：API 返回的数据可能有短暂延迟（通常 < 5 分钟）
