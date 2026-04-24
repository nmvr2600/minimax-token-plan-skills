#!/usr/bin/env bun
/**
 * MiniMax 语音合成脚本
 * 用法: bun run skills/minimax-speech/scripts/tts.ts "要转换的文本" [--output output.mp3] [--voice female-tianmei] [--subtitle]
 */

import { MinimaxError } from "../../../scripts/vendor/minimax-core";
import type {
  TTSOptions,
  CreateTaskResponse,
  QueryTaskResponse,
  FileRetrieveResponse,
} from "../../../scripts/vendor/minimax-core";
import { writeFileSync } from "fs";
import { join, dirname } from "path";

/**
 * 从 tar 包中提取 mp3 文件
 * 纯 TypeScript 实现，不依赖外部 tar 命令
 */
function extractMp3FromTar(tarData: ArrayBuffer): Uint8Array | null {
  const data = new Uint8Array(tarData);
  let offset = 0;

  while (offset < data.length) {
    // 读取文件名 (0-99 bytes)
    const nameBytes = data.slice(offset, offset + 100);
    const name = new TextDecoder().decode(nameBytes).replace(/\0/g, "").trim();

    // 空文件名表示结束
    if (name === "") break;

    // 读取文件大小 (124-135 bytes, 八进制)
    const sizeBytes = data.slice(offset + 124, offset + 136);
    const sizeStr = new TextDecoder().decode(sizeBytes).replace(/\0/g, "").trim();
    const fileSize = parseInt(sizeStr, 8);

    if (isNaN(fileSize)) {
      offset += 512;
      continue;
    }

    // 文件内容起始位置 (头之后)
    const contentOffset = offset + 512;

    // 检查是否是 mp3 文件
    if (name.endsWith(".mp3") && fileSize > 0) {
      return data.slice(contentOffset, contentOffset + fileSize);
    }

    // 跳到下一个文件头 (512 字节对齐)
    const blockSize = Math.ceil(fileSize / 512) * 512;
    offset += 512 + blockSize;
  }

  return null;
}

/**
 * 将毫秒时间格式化为 SRT 时间格式 (HH:MM:SS,mmm)
 */
function formatSrtTime(ms: number): string {
  const msInt = Math.floor(ms);
  const hours = Math.floor(msInt / 3600000);
  const minutes = Math.floor((msInt % 3600000) / 60000);
  const seconds = Math.floor((msInt % 60000) / 1000);
  const milliseconds = msInt % 1000;
  
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},${String(milliseconds).padStart(3, "0")}`;
}

/**
 * 将字幕数据转换为 SRT 格式
 */
function convertToSrt(subtitles: Array<{text: string; time_begin: number; time_end: number}>): string {
  const lines: string[] = [];
  subtitles.forEach((item, index) => {
    const startTime = formatSrtTime(item.time_begin);
    const endTime = formatSrtTime(item.time_end);
    lines.push(`${index + 1}`);
    lines.push(`${startTime} --> ${endTime}`);
    lines.push(item.text);
    lines.push("");
  });
  return lines.join("\n");
}

/**
 * 同步语音合成 - 短文本直接返回音频数据
 * @returns hex 编码的音频数据和可选的字幕链接
 */
async function synthesizeSpeechSync(
  apiKey: string,
  apiHost: string,
  text: string,
  voiceId: string,
  model: string,
  speed: number,
  vol: number,
  pitch: number,
  enableSubtitle: boolean = false,
): Promise<{audio: string; subtitleFile?: string}> {
  const url = `${apiHost}/v1/t2a_v2`;

  const payload: any = {
    model: model,
    text: text,
    voice_setting: {
      voice_id: voiceId,
      speed: speed,
      vol: vol,
      pitch: Math.floor(pitch),
    },
    audio_setting: {
      sample_rate: 44100,
      bitrate: 256000,
      format: "mp3",
      channel: 2,
    },
  };
  
  // 开启字幕功能
  if (enableSubtitle) {
    payload.subtitle_enable = true;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new MinimaxError(`HTTP 错误: ${response.status}`);
  }

  const result = (await response.json()) as CreateTaskResponse & {data?: {subtitle_file?: string}};

  if (result.base_resp && result.base_resp.status_code !== 0) {
    throw new MinimaxError(`API 错误: ${result.base_resp.status_msg}`);
  }

  if (!result.data?.audio) {
    throw new MinimaxError("同步接口未返回音频数据");
  }

  return {
    audio: result.data.audio,
    subtitleFile: result.data.subtitle_file,
  };
}

/**
 * 异步语音合成 - 长文本返回任务 ID
 * @returns task_id，需要轮询查询结果
 */
async function createSpeechTaskAsync(
  apiKey: string,
  apiHost: string,
  text: string,
  voiceId: string,
  model: string,
  speed: number,
  vol: number,
  pitch: number,
  enableSubtitle: boolean = false,
): Promise<string> {
  const url = `${apiHost}/v1/t2a_async_v2`;

  const payload: any = {
    model: model,
    text: text,
    voice_setting: {
      voice_id: voiceId,
      speed: speed,
      vol: vol,
      pitch: Math.floor(pitch),
    },
    audio_setting: {
      sample_rate: 44100,
      bitrate: 256000,
      format: "mp3",
      channel: 2,
    },
  };
  
  // 开启字幕功能
  if (enableSubtitle) {
    payload.subtitle_enable = true;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new MinimaxError(`HTTP 错误: ${response.status}`);
  }

  const result = (await response.json()) as CreateTaskResponse;

  if (result.base_resp && result.base_resp.status_code !== 0) {
    throw new MinimaxError(`API 错误: ${result.base_resp.status_msg}`);
  }

  if (!result.task_id) {
    throw new MinimaxError("异步接口未返回任务 ID");
  }

  return result.task_id;
}

/**
 * 下载并保存字幕文件
 */
async function downloadSubtitle(subtitleUrl: string, outputPath: string): Promise<void> {
  const response = await fetch(subtitleUrl);
  if (!response.ok) {
    throw new MinimaxError(`下载字幕失败: ${response.status}`);
  }
  
  const subtitleContent = await response.text();
  const subtitles = JSON.parse(subtitleContent);
  
  // 保存 JSON 格式
  writeFileSync(outputPath, subtitleContent, "utf-8");
  
  // 保存 SRT 格式
  const srtPath = outputPath.replace(/\.json$/, ".srt");
  const srtContent = convertToSrt(subtitles);
  writeFileSync(srtPath, srtContent, "utf-8");
  
  console.log(`✅ 字幕 JSON: ${outputPath}`);
  console.log(`✅ 字幕 SRT: ${srtPath}`);
}

/**
 * 查询任务状态
 */
async function queryTask(
  apiKey: string,
  apiHost: string,
  taskId: string,
): Promise<QueryTaskResponse> {
  const url = `${apiHost}/v1/query/t2a_async_query_v2?task_id=${taskId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new MinimaxError(`HTTP 错误: ${response.status}`);
  }

  const result = (await response.json()) as QueryTaskResponse;
  return result;
}

/**
 * 下载音频文件
 */
async function downloadAudio(
  apiKey: string,
  apiHost: string,
  fileId: string,
  outputPath: string,
): Promise<boolean> {
  // 获取下载链接
  const url = `${apiHost}/v1/files/retrieve?file_id=${fileId}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new MinimaxError(`获取下载链接失败: ${response.status}`);
  }

  const result = (await response.json()) as FileRetrieveResponse;
  const downloadUrl = result.file?.download_url;

  if (!downloadUrl) {
    throw new MinimaxError("未获取到下载链接");
  }

  // 下载 tar 包
  const tarResponse = await fetch(downloadUrl);
  if (!tarResponse.ok) {
    throw new MinimaxError(`下载 tar 包失败: ${tarResponse.status}`);
  }

  const tarData = await tarResponse.arrayBuffer();

  // 解压 tar 包获取 mp3 (纯 TS 实现)
  const mp3Data = extractMp3FromTar(tarData);
  if (!mp3Data) {
    throw new MinimaxError("未在 tar 包中找到 mp3 文件");
  }

  await Bun.write(outputPath, mp3Data);
  return true;
}

// 同步/异步分界线
// 同步接口限制 < 10000 字符，超过 3000 字符推荐异步或流式
const SYNC_TEXT_LENGTH_LIMIT = 3000;

/**
 * 完整的文本转语音流程
 * - 短文本（≤3000字）：同步接口，直接返回音频数据
 * - 长文本（>3000字）：异步接口，轮询查询任务状态
 */
async function textToSpeech(options: TTSOptions & { enableSubtitle?: boolean }): Promise<string> {
  const {
    text,
    outputFile = "output.mp3",
    voiceId = "male-qn-jingying",
    model = "speech-2.8-hd",
    speed = 1.0,
    vol = 1,
    pitch = 0,
    apiKey: providedKey,
    apiHost: providedHost,
    enableSubtitle = false,
  } = options;

  const apiKey = providedKey || Bun.env.MINIMAX_API_KEY;
  let apiHost = providedHost || Bun.env.MINIMAX_API_HOST;

  if (!apiKey) {
    throw new MinimaxError("MINIMAX_API_KEY 环境变量未设置");
  }

  if (!apiHost) {
    apiHost = "https://api.minimaxi.com";
  }

  if (text.length > 100000) {
    throw new MinimaxError(`文本过长: ${text.length} 字符，最大支持 10 万字符`);
  }

  let audioData: string;
  let subtitleFile: string | undefined;

  if (text.length <= SYNC_TEXT_LENGTH_LIMIT) {
    // 短文本：同步接口
    console.log("🎙️ 正在同步合成语音...");
    if (enableSubtitle) {
      console.log("📝 已开启字幕功能");
    }
    const result = await synthesizeSpeechSync(
      apiKey,
      apiHost,
      text,
      voiceId,
      model,
      speed,
      vol,
      pitch,
      enableSubtitle,
    );
    audioData = result.audio;
    subtitleFile = result.subtitleFile;
  } else {
    // 长文本：异步接口
    console.log(`🎙️ 文本较长（${text.length}字），正在创建异步任务...`);
    if (enableSubtitle) {
      console.log("📝 已开启字幕功能");
    }
    const taskId = await createSpeechTaskAsync(
      apiKey,
      apiHost,
      text,
      voiceId,
      model,
      speed,
      vol,
      pitch,
      enableSubtitle,
    );
    console.log(`✓ 任务已创建: ${taskId}`);

    const result = await pollTaskResult(apiKey, apiHost, taskId, enableSubtitle);
    audioData = result.audio;
    subtitleFile = result.subtitleFile;
  }

  // 解码并保存音频（API 返回 hex 编码）
  const bytes = Buffer.from(audioData, "hex");

  await Bun.write(outputFile, bytes);
  console.log(`✅ 音频已保存: ${outputFile}`);

  // 下载字幕文件
  if (enableSubtitle && subtitleFile) {
    const subtitleOutput = outputFile.replace(/\.mp3$/, "_subtitle.json");
    await downloadSubtitle(subtitleFile, subtitleOutput);
  }

  return outputFile;
}

/**
 * 轮询异步任务直到返回音频数据
 */
async function pollTaskResult(
  apiKey: string, 
  apiHost: string, 
  taskId: string,
  enableSubtitle: boolean = false,
): Promise<{ audio: string; subtitleFile?: string }> {
  const maxRetries = 60;

  for (let i = 0; i < maxRetries; i++) {
    const result = await queryTask(apiKey, apiHost, taskId);
    const status = result.status || (result.data && result.data.status) || "unknown";

    if (status.toLowerCase() === "success") {
      const fileId = result.file_id || (result.data && result.data.file_id);
      console.log("✓ 任务完成，正在下载音频...");
      await downloadAudio(apiKey, apiHost, fileId as string, "/tmp/tts_async_result.mp3");

      // 读取下载的音频文件并返回 base64
      const fileData = await Bun.file("/tmp/tts_async_result.mp3").arrayBuffer();
      const base64 = Buffer.from(fileData).toString("base64");
      
      // 获取字幕文件链接（如果开启）
      let subtitleFile: string | undefined;
      if (enableSubtitle) {
        subtitleFile = result.data?.extra_info?.subtitle_file;
      }
      
      return { audio: base64, subtitleFile };
    } else if (status.toLowerCase() === "failed") {
      throw new MinimaxError("语音合成任务失败");
    }

    if (i % 5 === 0) {
      console.log(`  等待中... (${i + 1}/${maxRetries})`);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new MinimaxError("等待任务超时");
}

// 显示帮助信息
function showHelp(): void {
  console.log("MiniMax 语音合成脚本");
  console.log("");
  console.log("用法: tts.ts <文本> [选项]");
  console.log("   或: tts.ts --text-file <文件路径> [选项]");
  console.log("");
  console.log("选项:");
  console.log("  -h, --help       显示此帮助信息");
  console.log("  -f, --text-file  从文件读取文本（使用 - 从 stdin 读取）");
  console.log("  -o, --output     输出文件路径 (默认: output.mp3)");
  console.log("  -v, --voice      音色ID (默认: Chinese (Mandarin)_Reliable_Executive)");
  console.log("  -m, --model      语音模型 (默认: speech-2.8-hd)");
  console.log("  -s, --speed      语速 0.5-2.0 (默认: 1.0)");
  console.log("      --vol        音量 0-10 (默认: 1)");
  console.log("  -p, --pitch      音调 -12 到 12 的整数 (默认: 0)");
  console.log("      --subtitle   同时生成字幕文件");
  console.log("");
  console.log("示例:");
  console.log('  bun run tts.ts "你好世界"');
  console.log('  bun run tts.ts "你好世界" -o hello.mp3 -v male-qn-qingse');
  console.log('  bun run tts.ts --text-file script.txt -o output.mp3');
  console.log('  echo "你好世界" | bun run tts.ts --text-file -');
  console.log('  bun run tts.ts "你好世界" --speed 1.2 --vol 8');
  console.log('  bun run tts.ts "你好世界" -o hello.mp3 --subtitle');
}

// 解析命令行参数
function parseArgs(): {
  text: string | null;
  textFile: string | null;
  output: string;
  voice: string;
  model: string;
  speed: number;
  vol: number;
  pitch: number;
  subtitle: boolean;
} {
  const args = process.argv.slice(2);

  // 检查帮助标志
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(0);
  }

  if (args.length === 0) {
    showHelp();
    process.exit(1);
  }

  let text: string | null = null;
  let textFile: string | null = null;
  let output = "output.mp3";
  let voice = "Chinese (Mandarin)_Reliable_Executive";
  let model = "speech-2.8-hd";
  let speed = 1.0;
  let vol = 1;
  let pitch = 0;
  let subtitle = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // 第一个非选项参数作为文本
    if (!arg.startsWith("-")) {
      if (text === null && textFile === null) {
        text = arg;
      }
      continue;
    }

    const nextArg = args[i + 1];

    switch (arg) {
      case "-f":
      case "--text-file":
        textFile = nextArg;
        i++;
        break;
      case "-o":
      case "--output":
        output = nextArg;
        i++;
        break;
      case "-v":
      case "--voice":
        voice = nextArg;
        i++;
        break;
      case "-m":
      case "--model":
        model = nextArg;
        i++;
        break;
      case "-s":
      case "--speed":
        speed = parseFloat(nextArg) || 1.0;
        if (speed < 0.5 || speed > 2.0) {
          throw new MinimaxError("语速必须在 0.5-2.0 之间");
        }
        i++;
        break;
      case "--vol":
        vol = parseInt(nextArg, 10);
        if (isNaN(vol)) vol = 1;
        if (vol < 0 || vol > 10) {
          throw new MinimaxError("音量必须在 0-10 之间");
        }
        i++;
        break;
      case "-p":
      case "--pitch":
        pitch = parseInt(nextArg, 10);
        if (isNaN(pitch)) pitch = 0;
        if (pitch < -12 || pitch > 12) {
          throw new MinimaxError("音调必须是 -12 到 12 之间的整数");
        }
        i++;
        break;
      case "--subtitle":
        subtitle = true;
        break;
    }
  }

  return { text, textFile, output, voice, model, speed, vol, pitch, subtitle };
}

// 主函数
async function main(): Promise<void> {
  try {
    const { text, textFile, output, voice, model, speed, vol, pitch, subtitle } = parseArgs();

    let finalText = text;

    // 从文件或 stdin 读取文本
    if (!finalText && textFile) {
      if (textFile === "-") {
        finalText = await Bun.stdin.text();
      } else {
        const file = Bun.file(textFile);
        if (!(await file.exists())) {
          throw new MinimaxError(`文本文件不存在: ${textFile}`);
        }
        finalText = await file.text();
      }
    }

    if (!finalText || finalText.trim().length === 0) {
      throw new MinimaxError("请提供要合成的文本，或使用 --text-file 指定文件");
    }

    await textToSpeech({
      text: finalText.trim(),
      outputFile: output,
      voiceId: voice,
      model,
      speed,
      vol,
      pitch,
      enableSubtitle: subtitle,
    });
  } catch (error) {
    if (error instanceof MinimaxError) {
      console.error(`❌ 错误: ${error.message}`);
    } else if (error instanceof Error) {
      console.error(`❌ 错误: ${error.message}`);
    } else {
      console.error("❌ 发生未知错误");
    }
    process.exit(1);
  }
}

// 运行主函数
main();
