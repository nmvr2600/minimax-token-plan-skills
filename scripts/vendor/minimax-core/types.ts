/**
 * MiniMax API 类型定义
 * 集中管理所有 API 响应类型和接口
 */

// ============ 通用类型 ============

/**
 * API 基础响应结构
 */
export interface BaseResp {
  status_code?: number;
  status_msg?: string;
}

// ============ 用量查询相关 ============

/**
 * 模型用量信息
 */
export interface ModelRemain {
  model_name: string;
  current_interval_total_count: number;
  current_interval_usage_count: number;
  remains_time: number;
  start_time: number;
  end_time: number;
}

/**
 * 用量查询响应
 */
export interface UsageResponse {
  model_remains?: ModelRemain[];
  base_resp?: BaseResp;
}

// ============ 语音合成相关 ============

/**
 * TTS 选项
 */
export interface TTSOptions {
  text: string;
  outputFile?: string;
  voiceId?: string;
  model?: string;
  speed?: number;
  vol?: number;
  pitch?: number;
  apiKey?: string;
  apiHost?: string;
}

/**
 * 创建语音任务响应（同步/异步共用）
 */
export interface CreateTaskResponse {
  task_id?: string;
  data?: {
    audio?: string; // hex 编码的音频数据（同步）
  };
  base_resp?: BaseResp;
}

/**
 * 查询任务状态响应
 */
export interface QueryTaskResponse {
  status?: string;
  file_id?: string;
  data?: {
    status?: string;
    file_id?: string;
  };
  base_resp?: BaseResp;
}

/**
 * 文件获取响应
 */
export interface FileRetrieveResponse {
  file?: {
    download_url?: string;
  };
  base_resp?: BaseResp;
}

// ============ 文生图相关 ============

/**
 * 主体参考参数（图生图）
 */
export interface SubjectReference {
  type: string; // 目前仅支持 "character"
  image_file: string; // 公网 URL 或 data:image/jpeg;base64,{data}
}

/**
 * 文生图选项
 */
export interface GenerateImageOptions {
  prompt: string;
  apiKey?: string;
  model?: string;
  aspectRatio?: string;
  outputDir?: string;
  responseFormat?: "base64" | "url";
  n?: number;
  filenamePrefix?: string;
  subjectReference?: SubjectReference;
}

/**
 * 图片生成响应
 */
export interface ImageGenerationResponse {
  data?: {
    image_base64?: string[];
    image_urls?: string[];
  };
  base_resp?: BaseResp;
}

// ============ 图片分析相关 ============

/**
 * 图片分析响应
 */
export interface AnalysisResponse {
  content?: string;
  base_resp?: BaseResp;
}

// ============ 搜索相关 ============

/**
 * 搜索响应
 */
export interface SearchResponse {
  base_resp?: BaseResp;
  [key: string]: unknown;
}
