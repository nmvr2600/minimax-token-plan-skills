/**
 * MiniMax 错误类定义
 * 集中管理所有自定义错误类型
 */

/**
 * 基础错误类
 */
export class MinimaxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MinimaxError";
  }
}

/**
 * 认证错误 - API Key 无效或缺失
 */
export class MinimaxAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MinimaxAuthError";
  }
}

/**
 * 请求错误 - API 请求失败或返回错误状态
 */
export class MinimaxRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MinimaxRequestError";
  }
}
