---
name: minimax-image
description: |
  使用 MiniMax Image01 API 进行文生图和图生图创作。当用户需要 AI 生成图片时说
  "画一张图"、"生成图片"、"文生图"、"用 AI 画图"、"create an image"、
  "generate a picture"或提到 "Minimax 图片生成"时触发。支持保持人物/物体一致性
  的图生图功能。
---

# MiniMax Image 文生图技能

使用 MiniMax Image01 API 进行高质量的文生图和图生图创作，支持多种宽高比和批量生成。

## Quick Reference

| 任务 | 命令 |
|------|------|
| 生成单张图片 | `python scripts/generate_image.py "prompt描述"` |
| 指定宽高比 | `python scripts/generate_image.py "prompt" --aspect-ratio 16:9` |
| 批量生成 | `python scripts/generate_image.py "prompt" -n 4` |
| 指定输出目录 | `python scripts/generate_image.py "prompt" --output-dir ./images` |
| 图生图（一致性） | 使用 `subject_reference` 参数（见下方示例） |

## 前置要求

**必需环境变量：**

```bash
export MINIMAX_API_KEY="your_api_key_here"
```

**依赖安装：**

```bash
pip install requests
```

## 使用方式

### 方式一：命令行调用（推荐）

```bash
# 基本用法 - 生成 1:1 正方形图片
python scripts/generate_image.py "一个穿白色T恤的男人站在威尼斯海滩前"

# 指定宽高比（16:9 宽屏适合桌面壁纸）
python scripts/generate_image.py "女孩在图书馆窗前" --aspect-ratio 16:9

# 竖屏比例（9:16 适合手机壁纸）
python scripts/generate_image.py "未来城市天际线" --aspect-ratio 9:16

# 批量生成 4 张图片
python scripts/generate_image.py "梦幻森林" -n 4 --output-dir ./outputs

# 使用 URL 格式返回（适合快速预览）
python scripts/generate_image.py "抽象艺术" --format url
```

### 方式二：Python 函数调用

```python
import sys
sys.path.insert(0, 'scripts')
from generate_image import generate_image

# 基础文生图
paths = generate_image(
    prompt="一个穿白色T恤的男人站在威尼斯海滩前",
    aspect_ratio="16:9",
    n=2,
    output_dir="./outputs"
)
print(f"已生成: {paths}")

# 使用 URL 格式（不下载，只返回链接）
paths = generate_image(
    prompt="未来城市天际线",
    response_format="url",
    output_dir="./outputs"
)
```

## API 参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `prompt` | string | 必填 | 图片描述文本，英文描述效果更好 |
| `model` | string | `image-01` | 模型名称 |
| `aspect_ratio` | string | `1:1` | 宽高比，见下方支持列表 |
| `response_format` | string | `base64` | 返回格式：`base64` 或 `url` |
| `n` | int | `1` | 生成数量，1-9 张 |
| `output_dir` | string | `.` | 图片保存目录 |

### 支持的宽高比

| 比例 | 适用场景 |
|------|----------|
| `1:1` | 正方形，社交媒体头像、Instagram |
| `16:9` | 宽屏，桌面壁纸、视频封面 |
| `9:16` | 竖屏，手机壁纸、短视频封面 |
| `4:3` | 标准屏幕，PPT 配图 |
| `3:4` | 竖版标准，海报 |
| `3:2` | 摄影比例，风景照片风格 |
| `2:3` | 竖版摄影，人像照片风格 |
| `21:9` | 超宽屏，电影感画面 |

## 图生图（保持主体一致性）

当需要保持人物/物体一致性时，使用 `subject_reference` 参数：

### 示例：保持角色一致性

```python
import requests
import os

url = "https://api.minimaxi.com/v1/image_generation"
api_key = os.environ.get("MINIMAX_API_KEY")
headers = {"Authorization": f"Bearer {api_key}"}

payload = {
    "model": "image-01",
    "prompt": "女孩在图书馆的窗户前，看向远方，阳光明媚",
    "aspect_ratio": "16:9",
    "subject_reference": [
        {
            "type": "character",  # 保持角色一致
            "image_file": "https://example.com/reference.jpg",  # 参考图 URL
        }
    ],
    "response_format": "url",
}

response = requests.post(url, headers=headers, json=payload)
response.raise_for_status()
print(response.json())
```

### subject_reference 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `type` | string | 参考类型：`character`（人物）、`object`（物体） |
| `image_file` | string | 参考图片的 URL 地址 |

## ❌ WRONG / ✅ CORRECT

### ❌ WRONG - 不使用环境变量

```python
# 不要在代码中硬编码 API key
api_key = "sk-abc123..."
generate_image(prompt="...", api_key=api_key)
```

### ✅ CORRECT - 使用环境变量

```python
# 从环境变量读取，更安全
import os
api_key = os.environ.get("MINIMAX_API_KEY")
generate_image(prompt="...")
```

### ❌ WRONG - 生成后不检查文件

```python
# 不要忽略返回值
paths = generate_image(prompt="...")
# 没有后续处理，不知道图片保存到哪里
```

### ✅ CORRECT - 确认生成结果

```python
# 检查生成的图片路径
paths = generate_image(prompt="...", output_dir="./images")
for path in paths:
    if os.path.exists(path):
        print(f"✓ 图片已保存: {path}")
```

### ❌ WRONG - 中文提示词不翻译

```bash
# 中文描述效果可能不如英文
python scripts/generate_image.py "一个可爱的猫咪"
```

### ✅ CORRECT - 使用英文提示词

```bash
# 英文描述通常效果更好
python scripts/generate_image.py "a cute fluffy cat sitting on a windowsill, sunlight, warm colors"
```

## 错误处理

### 常见错误及解决方案

| 错误信息 | 原因 | 解决方案 |
|----------|------|----------|
| `MINIMAX_API_KEY not set` | 未设置环境变量 | `export MINIMAX_API_KEY="xxx"` |
| `HTTP Error 401` | API Key 无效 | 检查 Key 是否正确 |
| `HTTP Error 429` | 请求过于频繁 | 降低请求频率，或检查配额 |
| `Prompt too long` | 提示词过长 | 缩短 prompt，建议 < 500 字符 |
| `Invalid aspect_ratio` | 宽高比不支持 | 使用支持的宽高比列表中的值 |

### 在代码中处理错误

```python
from generate_image import generate_image
import os

# 先检查环境变量
if not os.environ.get("MINIMAX_API_KEY"):
    print("错误: 请先设置 MINIMAX_API_KEY 环境变量")
    exit(1)

try:
    paths = generate_image(
        prompt="a beautiful sunset over mountains",
        aspect_ratio="16:9",
        n=2
    )
    print(f"✓ 成功生成 {len(paths)} 张图片")
except Exception as e:
    print(f"✗ 生成失败: {e}")
```

## 脚本帮助

```bash
python scripts/generate_image.py --help
```

输出示例：
```
usage: generate_image.py [-h] [--aspect-ratio ASPECT_RATIO]
                        [--output-dir OUTPUT_DIR]
                        [--format {base64,url}] [--n N]
                        prompt

Minimax Image01 文生图

positional arguments:
  prompt                图片描述文本（建议用英文）

optional arguments:
  -h, --help            显示帮助信息
  --aspect-ratio, -r    宽高比: 16:9, 4:3, 3:2, 2:3, 3:4, 9:16, 21:9, 1:1
  --output-dir, -o      输出目录 (默认当前目录)
  --format, -f          返回格式: base64 或 url
  --n, -n               生成数量 1-9
```

## 最佳实践

1. **批量生成前检查配额**：使用 `minimax-usage` skill 先检查余额
2. **提示词优化**：使用英文、详细描述场景、光线、风格
3. **指定输出目录**：避免图片散落在当前目录
4. **合理的 n 值**：批量生成时 n=4 是较好的平衡点
