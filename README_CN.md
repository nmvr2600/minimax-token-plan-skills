# MiniMax Skills for Claude Code

[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blue)](https://claude.ai/code)
[![MiniMax](https://img.shields.io/badge/MiniMax-API-green)](https://www.minimaxi.com)

为 Claude Code 开发的 MiniMax Token Plan 技能插件集合。通过自然语言命令，你可以生成图片、合成语音、搜索网络、分析图片，以及监控 Token 用量。

> **注意：** 使用这些技能需要有效的 MiniMax Token Plan 订阅。

## 功能特性

| 技能 | 说明 | 触发词示例 |
|------|-------------|-----------------|
| `minimax-image` | 文生图 / 图生图 | "生成图片"、"画一张图"、"create an image" |
| `minimax-speech` | 语音合成 TTS | "转成语音"、"生成音频"、"读这段文字" |
| `minimax-search` | 联网搜索 | "搜索一下"、"查找"、"search for" |
| `minimax-image-analysis` | 图片分析 / OCR | "分析图片"、"提取图中文字"、"describe this image" |
| `minimax-usage` | Token 用量查询 | "查看用量"、"Token 余额"、"check usage" |

## 前置要求

- Python 3.x
- MiniMax Token Plan 订阅及 API Key ([在此获取](https://www.minimaxi.com))

## 安装方式

### 全局安装（所有项目可用）

```bash
ln -s /Users/meng/workspace/minimax-skills ~/.claude/skills/minimax-skills
```

### 项目级安装（仅当前项目）

```bash
ln -s /Users/meng/workspace/minimax-skills /你的项目路径/.claude/skills/minimax-skills
```

## 配置说明

将 MiniMax Token Plan API Key 设置为环境变量：

```bash
export MINIMAX_API_KEY="your-api-key-here"
```

### 可选：自定义 API 域名

如需使用 MiniMax 国际站或自定义域名：

```bash
export MINIMAX_API_HOST="https://api.minimaxi.com"  # 默认
# 或
export MINIMAX_API_HOST="https://api.minimax.chat"  # 备用
```

## 使用方法

安装完成后，在 Claude Code 中直接使用自然语言：

### 图片生成
```
"画一张赛博朋克风格的夜景城市图"
"Generate an image of a cat flying through space"
```

### 语音合成
```
"把这段文字转成语音"
"Convert this paragraph to speech"
```

### 联网搜索
```
"搜索一下最新的 AI 发展"
"Look up information about quantum computing"
```

### 图片分析
```
"分析这张图片里有什么"
"Extract the text from this screenshot"
```

### 用量查询
```
"查看我的 MiniMax Token Plan 用量"
"How much quota do I have left?"
```

## 项目结构

```
minimax-skills/
├── skills/
│   ├── minimax-image/           # 图片生成技能
│   │   ├── scripts/
│   │   │   └── generate_image.py
│   │   └── SKILL.md
│   ├── minimax-speech/          # 语音合成技能
│   │   ├── scripts/
│   │   └── SKILL.md
│   ├── minimax-search/          # 联网搜索技能
│   │   ├── scripts/
│   │   │   └── standalone_search.py
│   │   └── SKILL.md
│   ├── minimax-image-analysis/  # 图片分析技能
│   │   ├── scripts/
│   │   │   └── image_analysis.py
│   │   └── SKILL.md
│   └── minimax-usage/           # 用量查询技能
│       ├── scripts/
│       │   └── query.sh
│       └── SKILL.md
├── README.md                    # English Documentation
└── README_CN.md                 # 中文文档（本文档）
```

## 技能详情

### minimax-image（图片生成）

根据文字描述生成高质量图片。

**特性：**
- 文生图，支持多种宽高比（1:1、16:9、9:16 等）
- 图生图，保持人物/物体一致性
- 批量生成（每次最多 9 张）
- 自定义文件名前缀，避免覆盖

**示例：**
```bash
python skills/minimax-image/scripts/generate_image.py \
  "a serene mountain landscape at sunrise" \
  --aspect-ratio 16:9 \
  --prefix "mountain_sunrise_landscape"
```

**文件名规则：**
- 单张生成：`{prefix}.jpeg`
- 批量生成：`{prefix}_0.jpeg`, `{prefix}_1.jpeg`...

### minimax-speech（语音合成）

使用 MiniMax 异步 TTS API 将文字转为自然语音。

**特性：**
- 多种音色可选
- 高清音质输出
- 支持长文本（自动分批处理）

### minimax-search（联网搜索）

搜索网络获取实时信息。

**特性：**
- 自然语言查询
- 结构化搜索结果
- 集成 MiniMax 搜索 API

### minimax-image-analysis（图片分析）

分析图片并提取信息。

**特性：**
- 图片描述与理解
- OCR 文字提取
- 视觉内容分析

### minimax-usage（Token 用量查询）

监控 MiniMax Token Plan 的 Token 用量和配额。

**特性：**
- 查看各模型剩余 Token 配额
- Token 消耗统计
- 追踪计费周期

## 开发指南

### 代码格式化

本项目使用 `ruff` 进行 Python 代码格式化：

```bash
ruff format skills/
```

### 添加新技能

1. 在 `skills/` 目录下创建新文件夹
2. 添加 `SKILL.md` 文件，包含技能元数据和文档
3. 在 `scripts/` 目录下添加可执行脚本
4. 更新本 README 文档

## 常见问题

### MINIMAX_API_KEY not set

请确保已导出 API Key：
```bash
export MINIMAX_API_KEY="your-api-key-here"
```

### 需要实名认证（错误码 2038）

MiniMax Token Plan 需要实名认证。请在 MiniMax 账户后台完成实名认证。

### 运行脚本时权限不足

为脚本添加执行权限：
```bash
chmod +x skills/*/scripts/*.py skills/*/scripts/*.sh
```

## 文档

- [English Documentation](README.md)
- [中文文档](README_CN.md)（本文档）

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 贡献

欢迎贡献！请随时提交 Issue 或 Pull Request。

## 致谢

- 由 [MiniMax Token Plan](https://www.minimaxi.com) 提供支持
- 专为 [Claude Code](https://claude.ai/code) 构建
