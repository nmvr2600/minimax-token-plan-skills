---
name: minimax-image
description: 使用Minimax image-01 生图，当用户说"使用 Minimax 生图"时触发。
---

# MiniMax Image 文生图技能

使用 MiniMax Image01 API 进行高质量的文生图和图生图创作，支持多种宽高比和批量生成。

**CRITICAL**: 所有脚本路径使用 `${CLAUDE_SKILL_DIR}` 变量引用，确保插件安装后无论用户工作目录在哪都能正确找到脚本。

## Quick Reference

| 任务 | 命令 |
|------|------|
| 生成单张图片 | `bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts "prompt"` |
| 指定宽高比 | `bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts "prompt" --aspect-ratio 16:9` |
| 批量生成 | `bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts "prompt" -n 4` |
| 指定输出目录 | `bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts "prompt" --output-dir ./images` |
| 自定义文件名前缀 | `bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts "prompt" --prefix my_photo` |
| 图生图（主体一致性） | `bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts "prompt" --reference-image <URL>` |

## 前置要求

**必需环境变量：**

```bash
export MINIMAX_API_KEY="your_api_key_here"
```

**可选环境变量：**

```bash
# API 主机地址（国内站默认 https://api.minimaxi.com）
export MINIMAX_API_HOST="https://api.minimaxi.com"
```

## 使用方式

### 文生图

```bash
# 基本用法 - 生成 1:1 正方形图片
bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts "a cute fluffy cat sitting on a windowsill"

# 指定宽高比（16:9 宽屏适合桌面壁纸）
bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts "girl in a library" --aspect-ratio 16:9

# 竖屏比例（9:16 适合手机壁纸）
bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts "futuristic city skyline" --aspect-ratio 9:16

# 批量生成 4 张图片，指定输出目录
bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts "dreamy forest" -n 4 --output-dir ./outputs

# 自定义文件名前缀
bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts "abstract art" --prefix abstract_1
```

### 图生图（保持主体一致性）

提供一张参考图，生成保持人物/物体特征一致的新图片。

```bash
# 使用参考图 URL，生成保持角色一致的新图片
bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts \
  "girl reading by the window, sunlight" \
  --reference-image "https://example.com/reference_face.jpg"
```

**CRITICAL**: 参考图必须是单人正面清晰照片，模型才能更好地理解人像信息。支持公网 URL 或 base64 格式。

## API 参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `prompt` | string | 必填 | 图片描述文本，最长 1500 字符，英文描述效果更好 |
| `model` | string | `image-01` | 模型名称 |
| `aspect_ratio` | string | `1:1` | 宽高比，见下方支持列表 |
| `response_format` | string | `base64` | 返回格式：`base64` 或 `url`（url 有效期 24 小时） |
| `n` | int | `1` | 生成数量，1-9 张 |
| `output_dir` | string | `.` | 图片保存目录 |
| `prefix` | string | `image_{timestamp}` | 输出文件名前缀 |
| `subject_reference` | object | 无 | 图生图主体参考（见下方） |

### CLI 参数

| 参数 | 缩写 | 说明 |
|------|------|------|
| `--aspect-ratio` | `-r` | 宽高比 |
| `--output-dir` | `-o` | 输出目录 |
| `--format` | `-f` | 返回格式：base64 / url |
| `--n` | `-n` | 生成数量 1-9 |
| `--prefix` | `-p` | 文件名前缀 |
| `--reference-image` | `-i` | 参考图 URL（图生图） |
| `--help` | `-h` | 显示帮助信息 |

### 支持的宽高比

| 比例 | 分辨率 | 适用场景 |
|------|--------|----------|
| `1:1` | 1024x1024 | 正方形，社交媒体头像 |
| `16:9` | 1280x720 | 宽屏，桌面壁纸、视频封面 |
| `9:16` | 720x1280 | 竖屏，手机壁纸、短视频封面 |
| `4:3` | 1152x864 | 标准屏幕，PPT 配图 |
| `3:4` | 864x1152 | 竖版标准，海报 |
| `3:2` | 1248x832 | 摄影比例，风景照片风格 |
| `2:3` | 832x1248 | 竖版摄影，人像照片风格 |
| `21:9` | 1344x576 | 超宽屏，电影感画面（仅 image-01） |

### subject_reference 参数说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | string | 主体类型，目前仅支持 `character`（人物） |
| `image_file` | string | 参考图片，支持公网 URL 或 `data:image/jpeg;base64,{data}` 格式 |

## ❌ WRONG / ✅ CORRECT

### ❌ WRONG - 中文提示词效果差

```bash
bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts "一个可爱的猫咪坐在窗台上"
```

### ✅ CORRECT - 英文提示词效果更好

```bash
bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts "a cute fluffy cat sitting on a windowsill, sunlight, warm colors"
```

### ❌ WRONG - 参考图不是正面清晰照片

```bash
# 侧脸、模糊、多人照片，模型难以提取特征
bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts "girl reading" -i "https://example.com/group_photo.jpg"
```

### ✅ CORRECT - 使用单人正面清晰照片

```bash
bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts "girl reading" -i "https://example.com/clear_frontal_face.jpg"
```

### ❌ WRONG - 忘记指定输出目录，图片散落在当前目录

```bash
bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts "a cute cat" -n 4
```

### ✅ CORRECT - 指定输出目录和文件名前缀

```bash
bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts "a cute cat" -n 4 --output-dir ./images --prefix cat
```

## 错误处理

| 错误信息 | 原因 | 解决方案 |
|----------|------|----------|
| `MINIMAX_API_KEY environment variable is not set` | 未设置环境变量 | `export MINIMAX_API_KEY="xxx"` |
| `HTTP 错误: 401` | API Key 无效 | 检查 Key 是否正确 |
| `HTTP 错误: 429` | 请求过于频繁 | 降低请求频率，或检查配额 |
| `API 错误: ...` | API 返回错误 | 检查错误信息，常见原因：prompt 过长、参数不合法 |
| `生成数量必须在 1-9 之间` | n 参数超出范围 | 使用 1-9 之间的值 |

## 脚本帮助

```bash
bun run ${CLAUDE_SKILL_DIR}/scripts/generate.ts -- --help
```

## 最佳实践

1. **CRITICAL**: 英文提示词效果远好于中文，务必使用英文描述
2. **批量生成前检查配额**：使用 `minimax-usage` skill 先检查余额
3. **提示词优化**：详细描述场景、光线、风格，效果更好
4. **指定输出目录**：使用 `--output-dir` 避免图片散落在当前目录
5. **自定义文件名前缀**：使用 `--prefix` 方便管理生成的图片
6. **合理的 n 值**：批量生成时 n=4 是较好的平衡点
7. **图生图参考图**：使用单人正面清晰照片，效果最佳
