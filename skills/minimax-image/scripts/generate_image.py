#!/usr/bin/env python3
"""
Minimax Image01 文生图脚本
用法: python generate_image.py "prompt文本" [--aspect-ratio 16:9] [--output-dir .]
"""

import base64
import argparse
import os
import sys
import requests
from pathlib import Path


def generate_image(
    prompt: str,
    api_key: str = None,
    model: str = "image-01",
    aspect_ratio: str = "1:1",
    output_dir: str = ".",
    response_format: str = "base64",
    n: int = 1,
) -> list[str]:
    """
    调用 Minimax Image01 API 生成图片

    Args:
        prompt: 文本描述
        api_key: API密钥，默认从 MINIMAX_API_KEY 环境变量获取
        model: 模型名称，默认 image-01
        aspect_ratio: 宽高比，支持 16:9, 4:3, 3:2, 2:3, 3:4, 9:16, 21:9, 1:1
        output_dir: 输出目录
        response_format: 返回格式，base64 或 url
        n: 生成数量，1-9

    Returns:
        图片路径列表
    """
    url = "https://api.minimaxi.com/v1/image_generation"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    payload = {
        "model": model,
        "prompt": prompt,
        "aspect_ratio": aspect_ratio,
        "response_format": response_format,
        "n": min(n, 9),  # 最多9张
    }

    print(f"正在生成 {n} 张图片...")
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()

    data = response.json()
    output_paths = []
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    if response_format == "base64":
        images = data["data"]["image_base64"]
        for i, img_b64 in enumerate(images):
            img_data = base64.b64decode(img_b64)
            file_path = output_path / f"image_{i}.jpeg"
            with open(file_path, "wb") as f:
                f.write(img_data)
            output_paths.append(str(file_path))
            print(f"已保存: {file_path}")
    else:  # url
        images = data["data"]["image_urls"]
        for i, img_url in enumerate(images):
            file_path = output_path / f"image_{i}.jpeg"
            # 下载图片
            img_response = requests.get(img_url)
            img_response.raise_for_status()
            with open(file_path, "wb") as f:
                f.write(img_response.content)
            output_paths.append(str(file_path))
            print(f"已保存: {file_path} (URL: {img_url})")

    return output_paths


def main():
    # 检查 API 密钥
    api_key = os.environ.get("MINIMAX_API_KEY")
    if not api_key:
        print("错误: 未设置 MINIMAX_API_KEY 环境变量", file=sys.stderr)
        print("请先设置: export MINIMAX_API_KEY='your_api_key'", file=sys.stderr)
        sys.exit(1)

    parser = argparse.ArgumentParser(description="Minimax Image01 文生图")
    parser.add_argument("prompt", help="图片描述文本")
    parser.add_argument(
        "--aspect-ratio",
        "-r",
        default="1:1",
        help="宽高比: 16:9, 4:3, 3:2, 2:3, 3:4, 9:16, 21:9, 1:1 (默认 1:1)",
    )
    parser.add_argument(
        "--output-dir", "-o", default=".", help="输出目录 (默认当前目录)"
    )
    parser.add_argument(
        "--format",
        "-f",
        choices=["base64", "url"],
        default="base64",
        help="返回格式: base64 或 url (默认 base64)",
    )
    parser.add_argument("--n", "-n", type=int, default=1, help="生成数量 1-9 (默认 1)")

    args = parser.parse_args()

    try:
        paths = generate_image(
            prompt=args.prompt,
            api_key=api_key,
            aspect_ratio=args.aspect_ratio,
            output_dir=args.output_dir,
            response_format=args.format,
            n=args.n,
        )
        print(f"\n成功! 共生成 {len(paths)} 张图片")
    except Exception as e:
        print(f"错误: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
