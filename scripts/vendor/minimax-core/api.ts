/**
 * MiniMax API 工具函数
 * 提供配置获取和 HTTP 请求封装
 */

import { MinimaxAuthError, MinimaxRequestError } from "./errors.js";
import type { BaseResp } from "./types.js";

/**
 * API 配置
 */
export interface ApiConfig {
  apiKey: string;
  apiHost: string;
}

/**
 * 默认 API 主机地址
 */
export const DEFAULT_API_HOST = "https://api.minimaxi.com";

/**
 * 从环境变量获取配置
 */
export function getConfig(defaultHost: string = DEFAULT_API_HOST): ApiConfig {
  const apiKey = process.env.MINIMAX_API_KEY;
  const apiHost = process.env.MINIMAX_API_HOST || defaultHost;

  if (!apiKey) {
    throw new MinimaxRequestError("MINIMAX_API_KEY environment variable is not set");
  }

  return { apiKey, apiHost };
}

/**
 * 发送 HTTP 请求到 MiniMax API
 * 自动处理错误状态码和 API 错误返回
 */
export async function makeRequest(
  apiKey: string,
  apiHost: string,
  endpoint: string,
  payload: unknown,
  options: { method?: string; headers?: Record<string, string> } = {},
): Promise<unknown> {
  const url = `${apiHost}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: options.method || "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "MM-API-Source": "Minimax-Standalone-Script",
        ...options.headers,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new MinimaxRequestError(`HTTP 错误: ${response.status} - ${response.statusText}`);
    }

    const result = (await response.json()) as { base_resp?: BaseResp };

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
