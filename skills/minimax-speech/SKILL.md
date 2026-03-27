---
name: minimax-speech
description: 当用户需要将文字转为语音、生成音频文件、语音合成、text to speech、TTS，或说"把这段文字转成语音"、"生成一个音频"、"读一下这段文字"时触发。
---

# MiniMax Speech Synthesis

MiniMax 异步语音合成 API，支持将文本转换为高质量语音音频。适用于长文本（<10万字符）语音生成任务。

## Quick Reference

| 任务 | 函数 | 说明 |
|------|------|------|
| 完整流程 | `text_to_speech(text, voice_id, model, output_file)` | 一站式生成音频 |
| 创建任务 | `create_speech_task(text, voice_id, model)` | 仅创建，返回 task_id |
| 查询状态 | `query_task(task_id)` | 查询任务执行状态 |
| 下载音频 | `download_audio(file_id, output_path)` | 下载并解压 tar 包 |

## 前置要求

**必需环境变量：**

```bash
export MINIMAX_API_KEY="your_api_key_here"
# 可选：切换域名（中文站/国际站）
export MINIMAX_API_HOST="https://api.minimaxi.com"  # 默认
```

**依赖安装：**

```bash
pip install requests
```

## 使用方式

### 完整流程（推荐）

```python
import requests
import os
import time
import tarfile
import io

API_KEY = os.environ.get("MINIMAX_API_KEY")
BASE_URL = os.environ.get("MINIMAX_API_HOST", "https://api.minimaxi.com") + "/v1"

def text_to_speech(text, voice_id="male-qn-qingse", model="speech-2.8-hd", output_file="output.mp3"):
    """文本转语音完整流程"""
    # 1. 创建任务
    url = f"{BASE_URL}/t2a_async_v2"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "text": text,
        "voice_setting": {
            "voice_id": voice_id,
            "speed": 1.0,
            "vol": 10,
            "pitch": 1
        },
        "audio_setting": {
            "audio_sample_rate": 32000,
            "bitrate": 128000,
            "format": "mp3"
        }
    }
    resp = requests.post(url, json=payload, headers=headers)
    resp.raise_for_status()
    task_id = resp.json()["data"]["task_id"]
    print(f"任务已创建: {task_id}")

    # 2. 轮询查询状态
    while True:
        query_url = f"{BASE_URL}/query/t2a_async_query_v2?task_id={task_id}"
        result = requests.get(query_url, headers={"Authorization": f"Bearer {API_KEY}"})
        result.raise_for_status()
        data = result.json()
        status = data["data"]["status"]
        print(f"状态: {status}")

        if status == "success":
            file_id = data["data"]["file_id"]
            # 3. 下载音频
            retrieve_url = f"{BASE_URL}/files/retrieve?file_id={file_id}"
            resp = requests.get(retrieve_url, headers={"Authorization": f"Bearer {API_KEY}"})
            resp.raise_for_status()
            download_url = resp.json()["file"]["download_url"]

            # 下载并解压 tar 包
            tar_resp = requests.get(download_url)
            tar_resp.raise_for_status()
            with tarfile.open(fileobj=io.BytesIO(tar_resp.content), mode='r') as tar:
                for member in tar.getmembers():
                    if member.name.endswith('.mp3'):
                        mp3_content = tar.extractfile(member).read()
                        with open(output_file, "wb") as f:
                            f.write(mp3_content)
                        break
            print(f"音频已保存: {output_file}")
            return output_file
        elif status == "failed":
            raise Exception("语音合成失败")

        time.sleep(5)

# 使用示例
text_to_speech("你好，欢迎使用 MiniMax 语音合成服务！", output_file="hello.mp3")
```

## 核心参数

### 语音任务参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `model` | string | `speech-2.8-hd` | 语音模型，见下方模型列表 |
| `text` | string | 必填 | 待合成文本（<10万字） |
| `voice_setting.voice_id` | string | `male-qn-qingse` | 音色ID，见下方音色列表 |
| `voice_setting.speed` | float | `1.0` | 语速，范围 0.5-2.0 |
| `voice_setting.vol` | int | `10` | 音量，范围 0-10 |
| `voice_setting.pitch` | float | `1.0` | 音调，范围 0.5-2.0 |
| `audio_setting.format` | string | `mp3` | 格式：`mp3`, `wav` |
| `audio_setting.audio_sample_rate` | int | `32000` | 采样率：16000, 32000 |

### 常用音色推荐

| 场景 | 音色 | voice_id |
|------|------|----------|
| 通用男声 | 青年男声 | `male-qn-qingse` |
| 通用女声 | 甜美女声 | `female-tianmei` |
| 有声书 | 御姐音 | `female-yujie` |
| 新闻播报 | 新闻主播 | `Chinese (Mandarin)_News_Anchor` |
| 成熟男声 | 绅士音 | `Chinese (Mandarin)_Gentleman` |

**完整音色列表：** [voices.md](./voices.md)（327个音色，按语言分类）

### 模型选择

| 模型 | 特点 | 适用场景 |
|------|------|----------|
| `speech-2.8-hd` | 精准还原语气细节，音色相似度高 | 专业配音、有声书 |
| `speech-2.6-hd` | 超低延时，更高自然度 | 实时对话 |
| `speech-2.8-turbo` | 精准还原，更快更优惠 | 批量生成 |
| `speech-02-hd` | 出色韵律和稳定性，音质突出 | 音乐、歌曲 |
| `speech-02-turbo` | 小语种能力加强，性能出色 | 多语言内容 |

## 常见场景

### 生成有声书

```python
text = """
第一章 故事的开始

很久很久以前，在一个遥远的国度...
"""

text_to_speech(
    text=text,
    voice_id="female-yujie",
    model="speech-2.8-hd",
    output_file="audiobook_chapter1.mp3"
)
```

### 批量生成通知语音

```python
notifications = [
    "您的订单已发货",
    "请前往3号窗口办理",
    "欢迎使用自助服务",
]

for i, text in enumerate(notifications):
    text_to_speech(
        text=text,
        voice_id="female-tianmei",
        model="speech-02-turbo",
        output_file=f"notification_{i}.mp3"
    )
```

## ❌ WRONG / ✅ CORRECT

### ❌ WRONG - 文本超过限制

```python
# 不要传递超过 10 万字符的文本
with open("long_novel.txt") as f:
    text = f.read()  # 可能超过 10 万字

text_to_speech(text)  # 会报错
```

### ✅ CORRECT - 分段处理长文本

```python
# 将长文本分段处理
def split_text(text, max_length=50000):
    """将文本分段"""
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""

    for para in paragraphs:
        if len(current_chunk) + len(para) < max_length:
            current_chunk += para + '\n\n'
        else:
            chunks.append(current_chunk)
            current_chunk = para + '\n\n'

    if current_chunk:
        chunks.append(current_chunk)

    return chunks

# 分段生成
chunks = split_text(long_text)
for i, chunk in enumerate(chunks):
    text_to_speech(chunk, output_file=f"part_{i}.mp3")
```

### ❌ WRONG - 不检查任务状态

```python
# 创建任务后不等待完成
task_id = create_speech_task(text)
print(f"任务创建: {task_id}")
# 直接尝试下载，但任务可能还没完成
download_audio(file_id, "output.mp3")
```

### ✅ CORRECT - 轮询等待任务完成

```python
# 创建任务后轮询查询状态
while True:
    result = query_task(task_id)
    status = result["data"]["status"]

    if status == "success":
        file_id = result["data"]["file_id"]
        download_audio(file_id, "output.mp3")
        break
    elif status == "failed":
        raise Exception("合成失败")

    time.sleep(5)  # 等待5秒再查询
```

### ❌ WRONG - 忽略 tar 包格式

```python
# 直接保存响应内容
tar_resp = requests.get(download_url)
with open("output.mp3", "wb") as f:  # 错误！这是 tar 包
    f.write(tar_resp.content)
```

### ✅ CORRECT - 解压 tar 包

```python
import tarfile
import io

tar_resp = requests.get(download_url)
with tarfile.open(fileobj=io.BytesIO(tar_resp.content), mode='r') as tar:
    for member in tar.getmembers():
        if member.name.endswith('.mp3'):
            mp3_content = tar.extractfile(member).read()
            with open("output.mp3", "wb") as f:
                f.write(mp3_content)
            break
```

## 错误处理

### 常见错误及解决方案

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `MINIMAX_API_KEY not set` | 未设置环境变量 | `export MINIMAX_API_KEY="xxx"` |
| `Text too long` | 文本超过 10 万字符 | 分段处理文本 |
| `Invalid characters` | 非法字符超过 10% | 清理文本中的控制字符 |
| `Task failed` | 任务执行失败 | 检查文本内容，重试 |
| `Download URL expired` | 下载链接过期（9小时） | 及时下载，过期需重新生成 |
| `Voice not found` | 音色ID不存在 | 检查 voice_id 是否正确 |

### API 状态码

| status | 说明 |
|--------|------|
| `queued` | 排队中 |
| `processing` | 处理中 |
| `success` | 成功，可以下载 |
| `failed` | 失败 |

### 完整的错误处理示例

```python
import time

def safe_text_to_speech(text, voice_id="male-qn-qingse", output_file="output.mp3", max_retries=3):
    """带错误处理和重试的语音合成"""

    # 1. 检查文本长度
    if len(text) > 100000:
        raise ValueError(f"文本过长: {len(text)} 字符，最大支持 10 万字符")

    # 2. 检查环境变量
    api_key = os.environ.get("MINIMAX_API_KEY")
    if not api_key:
        raise ValueError("MINIMAX_API_KEY 环境变量未设置")

    for attempt in range(max_retries):
        try:
            # 创建任务
            task_id = create_speech_task(text, voice_id)
            print(f"任务创建成功: {task_id}")

            # 轮询等待
            while True:
                result = query_task(task_id)
                status = result["data"]["status"]

                if status == "success":
                    file_id = result["data"]["file_id"]
                    download_audio(file_id, output_file)
                    print(f"✓ 音频已保存: {output_file}")
                    return output_file

                elif status == "failed":
                    raise Exception("语音合成任务失败")

                time.sleep(5)

        except Exception as e:
            print(f"✗ 尝试 {attempt + 1}/{max_retries} 失败: {e}")
            if attempt < max_retries - 1:
                time.sleep(10)
            else:
                raise

    return None
```

## 支持语言

支持 40+ 种语言：中文（普通话、粤语）、英语、日语、韩语、法语、德语、西班牙语、俄语、葡萄牙语、阿拉伯语、意大利语、印尼语、越南语、土耳其语、荷兰语、泰语、波兰语、印地语等。

## 注意事项

1. **文本限制**: 单个文件 < 10 万字符
2. **非法字符**: 超过 10% 非法字符（控制符，不含 `\t` 和 `\n`）会报错
3. **下载时效**: 返回的下载 URL 有效期 9 小时，请及时下载
4. **返回格式**: API 返回 tar 包，包含 mp3 文件和时间戳字幕文件，需解压
5. **任务耗时**: 根据文本长度，通常需要几秒到几分钟不等
