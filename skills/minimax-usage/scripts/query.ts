#!/usr/bin/env bun
/**
 * MiniMax 用量查询脚本
 * 用法: bun run skills/minimax-usage/scripts/query.ts
 */

import { MinimaxError, getConfig } from "../../../scripts/vendor/minimax-core";
import type { ModelRemain, UsageResponse } from "../../../scripts/vendor/minimax-core";

/**
 * 格式化日期时间
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 格式化剩余时间
 */
function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

/**
 * 查询账户用量
 */
async function queryUsage(apiKey: string, apiHost: string): Promise<void> {
  const url = `${apiHost}/v1/api/openplatform/coding_plan/remains`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new MinimaxError(`HTTP 错误: ${response.status}`);
  }

  const data = (await response.json()) as UsageResponse;

  // 检查 API 错误
  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new MinimaxError(`API 错误: ${data.base_resp.status_msg}`);
  }

  // 打印表头
  console.log("================================");
  console.log("    Minimax Account Usage");
  console.log("================================");
  console.log("");

  // 打印每个模型的用量信息
  const models = data.model_remains || [];
  for (const model of models) {
    const modelName = model.model_name;
    const total = model.current_interval_total_count;
    const remaining = model.current_interval_usage_count;
    const remains = model.remains_time;
    const startTs = model.start_time;
    const endTs = model.end_time;

    const used = total - remaining;
    const usagePercent = total === 0 ? 0.0 : ((used / total) * 100).toFixed(1);

    const startDate = formatDate(startTs);
    const endDate = formatDate(endTs);
    const timeRemaining = formatDuration(remains);

    console.log(`Model: ${modelName}`);
    console.log("--------------------------------");
    console.log(`  Period:         ${startDate} to ${endDate}`);
    console.log(`  Quota:          ${total} requests`);
    console.log(`  Used:           ${used} requests (${usagePercent}%)`);
    console.log(`  Remaining:      ${remaining} requests`);
    console.log(`  Resets In:      ${timeRemaining}`);
    console.log("");
  }

  // 打印表尾
  console.log("================================");
  console.log(`Query Time: ${formatDate(Date.now())}`);
  console.log("================================");
}

// 显示帮助信息
function showHelp(): void {
  console.log("MiniMax Usage Query Script");
  console.log("");
  console.log("用法: query.ts [选项]");
  console.log("");
  console.log("选项:");
  console.log("  -h, --help      显示此帮助信息");
  console.log("");
  console.log("环境变量:");
  console.log("  MINIMAX_API_KEY     必需，MiniMax API 密钥");
  console.log("  MINIMAX_API_HOST    可选，API 主机地址（默认: https://www.minimaxi.com）");
  console.log("");
  console.log("示例:");
  console.log("  bun run query.ts");
  console.log("  MINIMAX_API_HOST=https://api.minimaxi.com bun run query.ts");
}

// 主函数
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // 检查帮助标志
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(0);
  }

  // 检查环境变量
  const apiKey = Bun.env.MINIMAX_API_KEY;
  if (!apiKey) {
    console.error("Error: MINIMAX_API_KEY environment variable is not set");
    console.error("Please run: export MINIMAX_API_KEY='your_api_key'");
    process.exit(1);
  }

  // 支持通过环境变量切换域名（中文站/国际站）
  const apiHost = Bun.env.MINIMAX_API_HOST || "https://www.minimaxi.com";

  try {
    await queryUsage(apiKey, apiHost);
  } catch (error) {
    if (error instanceof MinimaxError) {
      console.error(`Error: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("Error: Failed to connect to Minimax API");
    }
    process.exit(1);
  }
}

// 运行主函数
main();
