import type { Logger, LogLevel } from './types/config.js';

/**
 * Sensitive field names that must be redacted from log output.
 */
const SENSITIVE_KEYS = new Set([
  'secretKey',
  'keySecret',
  'token',
  'accessToken',
  'password',
  'cvv',
  'cvc',
  'cardNumber',
  'clientSecret',
  'webhookSecret',
]);

/**
 * Creates a default console-based logger.
 */
export function createDefaultLogger(): Logger {
  return {
    debug: (message, data) => console.debug(`[paykit] ${message}`, data ?? ''),
    info: (message, data) => console.info(`[paykit] ${message}`, data ?? ''),
    warn: (message, data) => console.warn(`[paykit] ${message}`, data ?? ''),
    error: (message, data) => console.error(`[paykit] ${message}`, data ?? ''),
  };
}

/**
 * Log level numeric priorities for filtering.
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
};

/**
 * Logger that filters by minimum log level and redacts sensitive data.
 */
export interface OperationLogger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

/**
 * Creates an operation logger that wraps a Logger with level filtering and data redaction.
 *
 * @param logger - The underlying logger (or undefined for no-op).
 * @param level - Minimum log level to emit.
 * @returns An OperationLogger that filters and redacts.
 */
export function createOperationLogger(
  logger: Logger | undefined,
  level: LogLevel,
): OperationLogger {
  const minPriority = LOG_LEVEL_PRIORITY[level];

  const noop = () => {};

  if (!logger || level === 'none') {
    return { debug: noop, info: noop, warn: noop, error: noop };
  }

  const shouldLog = (msgLevel: LogLevel) =>
    LOG_LEVEL_PRIORITY[msgLevel] >= minPriority;

  return {
    debug: (message, data) =>
      shouldLog('debug') && logger.debug(message, redact(data)),
    info: (message, data) =>
      shouldLog('info') && logger.info(message, redact(data)),
    warn: (message, data) =>
      shouldLog('warn') && logger.warn(message, redact(data)),
    error: (message, data) =>
      shouldLog('error') && logger.error(message, redact(data)),
  };
}

/**
 * Deep-redacts sensitive fields from a data object.
 * Returns a new object with sensitive values replaced by `'[REDACTED]'`.
 * Primitives and non-plain objects are returned as-is.
 */
export function redact(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(redact);
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key)) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redact(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
