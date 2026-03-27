---
name: minimax-image-analysis
description: |
  使用 MiniMax VLM API 分析图像内容或提取文字。当用户需要理解图像内容、
  描述图片、从图片中提取文字 (OCR)、识别截图或分析视觉元素时说"分析图像"、
  "理解图片"、"提取图中文字"、"识别图片内容"、"描述这张图片"、
  "图片里有什么"时触发。支持多种图像格式和自定义分析提示词。
---

# MiniMax Image Analysis 图像理解技能

使用 MiniMax VLM API 进行图像内容分析和文字提取，支持本地文件、URL 和 Base64 格式的图像输入。

## Quick Reference

| 任务 | 命令 |
|------|------|
| 自动分析图片 | `python scripts/image_analysis.py "image.jpg"` |
| 指定分析要求 | `python scripts/image_analysis.py "image.jpg" "提取所有文字"` |
| 函数调用 | `analyze_image(api_key, api_host, image_source="image.jpg")` |

## 前置要求

**必需环境变量：**

```bash
export MINIMAX_API_KEY="your_api_key_here"
```

**可选环境变量：**

```bash
export MINIMAX_API_HOST="https://api.minimax.chat"  # 默认
```

## 使用方式

### 方式一：命令行调用（推荐）

```bash
# 不传提示词时自动使用全面默认分析
python scripts/image_analysis.py "photo.jpg"

# 指定自定义提示词
python scripts/image_analysis.py "screenshot.png" "描述这张截图的界面内容"

# 提取图中所有文字（OCR）
python scripts/image_analysis.py "document.jpg" "提取图中所有文字，保留格式"

# 分析图表
python scripts/image_analysis.py "chart.png" "分析这个图表的数据趋势"

# 使用 URL 图片
python scripts/image_analysis.py "https://example.com/image.jpg"
```

### 方式二：Python 函数调用

```python
import sys
sys.path.insert(0, 'scripts')
from image_analysis import analyze_image, get_config

# 获取配置
api_key, api_host = get_config()

# 分析图片（使用默认提示词）
result = analyze_image(api_key, api_host, image_source="image.jpg")
print(result)

# 使用自定义提示词
result = analyze_image(
    api_key,
    api_host,
    image_source="chart.png",
    prompt="分析这个图表的关键数据点"
)
print(result)
```

## 支持的图像格式

### 输入类型

| 类型 | 示例 | 说明 |
|------|------|------|
| 本地文件 | `photo.jpg` | 相对或绝对路径 |
| HTTP/HTTPS URL | `https://example.com/image.jpg` | 公开可访问的图片链接 |
| Base64 Data URL | `data:image/jpeg;base64,...` | Base64 编码的图片数据 |

### 支持的图片格式

- **JPEG/JPG** - 有损压缩，适合照片
- **PNG** - 无损压缩，支持透明，适合截图
- **WebP** - 现代格式，压缩效率高

**限制：**
- 单张图片大小：< 10MB
- 分辨率建议：< 4096×4096

## 默认提示词

不传提示词时自动使用全面分析：

```
请全面分析这张图像：

1. **图像概述**：描述图像的主体内容、场景、氛围等基本信息

2. **详细内容**：
   - 识别并描述所有可见的文字、数字、符号
   - 描述图像中的人物、物体、动作、表情
   - 描述背景环境、颜色风格等视觉元素

3. **文字提取**：请逐字提取图像中出现的所有文字内容（包括标题、正文、标签、Logo文字、水印等），保留原有排版格式

4. **关键信息**：总结图像传达的核心信息或意图

请用结构化的方式输出分析结果。如果图像中没有文字，请明确说明。
```

## 常见场景

### 场景一：提取图片中的文字（OCR）

```bash
python scripts/image_analysis.py "document.jpg" "提取图中所有文字，保留原有格式"
```

### 场景二：理解截图内容

```bash
python scripts/image_analysis.py "screenshot.png" "描述这个截图显示的是什么界面，有什么功能"
```

### 场景三：分析图表数据

```bash
python scripts/image_analysis.py "chart.png" "分析这个柱状图的主要数据趋势和结论"
```

### 场景四：识别物体和场景

```bash
python scripts/image_analysis.py "photo.jpg" "识别图片中的物体、人物动作和拍摄场景"
```

### 场景五：代码截图分析

```bash
python scripts/image_analysis.py "code.png" "提取图中的代码并解释其功能"
```

## ❌ WRONG / ✅ CORRECT

### ❌ WRONG - 分析过大的图片

```python
# 不要分析超过 10MB 的图片
result = analyze_image(api_key, api_host, image_source="huge_raw_photo.raw")
```

### ✅ CORRECT - 压缩后再分析

```python
from PIL import Image

# 压缩图片
img = Image.open("huge_photo.jpg")
img.thumbnail((2048, 2048))
img.save("compressed.jpg", quality=85)

# 分析压缩后的图片
result = analyze_image(api_key, api_host, image_source="compressed.jpg")
```

### ❌ WRONG - 不处理异常

```python
# 不检查图片是否存在
result = analyze_image(api_key, api_host, image_source="not_exist.jpg")
```

### ✅ CORRECT - 检查文件存在性

```python
import os

image_path = "image.jpg"
if not os.path.exists(image_path):
    print(f"错误: 图片不存在: {image_path}")
else:
    result = analyze_image(api_key, api_host, image_source=image_path)
    print(result)
```

### ❌ WRONG - 使用不清晰的提示词

```bash
# 提示词过于模糊
python scripts/image_analysis.py "image.jpg" "看一下"
```

### ✅ CORRECT - 使用具体的提示词

```bash
# 提示词具体明确
python scripts/image_analysis.py "image.jpg" "提取图中所有的文字内容，包括标题、正文和按钮标签"
```

## 错误处理

### 常见错误及解决方案

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `File not found` | 图片路径错误 | 检查路径是否正确 |
| `Image too large` | 图片超过 10MB | 压缩图片后再上传 |
| `Unsupported format` | 格式不支持 | 转换为 JPEG/PNG/WebP |
| `MINIMAX_API_KEY not set` | 未设置环境变量 | `export MINIMAX_API_KEY="xxx"` |
| `Invalid image URL` | URL 无法访问 | 检查 URL 是否公开可访问 |
| `API request failed` | API 调用失败 | 检查网络连接，稍后重试 |

### 完整的错误处理示例

```python
import sys
import os
sys.path.insert(0, 'scripts')
from image_analysis import analyze_image, get_config, MinimaxAuthError, MinimaxRequestError

def safe_analyze_image(image_source, prompt=None):
    """带完整错误处理的图片分析"""

    # 1. 检查文件是否存在（本地文件）
    if not image_source.startswith(('http://', 'https://', 'data:')):
        if not os.path.exists(image_source):
            print(f"✗ 错误: 图片文件不存在: {image_source}")
            return None

        # 检查文件大小
        file_size = os.path.getsize(image_source)
        if file_size > 10 * 1024 * 1024:  # 10MB
            print(f"✗ 错误: 图片过大 ({file_size / 1024 / 1024:.1f}MB > 10MB)")
            return None

    try:
        api_key, api_host = get_config()
        result = analyze_image(api_key, api_host, image_source=image_source, prompt=prompt)
        return result

    except MinimaxAuthError:
        print("✗ 认证失败: 请检查 MINIMAX_API_KEY 是否正确设置")
    except MinimaxRequestError as e:
        print(f"✗ 请求失败: {e}")
    except FileNotFoundError:
        print(f"✗ 文件不存在: {image_source}")
    except Exception as e:
        print(f"✗ 未知错误: {e}")

    return None

# 使用示例
result = safe_analyze_image("document.jpg", "提取所有文字")
if result:
    print(result)
```

## 自定义提示词技巧

### 提取文字（OCR）

```
提取图中所有文字，保留原有排版格式。包括标题、正文、标签、按钮文字等。
```

### 描述图片内容

```
详细描述这张图片的内容，包括：主体是什么、场景环境、颜色风格、视觉元素等。
```

### 分析 UI/UX

```
分析这个界面设计：有哪些功能模块、布局是否合理、有什么交互元素。
```

### 识别图表

```
分析这个图表：是什么类型的图表、展示了什么数据、有什么趋势或结论。
```

### 代码理解

```
提取图中的代码，并解释这段代码的功能和逻辑。
```

## 注意事项

1. **图片大小**：单张图片 < 10MB
2. **图片质量**：过于模糊的图片可能影响分析效果
3. **隐私安全**：不要上传包含敏感信息的图片
4. **URL 图片**：确保 URL 公开可访问，不需要认证
5. **批量处理**：大量图片建议分批处理，避免触发频率限制
