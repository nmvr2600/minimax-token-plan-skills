#!/usr/bin/env python3
"""
MiniMax 语音合成脚本
用法: python text_to_speech.py "要转换的文本" [--output output.mp3] [--voice female-tianmei]
"""

import requests
import os
import sys
import time
import tarfile
import io
import argparse


def create_speech_task(
    api_key: str,
    api_host: str,
    text: str,
    voice_id: str,
    model: str,
    speed: float = 1.0,
    vol: int = 10,
    pitch: float = 1.0,
) -> str:
    """创建语音合成任务"""
    url = f"{api_host}/v1/t2a_async_v2"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    # API 对参数类型敏感，确保使用正确的类型
    payload = {
        "model": model,
        "text": text,
        "voice_setting": {
            "voice_id": voice_id,
            "speed": int(speed) if speed == int(speed) else float(speed),
            "vol": int(vol),
            "pitch": int(pitch) if pitch == int(pitch) else float(pitch),
        },
        "audio_setting": {
            "audio_sample_rate": 32000,
            "bitrate": 128000,
            "format": "mp3",
        },
    }
    resp = requests.post(url, json=payload, headers=headers)
    resp.raise_for_status()
    result = resp.json()
    return result["task_id"]


def query_task(api_key: str, api_host: str, task_id: str) -> dict:
    """查询任务状态"""
    url = f"{api_host}/v1/query/t2a_async_query_v2?task_id={task_id}"
    headers = {"Authorization": f"Bearer {api_key}"}
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json()


def download_audio(api_key: str, api_host: str, file_id: str, output_path: str):
    """下载音频文件"""
    # 获取下载链接
    url = f"{api_host}/v1/files/retrieve?file_id={file_id}"
    headers = {"Authorization": f"Bearer {api_key}"}
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    download_url = resp.json()["file"]["download_url"]

    # 下载 tar 包
    tar_resp = requests.get(download_url)
    tar_resp.raise_for_status()

    # 解压获取 mp3
    with tarfile.open(fileobj=io.BytesIO(tar_resp.content), mode="r") as tar:
        for member in tar.getmembers():
            if member.name.endswith(".mp3"):
                mp3_content = tar.extractfile(member).read()
                with open(output_path, "wb") as f:
                    f.write(mp3_content)
                return True
    return False


def text_to_speech(
    text: str,
    output_file: str = "output.mp3",
    voice_id: str = "female-tianmei",
    model: str = "speech-2.8-hd",
    speed: float = 1.0,
    vol: int = 10,
    pitch: float = 1.0,
    api_key: str = None,
    api_host: str = None,
) -> str:
    """
    完整的文本转语音流程

    Args:
        text: 要转换的文本（<10万字符）
        output_file: 输出文件路径
        voice_id: 音色ID
        model: 语音模型
        speed: 语速 0.5-2.0
        vol: 音量 0-10
        pitch: 音调 0.5-2.0
        api_key: API Key（默认从环境变量获取）
        api_host: API 主机地址（默认从环境变量获取）

    Returns:
        输出文件路径
    """
    # 获取配置
    if not api_key:
        api_key = os.environ.get("MINIMAX_API_KEY")
    if not api_host:
        api_host = os.environ.get("MINIMAX_API_HOST", "https://api.minimaxi.com")

    if not api_key:
        raise ValueError("MINIMAX_API_KEY 环境变量未设置")

    if len(text) > 100000:
        raise ValueError(f"文本过长: {len(text)} 字符，最大支持 10 万字符")

    print(f"🎙️ 正在创建语音合成任务...")
    task_id = create_speech_task(
        api_key, api_host, text, voice_id, model, speed, vol, pitch
    )
    print(f"✓ 任务已创建: {task_id}")

    # 轮询等待任务完成
    max_retries = 60  # 最多等待 2 分钟
    for i in range(max_retries):
        result = query_task(api_key, api_host, task_id)
        status = result.get("status", result.get("data", {}).get("status", "unknown"))

        if status.lower() == "success":
            file_id = result.get("file_id") or result.get("data", {}).get("file_id")
            print(f"✓ 任务完成，正在下载音频...")
            if download_audio(api_key, api_host, file_id, output_file):
                print(f"✅ 音频已保存: {output_file}")
                return output_file
            else:
                raise RuntimeError("下载音频失败")
        elif status.lower() == "failed":
            raise RuntimeError("语音合成任务失败")

        if i % 5 == 0:  # 每 10 秒打印一次
            print(f"  等待中... ({i + 1}/{max_retries})")
        time.sleep(2)

    raise TimeoutError("等待任务超时")


def main():
    parser = argparse.ArgumentParser(description="MiniMax 文本转语音")
    parser.add_argument("text", help="要转换的文本（支持中文和英文）")
    parser.add_argument(
        "-o", "--output", default="output.mp3", help="输出文件路径 (默认: output.mp3)"
    )
    parser.add_argument(
        "-v", "--voice", default="female-tianmei", help="音色ID (默认: female-tianmei)"
    )
    parser.add_argument(
        "-m", "--model", default="speech-2.8-hd", help="语音模型 (默认: speech-2.8-hd)"
    )
    parser.add_argument(
        "-s", "--speed", type=float, default=1.0, help="语速 0.5-2.0 (默认: 1.0)"
    )
    parser.add_argument("--vol", type=int, default=10, help="音量 0-10 (默认: 10)")
    parser.add_argument(
        "-p", "--pitch", type=float, default=1.0, help="音调 0.5-2.0 (默认: 1.0)"
    )

    args = parser.parse_args()

    try:
        text_to_speech(
            text=args.text,
            output_file=args.output,
            voice_id=args.voice,
            model=args.model,
            speed=args.speed,
            vol=args.vol,
            pitch=args.pitch,
        )
    except Exception as e:
        print(f"❌ 错误: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
