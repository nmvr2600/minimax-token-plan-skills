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

import {
  MinimaxAuthError,
  MinimaxRequestError,
  getConfig,
  makeRequest,
} from "../../../scripts/vendor/minimax-core";

// 执行网页搜索
async function webSearch(apiKey: string, apiHost: string, query: string): Promise<unknown> {
  if (!query) {
    throw new MinimaxRequestError("搜索关键词不能为空");
  }

  const payload = { q: query };
  return makeRequest(apiKey, apiHost, "/v1/coding_plan/search", payload);
}

// 显示帮助信息
function showHelp(): void {
  console.log("MiniMax Web Search Script");
  console.log("");
  console.log("用法: search.ts <搜索关键词>");
  console.log("");
  console.log("选项:");
  console.log("  -h, --help      显示此帮助信息");
  console.log("");
  console.log("环境变量:");
  console.log("  MINIMAX_API_KEY     必需，MiniMax API 密钥");
  console.log("  MINIMAX_API_HOST    可选，API 主机地址（默认: https://api.minimaxi.com）");
  console.log("");
  console.log("示例:");
  console.log('  bun run search.ts "Python 教程"');
  console.log('  bun run search.ts "2024年 AI 发展趋势"');
}

// 主函数
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // 检查帮助标志
  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const query = args[0];

  try {
    const { apiKey, apiHost } = getConfig("https://api.minimaxi.com");
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
