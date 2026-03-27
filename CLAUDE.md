# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

MiniMax AI 技能插件，为 Claude Code 提供 MiniMax 相关能力（语音合成、文生图、联网搜索、图片分析、用量查询）。

## 开发环境

- **Python**: 3.x (`#!/usr/bin/env python3`)
- **Formatter**: ruff

## 代码格式化

编辑 Python 文件后自动格式化：`ruff format`

## 环境变量

- `MINIMAX_API_KEY` (必需): MiniMax API Key
- `MINIMAX_API_HOST` (可选): API 主机地址，默认因 API 而异

## 运行脚本

```bash
# 图像生成
python scripts/generate_image.py "prompt"

# 图片分析
python scripts/image_analysis.py "image.jpg" [prompt]

# 联网搜索
python scripts/standalone_search.py "query"

# 用量查询
bash scripts/query.sh
```

## 注意事项

- 图像生成最大 9 张/请求
- TTS 文本限制 < 100,000 字符
- 图片分析输入 < 10MB，支持 JPEG/PNG/WebP
- 使用 MiniMax API 需要实名认证（错误码 2038 表示未实名）
