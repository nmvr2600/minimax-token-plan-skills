#!/usr/bin/env bun
/**
 * MiniMax 查询可用音色
 * 用法: bun run skills/minimax-speech/scripts/voices.ts [--type system|voice_cloning|voice_generation|all]
 */

interface GetVoiceResponse {
  system_voice?: SystemVoice[];
  voice_cloning?: VoiceCloning[];
  voice_generation?: VoiceGeneration[];
  base_resp?: {
    status_code?: number;
    status_msg?: string;
  };
}

interface SystemVoice {
  voice_id: string;
  voice_name: string;
  description: string[];
}

interface VoiceCloning {
  voice_id: string;
  description: string[];
  created_time: string;
}

interface VoiceGeneration {
  voice_id: string;
  description: string[];
  created_time: string;
}

/**
 * 获取音色列表
 */
async function getVoices(
  apiKey: string,
  apiHost: string,
  voiceType: string = "all",
): Promise<GetVoiceResponse> {
  const url = `${apiHost}/v1/get_voice`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ voice_type: voiceType }),
  });

  if (!response.ok) {
    throw new Error(`HTTP 错误: ${response.status}`);
  }

  const result = (await response.json()) as GetVoiceResponse;

  if (result.base_resp && result.base_resp.status_code !== 0) {
    throw new Error(`API 错误: ${result.base_resp.status_msg}`);
  }

  return result;
}

/**
 * 格式化输出音色列表
 */
function formatVoices(response: GetVoiceResponse): string {
  const lines: string[] = [];

  if (response.system_voice && response.system_voice.length > 0) {
    lines.push("## 系统音色 (System)\n");
    for (const voice of response.system_voice) {
      lines.push(`### ${voice.voice_name}`);
      lines.push(`- ID: \`${voice.voice_id}\``);
      if (voice.description && voice.description.length > 0) {
        lines.push(`- 描述: ${voice.description.join(" ")}`);
      }
      lines.push("");
    }
  }

  if (response.voice_cloning && response.voice_cloning.length > 0) {
    lines.push("## 快速复刻音色 (Voice Cloning)\n");
    for (const voice of response.voice_cloning) {
      lines.push(`- ID: \`${voice.voice_id}\``);
      if (voice.description && voice.description.length > 0) {
        lines.push(`  描述: ${voice.description.join(" ")}`);
      }
      lines.push(`  创建时间: ${voice.created_time}`);
      lines.push("");
    }
  }

  if (response.voice_generation && response.voice_generation.length > 0) {
    lines.push("## 文生音色 (Voice Generation)\n");
    for (const voice of response.voice_generation) {
      lines.push(`- ID: \`${voice.voice_id}\``);
      if (voice.description && voice.description.length > 0) {
        lines.push(`  描述: ${voice.description.join(" ")}`);
      }
      lines.push(`  创建时间: ${voice.created_time}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}

function showHelp(): void {
  console.log(`
MiniMax 查询可用音色

用法:
  bun run ${import.meta.path} [选项]

选项:
  --type, -t <type>  查询的音色类型 (默认: all)
                      可选值:
                        system - 系统音色
                        voice_cloning - 快速复刻音色
                        voice_generation - 文生音色
                        all - 全部音色

示例:
  bun run ${import.meta.path}
  bun run ${import.meta.path} --type system
  bun run ${import.meta.path} -t voice_cloning
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    return;
  }

  let voiceType = "all";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--type" || args[i] === "-t") {
      voiceType = args[i + 1] || "all";
      i++;
    }
  }

  const apiKey = process.env.MINIMAX_API_KEY;
  let apiHost = process.env.MINIMAX_API_HOST || "https://api.minimaxi.com";

  if (!apiKey) {
    console.error("错误: MINIMAX_API_KEY 环境变量未设置");
    process.exit(1);
  }

  console.log(`正在查询音色列表 (类型: ${voiceType})...\n`);

  try {
    const result = await getVoices(apiKey, apiHost, voiceType);
    console.log(formatVoices(result));
  } catch (error) {
    console.error(`错误: ${error instanceof Error ? error.message : "未知错误"}`);
    process.exit(1);
  }
}

main();
