# MiniMax Skills

MiniMax AI 技能插件，为 Claude Code 提供 MiniMax 相关能力。

## Skills

| Skill | 说明 | 触发词 |
|-------|------|--------|
| `minimax-speech` | 语音合成 TTS | "把这段文字转成语音"、"生成音频" |
| `minimax-image` | 文生图/图生图 | "画一张图"、"生成图片" |
| `minimax-search` | 联网搜索 | "搜索一下"、"联网搜索" |
| `minimax-image-analysis` | 图片分析/OCR | "分析图像"、"提取图中文字" |
| `minimax-usage` | 用量查询 | "查看用量"、"账户余额" |

## 安装方式

### 全局安装（所有项目可用）

```bash
ln -s /Users/meng/workspace/minimax-skills ~/.claude/skills/minimax-skills
```

### 项目级安装（仅当前项目可用）

```bash
ln -s /Users/meng/workspace/minimax-skills /your-project/.claude/skills/minimax-skills
```

## 前置要求

设置 MiniMax API Key：

```bash
export MINIMAX_API_KEY="your-api-key-here"
```

## 使用方法

安装后在 Claude Code 中直接说出触发词即可使用对应功能。

例如：
- "帮我画一张赛博朋克风格的城市图片"
- "把这段文字转成语音"
- "搜索一下最新的 AI 新闻"
