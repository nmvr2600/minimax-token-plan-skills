# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

MiniMax AI 技能插件，为 Claude Code 提供 MiniMax 相关能力（语音合成、文生图、联网搜索、图片分析、用量查询）。

## 开发环境

- **运行时**: Bun >= 1.0.0
- **语言**: TypeScript
- **包管理**: bun

## 环境变量

- `MINIMAX_API_KEY` (必需): MiniMax API Key
- `MINIMAX_API_HOST` (可选): API 主机地址，默认因 API 而异

## 运行脚本

```bash
# 首次安装依赖
bun install

# 图像生成
bun run skills/minimax-image/scripts/generate.ts "prompt"

# 图片分析
bun run skills/minimax-image-analysis/scripts/analyze.ts "image.jpg" [prompt]

# 联网搜索
bun run skills/minimax-search/scripts/search.ts "query"

# 语音合成
bun run skills/minimax-speech/scripts/tts.ts "文本" --output output.mp3

# 用量查询
bun run skills/minimax-usage/scripts/query.ts

# 或使用快捷命令
bun run image "a cute cat"
bun run search "weather today"
bun run usage
```

## 注意事项

- 图像生成最大 9 张/请求
- TTS 文本限制 < 100,000 字符
- 图片分析输入 < 10MB，支持 JPEG/PNG/WebP
- 使用 MiniMax API 需要实名认证（错误码 2038 表示未实名）
