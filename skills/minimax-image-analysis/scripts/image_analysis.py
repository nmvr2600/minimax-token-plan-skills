#!/usr/bin/env python3
"""
Standalone MiniMax Image Analysis Script
使用标准库实现的 MiniMax 图像理解功能，无第三方依赖

使用方法:
    1. 设置环境变量:
        export MINIMAX_API_KEY="your-api-key"
        export MINIMAX_API_HOST="https://api.minimax.chat"  # 可选，默认值

    2. 运行图像分析:
        python3 image_analysis.py "图像路径或URL" [提示词]

        不传提示词时自动使用全面默认分析（理解内容 + 提取文字）

    3. 输出: 图像分析结果

环境变量:
    MINIMAX_API_KEY: MiniMax API 密钥 (必需)
    MINIMAX_API_HOST: API 主机地址 (可选，默认: https://api.minimax.chat)

支持的图像格式:
    - HTTP/HTTPS URL: "https://example.com/image.jpg"
    - 本地文件路径:
        - 相对路径: "images/photo.png"
        - 绝对路径: "/Users/username/Documents/image.jpg"
    - Base64 Data URL: "data:image/jpeg;base64,..."

    支持格式: JPEG, PNG, WebP
"""

import os
import sys
import json
import base64
from urllib import request, error


class MinimaxAuthError(Exception):
    """认证错误"""

    pass


class MinimaxRequestError(Exception):
    """请求错误"""

    pass


def get_config():
    """
    从环境变量获取配置

    Returns:
        tuple: (api_key, api_host)

    Raises:
        MinimaxRequestError: 配置缺失时抛出
    """
    api_key = os.getenv("MINIMAX_API_KEY")
    api_host = os.getenv("MINIMAX_API_HOST", "https://api.minimax.chat")

    if not api_key:
        raise MinimaxRequestError("MINIMAX_API_KEY 环境变量未设置")

    return api_key, api_host


# 默认提示词 - 全面分析图像内容并提取文本
DEFAULT_PROMPT = """请全面分析这张图像：

1. **图像概述**：描述图像的主体内容、场景、氛围等基本信息

2. **详细内容**：
   - 识别并描述所有可见的文字、数字、符号
   - 描述图像中的人物、物体、动作、表情
   - 描述背景环境、颜色风格等视觉元素

3. **文字提取**：请逐字提取图像中出现的所有文字内容（包括标题、正文、标签、Logo文字、水印等），保留原有排版格式

4. **关键信息**：总结图像传达的核心信息或意图

请用结构化的方式输出分析结果。如果图像中没有文字，请明确说明。"""


def process_image_url(image_url: str):
    """
    处理图像 URL 并转换为 base64 data URL 格式

    支持三种类型的图像输入:
    1. HTTP/HTTPS URL: 下载图像并转换为 base64
    2. Base64 data URL: 直接传递
    3. 本地文件路径: 读取文件并转换为 base64

    Args:
        image_url: 图像 URL、data URL 或本地文件路径

    Returns:
        str: Base64 data URL，格式为 "data:image/{format};base64,{data}"

    Raises:
        MinimaxRequestError: 图像无法下载、读取或处理时抛出
    """
    # 移除 @ 前缀（某些场景下会带 @ 前缀）
    if image_url.startswith("@"):
        image_url = image_url[1:]

    # 如果已经是 base64 data URL 格式，直接返回
    if image_url.startswith("data:"):
        return image_url

    # 处理 HTTP/HTTPS URL
    if image_url.startswith(("http://", "https://")):
        try:
            req = request.Request(
                image_url, headers={"User-Agent": "Mozilla/5.0"}, method="GET"
            )
            with request.urlopen(req) as response:
                image_data = response.read()

                # 从 content-type 头检测图像格式
                content_type = response.headers.get("content-type", "").lower()
                if "jpeg" in content_type or "jpg" in content_type:
                    image_format = "jpeg"
                elif "png" in content_type:
                    image_format = "png"
                elif "webp" in content_type:
                    image_format = "webp"
                else:
                    # 无法检测时默认为 jpeg
                    image_format = "jpeg"

                # 转换为 base64 data URL
                base64_data = base64.b64encode(image_data).decode("utf-8")
                return f"data:image/{image_format};base64,{base64_data}"

        except error.HTTPError as e:
            raise MinimaxRequestError(f"下载图像失败: HTTP {e.code} - {e.reason}")
        except error.URLError as e:
            raise MinimaxRequestError(f"下载图像失败: {e.reason}")

    # 处理本地文件路径
    else:
        if not os.path.exists(image_url):
            raise MinimaxRequestError(f"本地图像文件不存在: {image_url}")

        try:
            with open(image_url, "rb") as f:
                image_data = f.read()

                # 根据文件扩展名检测图像格式
                image_format = "jpeg"  # 默认
                if image_url.lower().endswith(".png"):
                    image_format = "png"
                elif image_url.lower().endswith(".webp"):
                    image_format = "webp"
                elif image_url.lower().endswith((".jpg", ".jpeg")):
                    image_format = "jpeg"

                base64_data = base64.b64encode(image_data).decode("utf-8")
                return f"data:image/{image_format};base64,{base64_data}"

        except IOError as e:
            raise MinimaxRequestError(f"读取本地图像文件失败: {e}")


def make_request(api_key, api_host, payload):
    """
    发送 HTTP 请求到 MiniMax VLM API

    Args:
        api_key: API 密钥
        api_host: API 主机地址
        payload: 请求数据字典

    Returns:
        dict: API 响应数据

    Raises:
        MinimaxAuthError: 认证失败
        MinimaxRequestError: 请求失败
    """
    url = f"{api_host}/v1/coding_plan/vlm"

    # 准备请求数据
    data = json.dumps(payload).encode("utf-8")

    # 构建请求
    req = request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "MM-API-Source": "Minimax-Standalone-Script",
        },
        method="POST",
    )

    try:
        with request.urlopen(req) as response:
            response_data = response.read().decode("utf-8")
            result = json.loads(response_data)

        # 检查 API 响应状态码
        base_resp = result.get("base_resp", {})
        if base_resp.get("status_code") != 0:
            status_code = base_resp.get("status_code")
            status_msg = base_resp.get("status_msg", "")

            if status_code == 1004:
                raise MinimaxAuthError(
                    f"API 错误: {status_msg}, 请检查 API key 和 API host"
                )
            elif status_code == 2038:
                raise MinimaxRequestError(f"API 错误: {status_msg}, 需要完成实名认证")
            else:
                raise MinimaxRequestError(f"API 错误: {status_code}-{status_msg}")

        return result

    except error.HTTPError as e:
        raise MinimaxRequestError(f"HTTP 错误: {e.code} - {e.reason}")
    except error.URLError as e:
        raise MinimaxRequestError(f"连接错误: {e.reason}")
    except json.JSONDecodeError:
        raise MinimaxRequestError("响应数据解析失败")


def analyze_image(api_key, api_host, image_source, prompt=None):
    """
    分析图像内容

    Args:
        api_key: API 密钥
        api_host: API 主机地址
        prompt: 分析提示词
        image_source: 图像源 (URL 或本地路径)

    Returns:
        str: 图像分析结果
    """
    if not image_source:
        raise MinimaxRequestError("图像源不能为空")
    # 使用默认提示词（如果未提供）
    if not prompt:
        prompt = DEFAULT_PROMPT

    # 处理图像：转换为 base64 data URL
    processed_image_url = process_image_url(image_source)

    payload = {"prompt": prompt, "image_url": processed_image_url}

    result = make_request(api_key, api_host, payload)

    # 提取分析结果
    content = result.get("content", "")
    if not content:
        raise MinimaxRequestError("VLM API 未返回内容")

    return content


def main():
    """主函数"""
    # 检查命令行参数
    if len(sys.argv) < 2:
        print(f"用法: {sys.argv[0]} <图像路径或URL> [提示词]", file=sys.stderr)
        print(f'示例: {sys.argv[0]} "photo.jpg"', file=sys.stderr)
        print(f'示例: {sys.argv[0]} "photo.jpg" "描述这张图片"', file=sys.stderr)
        print(f"（不传提示词时使用默认全面分析提示词）", file=sys.stderr)
        sys.exit(1)

    image_source = sys.argv[1]
    # 提示词可选，默认为全面分析提示词
    prompt = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_PROMPT

    try:
        api_key, api_host = get_config()
        result = analyze_image(api_key, api_host, image_source, prompt)

        # 输出分析结果
        print(result)

    except MinimaxAuthError as e:
        print(f"认证错误: {e}", file=sys.stderr)
        sys.exit(1)
    except MinimaxRequestError as e:
        print(f"请求错误: {e}", file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n操作已取消", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"未知错误: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
