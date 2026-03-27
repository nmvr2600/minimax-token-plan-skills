#!/usr/bin/env python3
"""
MiniMax Web Search Script
使用标准库实现的 MiniMax 搜索功能，无第三方依赖

使用方法:
    1. 设置环境变量:
        export MINIMAX_API_KEY="your-api-key"
        export MINIMAX_API_HOST="https://api.minimaxi.com"  # 可选，默认值

    2. 运行搜索:
        python3 standalone_search.py "搜索关键词"

    3. 输出: JSON 格式的搜索结果
"""

import os
import sys
import json
from urllib import request, error


class MinimaxAuthError(Exception):
    """认证错误"""

    pass


class MinimaxRequestError(Exception):
    """请求错误"""

    pass


def get_config():
    """从环境变量获取配置"""
    api_key = os.getenv("MINIMAX_API_KEY")
    api_host = os.getenv("MINIMAX_API_HOST", "https://api.minimaxi.com")

    if not api_key:
        raise MinimaxRequestError("MINIMAX_API_KEY environment variable is not set")

    return api_key, api_host


def make_request(api_key, api_host, endpoint, payload):
    """发送 HTTP 请求到 MiniMax API"""
    url = f"{api_host}{endpoint}"
    data = json.dumps(payload).encode("utf-8")

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

        base_resp = result.get("base_resp", {})
        if base_resp.get("status_code") != 0:
            status_code = base_resp.get("status_code")
            status_msg = base_resp.get("status_msg", "")

            if status_code == 1004:
                raise MinimaxAuthError(f"API 错误: {status_msg}")
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


def web_search(api_key, api_host, query):
    """执行网页搜索"""
    if not query:
        raise MinimaxRequestError("搜索关键词不能为空")

    payload = {"q": query}
    return make_request(api_key, api_host, "/v1/coding_plan/search", payload)


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print(f"用法: {sys.argv[0]} <搜索关键词>", file=sys.stderr)
        sys.exit(1)

    query = sys.argv[1]

    try:
        api_key, api_host = get_config()
        result = web_search(api_key, api_host, query)
        print(json.dumps(result, ensure_ascii=False, indent=2))

    except MinimaxAuthError as e:
        print(f"认证错误: {e}", file=sys.stderr)
        sys.exit(1)
    except MinimaxRequestError as e:
        print(f"请求错误: {e}", file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n操作已取消", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
