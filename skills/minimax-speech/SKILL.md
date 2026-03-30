---
name: minimax-speech
description: 当用户需要将文字转为语音、生成音频文件、语音合成、text to speech、TTS，或说"把这段文字转成语音"、"生成一个音频"、"读一下这段文字"时触发。务必使用此 skill。
---

# MiniMax Speech Synthesis

## Quick Reference

| 任务 | 命令 |
|------|------|
| 短文本语音合成（自动选择同步接口） | `bun run ${CLAUDE_SKILL_DIR}/scripts/tts.ts "文本"` |
| 指定音色 | `--voice female-tianmei` |
| 指定输出文件 | `--output result.mp3` |
| 指定语速 | `--speed 1.2` |
| 长文本（>3000字，自动走异步） | `bun run ${CLAUDE_SKILL_DIR}/scripts/tts.ts "很长很长的文本..."` |
| 查询可用音色 | `bun run ${CLAUDE_SKILL_DIR}/scripts/voices.ts [--type system\|all]` |

## 前置要求

- `MINIMAX_API_KEY`: MiniMax API Key（必需）
- `MINIMAX_API_HOST`: API 地址（可选，默认 `https://api.minimaxi.com`）

MiniMax 语音合成 API，支持将文本转换为高质量语音音频。**自动选择模式**：
- 短文本（≤3000字）：同步接口，直接返回音频数据，无需等待
- 长文本（>3000字）：异步接口，轮询查询任务状态（最大支持 100 万字符）

> 同步接口文本限制 < 10000 字符，超过 3000 字符推荐使用异步接口以获得更好的体验。

## Agent 决策指南（重要）

当用户请求语音合成时，Agent 应该：

### 1. 智能选择音色

根据用户描述或上下文，自动选择最合适的音色，**不要询问用户**：

| 用户描述/场景 | 推荐的 voice_id | 说明 |
|--------------|----------------|------|
| "温柔女声"、"甜美"、"亲切" | `female-tianmei` | 甜美女声，适合日常对话 |
| "成熟女声"、"御姐"、"有声书" | `female-yujie` | 御姐音，适合故事朗读 |
| "青年男声"、"普通男声"、默认 | `male-qn-qingse` | 青年男声，通用场景 |
| "成熟男声"、"绅士"、"稳重" | `Chinese (Mandarin)_Gentleman` | 绅士音，适合正式场合 |
| "新闻播报"、"播音员"、"正式" | `Chinese (Mandarin)_News_Anchor` | 新闻主播，适合播报 |
| "可爱女声"、"萝莉"、"活泼" | `female-shaonv` | 少女音，适合活泼内容 |
| "中年男声"、"大叔" | `male-jieshuo` | 解说音，适合讲解 |

### 2. 智能调整语速

| 场景 | speed 参数 | 说明 |
|------|-----------|------|
| 正常朗读 | `1.0` | 默认语速 |
| "慢一点"、"清晰点" | `0.8` | 慢速，适合学习 |
| "快一点"、"赶紧" | `1.2` | 快速，适合紧急通知 |
| "新闻播报"、"正式" | `1.0` | 标准语速 |
| "讲故事"、"有声书" | `0.9` | 稍慢，更有氛围 |

### 3. 文件名生成

从文本内容提取 2-4 个关键词作为文件名前缀，例如：
- 文本："第一章 故事的开始" → 前缀：`story_chapter_1`
- 文本："欢迎使用本产品" → 前缀：`welcome_message`

## 使用方式

### 方式一：命令行脚本（Agent 直接调用）

```bash
# 基础用法 - Agent 已选好音色
bun run ${CLAUDE_SKILL_DIR}/scripts/tts.ts "文本内容" --voice female-tianmei --speed 1.0 --output welcome_message.mp3

# 或使用 package.json 中的快捷命令
bun run ${CLAUDE_SKILL_DIR}/scripts/tts.ts "文本内容" --voice female-tianmei --speed 1.0 --output welcome_message.mp3

# 完整参数
bun run ${CLAUDE_SKILL_DIR}/scripts/tts.ts "文本" \
  --voice female-tianmei \
  --speed 1.0 \
  --vol 10 \
  --pitch 1.0 \
  --model speech-2.8-hd \
  --output output.mp3
```

### 方式二：TypeScript 函数调用

```typescript
import { textToSpeech } from "./scripts/tts";

// Agent 决策后直接调用
const output = await textToSpeech({
    text: "要合成的文本",
    voiceId: "female-tianmei",  // Agent 根据场景选择
    speed: 1.0,                   // Agent 根据需求选择
    outputFile: "story_chapter_1.mp3"
});
```

## 脚本参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | 必填 | 要合成的文本 |
| `--voice`, `-v` | string | `male-qn-jingying` | 音色ID |
| `--speed`, `-s` | float | `1.0` | 语速 0.5-2.0 |
| `--vol` | float | `1` | 音量 0-10 |
| `--pitch`, `-p` | int | `0` | 音调 -12 到 12 |
| `--model`, `-m` | string | `speech-2.8-hd` | 语音模型 |
| `--output`, `-o` | string | `output.mp3` | 输出文件 |

## 推荐音色列表

### 中文常用音色

| voice_id | 描述 | 适用场景 |
|----------|------|----------|
| `female-tianmei` | 甜美女生 | 日常对话、客服、欢迎词 |
| `female-yujie` | 御姐音 | 有声书、故事、情感朗读 |
| `female-shaonv` | 少女音 | 可爱风格、动漫、活泼内容 |
| `male-qn-qingse` | 青年男声 | 通用男声、默认选择 |
| `male-jieshuo` | 解说男声 | 讲解、教程、纪录片 |
| `Chinese (Mandarin)_News_Anchor` | 新闻主播 | 新闻播报、正式公告 |
| `Chinese (Mandarin)_Gentleman` | 绅士男声 | 商务、正式场合 |
| `Chinese (Mandarin)_Elderly_Man` | 老年男声 | 长辈角色、慈祥风格 |

### 英文常用音色

| voice_id | 描述 |
|----------|------|
| `English (US)_Jenny` | 美式女声 |
| `English (US)_Guy` | 美式男声 |
| `English (UK)_Libby` | 英式女声 |
| `English (UK)_Ryan` | 英式男声 |

**完整音色列表：** [voices.md](./voices.md)（327个音色）

## 模型选择

| 模型 | 特点 | 适用场景 |
|------|------|----------|
| `speech-2.8-hd` | 音质最佳，情感丰富 | 专业配音、有声书（默认） |
| `speech-2.6-hd` | 低延迟，高自然度 | 实时对话 |
| `speech-2.8-turbo` | 性价比高，速度快 | 批量生成 |
| `speech-02-hd` | 韵律出色 | 音乐、歌曲 |

## 示例场景

### ❌/✅ 正确示例：自动选择接口

❌ **WRONG** - 手动指定异步接口处理短文本（不必要的等待）
```
用户：生成一个欢迎语音

Agent（错误做法）：
- 手动调用异步接口
- 轮询等待任务完成
- 延迟不必要地增加
```

✅ **CORRECT** - 让 skill 自动选择（短文本走同步，立即返回）
```
用户：生成一个欢迎语音

Agent（正确做法）：
- 调用 tts.ts，传入文本
- skill 自动判断 ≤3000字，走同步接口
- 直接返回音频，无等待
```

### 示例 1：欢迎语音
```
用户：生成一个欢迎语音，温柔一点的女生

Agent 决策：
- 音色：female-tianmei（温柔女声）
- 语速：1.0（正常）
- 命令：bun run ${CLAUDE_SKILL_DIR}/scripts/tts.ts "欢迎使用我们的服务" --voice female-tianmei --output welcome.mp3
```

### 示例 2：新闻播报
```
用户：把这段新闻用播音员的声音读出来

Agent 决策：
- 音色：Chinese (Mandarin)_News_Anchor（新闻主播）
- 语速：1.0（标准）
- 命令：bun run ${CLAUDE_SKILL_DIR}/scripts/tts.ts "[新闻文本]" --voice "Chinese (Mandarin)_News_Anchor" --output news_broadcast.mp3
```

### 示例 3：有声书
```
用户：把这段故事转成语音，要有讲故事的感觉

Agent 决策：
- 音色：female-yujie（御姐音，适合讲故事）
- 语速：0.9（稍慢，更有氛围）
- 命令：bun run ${CLAUDE_SKILL_DIR}/scripts/tts.ts "[故事文本]" --voice female-yujie --speed 0.9 --output story_chapter_1.mp3
```

### 示例 4：紧急通知
```
用户：生成一个紧急通知，语速快一点

Agent 决策：
- 音色：male-qn-qingse（清晰男声）
- 语速：1.2（稍快）
- 命令：bun run ${CLAUDE_SKILL_DIR}/scripts/tts.ts "紧急通知：请立即疏散" --voice male-qn-qingse --speed 1.2 --output emergency_notice.mp3
```

## 限制说明

- **同步接口（/v1/t2a_v2）**：文本 < 10,000 字符，返回 `data.audio`（hex 编码音频）
- **异步接口（/v1/t2a_async_v2）**：文本 < 100 万字符，返回 `task_id` 后轮询
- **流式输出**：文本 > 3,000 字符推荐使用异步或流式接口
- **非法字符**：控制字符（除 \t 和 \n）超过 10% 会报错
- **下载时效**：音频链接 9 小时内有效
- **返回格式**：tar 压缩包（异步），hex 数据（同步）
- **音频参数**：channel 默认 1（单声道），pitch 范围 [-12, 12]

## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 2038 | 未实名认证 | 提醒用户完成 MiniMax 实名认证 |
| Text too long | 文本超过限制（>100万字） | 分段处理 |
| Task failed | 任务失败 | 检查文本内容，重试 |
| "同步接口未返回音频数据" | API 响应格式变化或音频为空 | 检查 `data.audio` 字段，确认返回的是 hex 编码数据 |
| "等待任务超时" | 异步任务处理时间过长 | 减少文本长度或增加重试次数 |
| "MINIMAX_API_KEY 环境变量未设置" | 未配置 API Key | 设置 `MINIMAX_API_KEY` 环境变量 |
