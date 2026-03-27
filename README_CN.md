# MiniMax Token Plan Skills

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

- [Bun](https://bun.sh) >= 1.0.0
- MiniMax Token Plan 订阅及 API Key ([在此获取](https://www.minimaxi.com))

## 安装方式

### 全局安装（所有项目可用）

```bash
ln -s /Users/meng/workspace/minimax-token-plan-skills ~/.claude/skills/minimax-token-plan-skills
```

### 项目级安装（仅当前项目）

```bash
ln -s /Users/meng/workspace/minimax-token-plan-skills /你的项目路径/.claude/skills/minimax-token-plan-skills
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

## 使用示例

安装完成后，你可以通过两种方式使用这些技能：

1. **自然语言** - 直接在 Claude Code 中描述你想要什么
2. **斜杠命令** - 使用 `/skill-name` 直接调用

> **注意：** 直接运行脚本（`bun run skills/...`）也支持，但主要供 Claude Code 内部使用。

### 图片生成（minimax-image）

根据文字描述生成高质量图片。

**自然语言：**
```
"画一张赛博朋克风格的夜景城市图"
"生成一张太空飞猫的图片"
```

**斜杠命令：**
```
/minimax-image "未来城市天际线，赛博朋克风格，霓虹灯" --aspect-ratio 16:9
```

**参数：**
- `--aspect-ratio` 或 `-r`：宽高比（1:1、16:9、9:16、4:3、3:4、3:2、2:3、21:9）
- `--n`：生成数量（1-9）
- `--output-dir` 或 `-o`：输出目录
- `--prefix` 或 `-p`：文件名前缀

**支持的宽高比：** `1:1`、`16:9`、`9:16`、`4:3`、`3:4`、`3:2`、`2:3`、`21:9`

**示例输出：**

| 提示词 | 输出 |
|--------|------|
| "a cat flying through space, comic style" | ![太空飞猫](samples/cat_flying_space_comic.jpeg) |
| "cute cat poses, multiple angles" | ![可爱猫咪](samples/cute_cat_poses_0.jpeg) |
| "牧童遥指杏花村，中国传统水墨画风格" | ![水墨画](samples/herdsman_pointing_xinghua_village_ink_wash.jpeg) |

### 语音合成（minimax-speech）

使用 MiniMax 异步 TTS API 将文字转为自然语音。

**自然语言：**
```
"把这段文字转成语音"
"用温柔的女声读这段文字"
```

**斜杠命令：**
```
/minimax-speech "第一章：故事的开始" --voice female-yujie --output story_chapter_1.mp3
```

**参数：**
- `--voice` 或 `-v`：音色ID（female-tianmei、female-yujie、male-qn-qingse 等）
- `--speed` 或 `-s`：语速 0.5-2.0
- `--vol`：音量 0-10
- `--pitch` 或 `-p`：音调 0.5-2.0
- `--output` 或 `-o`：输出文件名

**可用音色：**
- `female-tianmei` - 甜美女声（默认）
- `female-yujie` - 御姐音，适合讲故事
- `female-shaonv` - 少女音
- `male-qn-qingse` - 青年男声
- `male-jieshuo` - 解说男声
- `Chinese (Mandarin)_News_Anchor` - 新闻主播风格
- `Chinese (Mandarin)_Gentleman` - 绅士风格

**示例输出：**
- [TTS 示例音频](samples/tts_output.mp3)

**特性：**
- 327 种音色可选
- 可调节语速（0.5-2.0）、音量（0-10）、音调（0.5-2.0）
- 支持长文本（最多 10 万字符）
- 高清音质输出

### 联网搜索（minimax-search）

搜索网络获取实时信息。

**自然语言：**
```
"搜索一下最新的 AI 发展"
"查找量子计算相关资料"
```

**斜杠命令：**
```
/minimax-search "Python 最佳实践 2024"
```

**输出格式：**
```json
{
  "organic": [
    {
      "title": "搜索结果标题",
      "link": "https://example.com",
      "snippet": "结果摘要...",
      "date": "2024-03-15"
    }
  ],
  "related_searches": [
    {"query": "相关搜索词"}
  ]
}
```

### 图片分析（minimax-image-analysis）

分析图片并提取信息，包括 OCR 文字识别。

**自然语言：**
```
"分析这张图片里有什么"
"提取这张截图中的文字"
"这个图表展示了什么数据？"
```

**斜杠命令：**
```
/minimax-image-analysis "截图.png" "描述这个界面的功能"
/minimax-image-analysis "https://example.com/image.jpg"
```

**参数：**
- 第一个参数：图片路径或 URL
- 第二个参数（可选）：自定义分析提示词

**支持的格式：** JPEG、PNG、WebP（最大 10MB）

### 用量查询（minimax-usage）

监控 MiniMax Token Plan 的用量和配额。

**自然语言：**
```
"查看我的 MiniMax Token Plan 用量"
"还剩多少额度？"
```

**斜杠命令：**
```
/minimax-usage
```

**示例输出：**
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

## 常见问题

### MINIMAX_API_KEY not set

请确保已导出 API Key：
```bash
export MINIMAX_API_KEY="your-api-key-here"
```

### 需要实名认证（错误码 2038）

MiniMax Token Plan 需要实名认证。请在 MiniMax 账户后台完成实名认证。

### 未找到 Bun

请先安装 Bun：
```bash
curl -fsSL https://bun.sh/install | bash
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
