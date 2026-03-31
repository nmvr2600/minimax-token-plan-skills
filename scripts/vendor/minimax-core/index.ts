/**
 * minimax-core - MiniMax Skills 共享核心包
 *
 * 提供错误类、类型定义、API 工具函数
 */

// 错误类
export { MinimaxError, MinimaxAuthError, MinimaxRequestError } from "./errors.js";

// 类型定义
export type {
  BaseResp,
  ModelRemain,
  UsageResponse,
  TTSOptions,
  CreateTaskResponse,
  QueryTaskResponse,
  FileRetrieveResponse,
  SubjectReference,
  GenerateImageOptions,
  ImageGenerationResponse,
  AnalysisResponse,
  SearchResponse,
} from "./types.js";

// API 工具
export { getConfig, makeRequest, DEFAULT_API_HOST } from "./api.js";
export type { ApiConfig } from "./api.js";
