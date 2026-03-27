#!/usr/bin/env bun
/**
 * MiniMax Web Search Script
 * 使用 Bun/TypeScript 实现的 MiniMax 搜索功能
 *
 * 使用方法:
 *     1. 设置环境变量:
 *         export MINIMAX_API_KEY="your-api-key"
 *         export MINIMAX_API_HOST="https://api.minimaxi.com"  # 可选，默认值
 *
 *     2. 运行搜索:
 *         bun run skills/minimax-search/scripts/search.ts "搜索关键词"
 *
 *     3. 输出: JSON 格式的搜索结果
 */

// 自定义错误类
class MinimaxAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MinimaxAuthError";
  }
}

class MinimaxRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MinimaxRequestError";
  }
}

// 从环境变量获取配置
function getConfig(): { apiKey: string; apiHost: string } {
  const apiKey = process.env.MINIMAX_API_KEY;
  const apiHost = process.env.MINIMAX_API_HOST || "https://api.minimaxi.com";

  if (!apiKey) {
    throw new MinimaxRequestError("MINIMAX_API_KEY environment variable is not set");
  }

  return { apiKey, apiHost };
}

// 发送 HTTP 请求到 MiniMax API
async function makeRequest(
  apiKey: string,
  apiHost: string,
  endpoint: string,
  payload: unknown
): Promise<unknown> {
  const url = `${apiHost}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "MM-API-Source": "Minimax-Standalone-Script",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new MinimaxRequestError(`HTTP 错误: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json() as { base_resp?: { status_code?: number; status_msg?: string } };

    // 检查 API 响应状态码
    const baseResp = result.base_resp || {};
    if (baseResp.status_code !== 0) {
      const statusCode = baseResp.status_code;
      const statusMsg = baseResp.status_msg || "";

      if (statusCode === 1004) {
        throw new MinimaxAuthError(`API 错误: ${statusMsg}`);
      } else if (statusCode === 2038) {
        throw new MinimaxRequestError(`API 错误: ${statusMsg}, 需要完成实名认证`);
      } else {
        throw new MinimaxRequestError(`API 错误: ${statusCode}-${statusMsg}`);
      }
    }

    return result;
  } catch (error) {
    if (error instanceof MinimaxAuthError || error instanceof MinimaxRequestError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new MinimaxRequestError(`请求失败: ${error.message}`);
    }
    throw new MinimaxRequestError("请求失败: 未知错误");
  }
}

// 执行网页搜索
async function webSearch(apiKey: string, apiHost: string, query: string): Promise<unknown> {
  if (!query) {
    throw new MinimaxRequestError("搜索关键词不能为空");
  }

  const payload = { q: query };
  return makeRequest(apiKey, apiHost, "/v1/coding_plan/search", payload);
}

// 主函数
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error(`用法: ${process.argv[1]} <搜索关键词>`);
    process.exit(1);
  }

  const query = args[0];

  try {
    const { apiKey, apiHost } = getConfig();
    const result = await webSearch(apiKey, apiHost, query);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    if (error instanceof MinimaxAuthError) {
      console.error(`认证错误: ${error.message}`);
      process.exit(1);
    } else if (error instanceof MinimaxRequestError) {
      console.error(`请求错误: ${error.message}`);
      process.exit(1);
    } else if (error instanceof Error) {
      console.error(`未知错误: ${error.message}`);
      process.exit(1);
    }
  }
}

// 运行主函数
main();
