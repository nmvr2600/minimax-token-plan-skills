#!/usr/bin/env bun
/**
 * MiniMax Image Analysis Script
 * 使用 Bun/TypeScript 实现的 MiniMax 图像理解功能
 *
 * 使用方法:
 *     1. 设置环境变量:
 *         export MINIMAX_API_KEY="your-api-key"
 *         export MINIMAX_API_HOST="https://api.minimax.chat"  # 可选，默认值
 *
 *     2. 运行图像分析:
 *         bun run skills/minimax-image-analysis/scripts/analyze.ts "图像路径或URL" [提示词]
 *
 *         不传提示词时自动使用全面默认分析（理解内容 + 提取文字）
 *
 *     3. 输出: 图像分析结果
 *
 * 支持的图像格式:
 *     - HTTP/HTTPS URL: "https://example.com/image.jpg"
 *     - 本地文件路径:
 *         - 相对路径: "images/photo.png"
 *         - 绝对路径: "/Users/username/Documents/image.jpg"
 *     - Base64 Data URL: "data:image/jpeg;base64,..."
 *
 *     支持格式: JPEG, PNG, WebP
 */

import { exists } from "node:fs/promises";
import {
  MinimaxAuthError,
  MinimaxRequestError,
  getConfig,
  makeRequest,
} from "../../../scripts/vendor/minimax-core";
import type { AnalysisResponse } from "../../../scripts/vendor/minimax-core";

// 默认提示词 - 全面分析图像内容并提取文本
const DEFAULT_PROMPT = `请全面分析这张图像：

1. **图像概述**：描述图像的主体内容、场景、氛围等基本信息

2. **详细内容**：
   - 识别并描述所有可见的文字、数字、符号
   - 描述图像中的人物、物体、动作、表情
   - 描述背景环境、颜色风格等视觉元素

3. **文字提取**：请逐字提取图像中出现的所有文字内容（包括标题、正文、标签、Logo文字、水印等），保留原有排版格式

4. **关键信息**：总结图像传达的核心信息或意图

请用结构化的方式输出分析结果。如果图像中没有文字，请明确说明。`;

/**
 * 处理图像 URL 并转换为 base64 data URL 格式
 */
async function processImageUrl(imageUrl: string): Promise<string> {
  // 移除 @ 前缀（某些场景下会带 @ 前缀）
  if (imageUrl.startsWith("@")) {
    imageUrl = imageUrl.slice(1);
  }

  // 如果已经是 base64 data URL 格式，直接返回
  if (imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  // 处理 HTTP/HTTPS URL
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    try {
      const response = await fetch(imageUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (!response.ok) {
        throw new MinimaxRequestError(`下载图像失败: HTTP ${response.status}`);
      }

      const imageData = await response.arrayBuffer();

      // 从 content-type 头检测图像格式
      const contentType = response.headers.get("content-type") || "";
      let imageFormat = "jpeg";
      if (contentType.includes("jpeg") || contentType.includes("jpg")) {
        imageFormat = "jpeg";
      } else if (contentType.includes("png")) {
        imageFormat = "png";
      } else if (contentType.includes("webp")) {
        imageFormat = "webp";
      }

      // 转换为 base64 data URL
      const base64Data = Buffer.from(imageData).toString("base64");
      return `data:image/${imageFormat};base64,${base64Data}`;
    } catch (error) {
      if (error instanceof MinimaxRequestError) throw error;
      throw new MinimaxRequestError(`下载图像失败: ${(error as Error).message}`);
    }
  }

  // 处理本地文件路径
  const fileExists = await exists(imageUrl);
  if (!fileExists) {
    throw new MinimaxRequestError(`本地图像文件不存在: ${imageUrl}`);
  }

  try {
    const file = Bun.file(imageUrl);
    const imageData = await file.arrayBuffer();

    // 根据文件扩展名检测图像格式
    let imageFormat = "jpeg";
    const lowerPath = imageUrl.toLowerCase();
    if (lowerPath.endsWith(".png")) {
      imageFormat = "png";
    } else if (lowerPath.endsWith(".webp")) {
      imageFormat = "webp";
    } else if (lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg")) {
      imageFormat = "jpeg";
    }

    const base64Data = Buffer.from(imageData).toString("base64");
    return `data:image/${imageFormat};base64,${base64Data}`;
  } catch (error) {
    throw new MinimaxRequestError(`读取本地图像文件失败: ${(error as Error).message}`);
  }
}

/**
 * 分析图像内容
 */
async function analyzeImage(
  apiKey: string,
  apiHost: string,
  imageSource: string,
  prompt?: string,
): Promise<string> {
  if (!imageSource) {
    throw new MinimaxRequestError("图像源不能为空");
  }

  // 使用默认提示词（如果未提供）
  const finalPrompt = prompt || DEFAULT_PROMPT;

  // 处理图像：转换为 base64 data URL
  const processedImageUrl = await processImageUrl(imageSource);

  const payload = {
    prompt: finalPrompt,
    image_url: processedImageUrl,
  };

  const result = (await makeRequest(
    apiKey,
    apiHost,
    "/v1/coding_plan/vlm",
    payload,
  )) as AnalysisResponse;

  // 提取分析结果
  const content = result.content || "";
  if (!content) {
    throw new MinimaxRequestError("VLM API 未返回内容");
  }

  return content;
}

// 显示帮助信息
function showHelp(): void {
  console.log("MiniMax Image Analysis Script");
  console.log("");
  console.log("用法: analyze.ts <图像路径或URL> [提示词]");
  console.log("");
  console.log("选项:");
  console.log("  -h, --help      显示此帮助信息");
  console.log("");
  console.log("环境变量:");
  console.log("  MINIMAX_API_KEY     必需，MiniMax API 密钥");
  console.log("  MINIMAX_API_HOST    可选，API 主机地址（默认: https://api.minimax.chat）");
  console.log("");
  console.log("示例:");
  console.log('  bun run analyze.ts "photo.jpg"');
  console.log('  bun run analyze.ts "photo.jpg" "描述这张图片"');
  console.log('  bun run analyze.ts "https://example.com/image.jpg"');
}

// 主函数
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // 检查帮助标志
  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const imageSource = args[0];
  // 提示词可选，默认为全面分析提示词
  const prompt = args[1];

  try {
    const { apiKey, apiHost } = getConfig("https://api.minimax.chat");
    const result = await analyzeImage(apiKey, apiHost, imageSource, prompt);

    // 输出分析结果
    console.log(result);
  } catch (error) {
    if (error instanceof MinimaxAuthError) {
      console.error(`认证错误: ${error.message}`);
      process.exit(1);
    } else if (error instanceof MinimaxRequestError) {
      console.error(`请求错误: ${error.message}`);
      process.exit(1);
    } else {
      console.error(`未知错误: ${(error as Error).message}`);
      process.exit(1);
    }
  }
}

// 运行主函数
main();
