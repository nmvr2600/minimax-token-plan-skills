#!/usr/bin/env bun
/**
 * Minimax Image01 文生图脚本
 * 用法: bun run skills/minimax-image/scripts/generate.ts "prompt文本" [--aspect-ratio 16:9] [--output-dir .] [--prefix cat_flying]
 */

import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";

// 自定义错误类
class MinimaxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MinimaxError";
  }
}

interface GenerateImageOptions {
  prompt: string;
  apiKey?: string;
  model?: string;
  aspectRatio?: string;
  outputDir?: string;
  responseFormat?: "base64" | "url";
  n?: number;
  filenamePrefix?: string;
}

interface ImageGenerationResponse {
  data?: {
    image_base64?: string[];
    image_urls?: string[];
  };
  base_resp?: {
    status_code?: number;
    status_msg?: string;
  };
}

/**
 * 调用 Minimax Image01 API 生成图片
 */
async function generateImage(options: GenerateImageOptions): Promise<string[]> {
  const {
    prompt,
    apiKey: providedKey,
    model = "image-01",
    aspectRatio = "1:1",
    outputDir = ".",
    responseFormat = "base64",
    n = 1,
    filenamePrefix,
  } = options;

  // 获取 API Key
  const apiKey = providedKey || process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new MinimaxError("MINIMAX_API_KEY environment variable is not set");
  }

  // 支持通过环境变量切换域名（中文站/国际站）
  const apiHost = process.env.MINIMAX_API_HOST || "https://api.minimaxi.com";
  const url = `${apiHost}/v1/image_generation`;

  const payload = {
    model,
    prompt,
    aspect_ratio: aspectRatio,
    response_format: responseFormat,
    n: Math.min(n, 9), // 最多9张
  };

  console.log(`正在生成 ${n} 张图片...`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new MinimaxError(`HTTP 错误: ${response.status} - ${response.statusText}`);
  }

  const data = (await response.json()) as ImageGenerationResponse;

  // 检查 API 错误
  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new MinimaxError(`API 错误: ${data.base_resp.status_msg}`);
  }

  const outputPaths: string[] = [];
  const outputPath = resolve(outputDir);
  await mkdir(outputPath, { recursive: true });

  // 生成文件名前缀
  const timestamp = Math.floor(Date.now() / 1000);
  const baseName = filenamePrefix || `image_${timestamp}`;

  if (responseFormat === "base64") {
    const images = data.data?.image_base64 || [];
    for (let i = 0; i < images.length; i++) {
      const imgB64 = images[i];
      const imgData = Buffer.from(imgB64, "base64");
      // 单张时不加序号，多张时加 _0, _1, _2...
      const fileName = n === 1 ? `${baseName}.jpeg` : `${baseName}_${i}.jpeg`;
      const filePath = join(outputPath, fileName);
      await Bun.write(filePath, imgData);
      outputPaths.push(filePath);
      console.log(`已保存: ${filePath}`);
    }
  } else {
    // url 格式
    const images = data.data?.image_urls || [];
    for (let i = 0; i < images.length; i++) {
      const imgUrl = images[i];
      const fileName = n === 1 ? `${baseName}.jpeg` : `${baseName}_${i}.jpeg`;
      const filePath = join(outputPath, fileName);

      // 下载图片
      const imgResponse = await fetch(imgUrl);
      if (!imgResponse.ok) {
        throw new MinimaxError(`下载图片失败: ${imgResponse.status}`);
      }
      const imgData = await imgResponse.arrayBuffer();
      await Bun.write(filePath, imgData);
      outputPaths.push(filePath);
      console.log(`已保存: ${filePath} (URL: ${imgUrl})`);
    }
  }

  return outputPaths;
}

// 显示帮助信息
function showHelp(): void {
  console.log("Minimax Image01 文生图脚本");
  console.log("");
  console.log("用法: generate.ts <prompt> [选项]");
  console.log("");
  console.log("选项:");
  console.log("  -h, --help          显示此帮助信息");
  console.log("  -r, --aspect-ratio  宽高比 (默认: 1:1)");
  console.log("  -o, --output-dir    输出目录 (默认: .)");
  console.log("  -f, --format        返回格式: base64 或 url (默认: base64)");
  console.log("  -n, --n             生成数量 1-9 (默认: 1)");
  console.log("  -p, --prefix        文件名前缀");
  console.log("");
  console.log("示例:");
  console.log('  bun run generate.ts "a cute cat"');
  console.log('  bun run generate.ts "a cute cat" -n 4 -r 16:9');
  console.log('  bun run generate.ts "a cute cat" -o ./images -p cat');
}

// 解析命令行参数
function parseArgs(): {
  prompt: string;
  aspectRatio: string;
  outputDir: string;
  format: "base64" | "url";
  n: number;
  prefix?: string;
} {
  const args = process.argv.slice(2);

  // 检查帮助标志
  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const prompt = args[0];
  let aspectRatio = "1:1";
  let outputDir = ".";
  let format: "base64" | "url" = "base64";
  let n = 1;
  let prefix: string | undefined;

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "-r":
      case "--aspect-ratio":
        aspectRatio = nextArg;
        i++;
        break;
      case "-o":
      case "--output-dir":
        outputDir = nextArg;
        i++;
        break;
      case "-f":
      case "--format":
        if (nextArg === "base64" || nextArg === "url") {
          format = nextArg;
        }
        i++;
        break;
      case "-n":
      case "--n":
        n = parseInt(nextArg, 10) || 1;
        if (n < 1 || n > 9) {
          throw new MinimaxError("生成数量必须在 1-9 之间");
        }
        i++;
        break;
      case "-p":
      case "--prefix":
        prefix = nextArg;
        i++;
        break;
    }
  }

  return { prompt, aspectRatio, outputDir, format, n, prefix };
}

// 主函数
async function main(): Promise<void> {
  try {
    const { prompt, aspectRatio, outputDir, format, n, prefix } = parseArgs();

    const paths = await generateImage({
      prompt,
      aspectRatio,
      outputDir,
      responseFormat: format,
      n,
      filenamePrefix: prefix,
    });

    console.log(`\n成功! 共生成 ${paths.length} 张图片`);
  } catch (error) {
    if (error instanceof MinimaxError) {
      console.error(`错误: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`错误: ${error.message}`);
    } else {
      console.error("发生未知错误");
    }
    process.exit(1);
  }
}

// 运行主函数
main();
