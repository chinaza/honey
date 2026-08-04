import { Request, Response } from 'express';

/**
 * Convert milliseconds to a human-readable format.
 * - Sub-millisecond: microseconds (e.g., `500μs`)
 * - Normal range: milliseconds with 2 decimals (e.g., `15.23ms`)
 * - Over 1 second: seconds (e.g., `1.56s`)
 */
const formatTime = (ms: number): string => {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

/**
 * Return a human-readable status label for the given HTTP status code.
 */
const statusText = (status: number): string => {
  if (status < 300) return 'OK';
  if (status < 400) return 'REDIR';
  if (status < 500) return 'CLIENT_ERR';
  return 'SERVER_ERR';
};

/**
 * Return ANSI color code based on HTTP status code.
 * - Green (32): 2xx Success
 * - Cyan (36):  3xx Redirect
 * - Yellow (33): 4xx Client Error
 * - Red (31):   5xx Server Error
 */
const statusColor = (status: number): string => {
  if (status < 300) return '32';
  if (status < 400) return '36';
  if (status < 500) return '33';
  return '31';
};

/**
 * Request logger middleware.
 * Logs each request with: status code, status text, method, path, and duration.
 *
 * Example output:
 *   200 OK GET /api                  15.23ms
 *   304 REDIR GET /api/working-hours 2.45ms
 *   404 CLIENT_ERR POST /api/data    0.89ms
 *   500 SERVER_ERR GET /api/error    120.56ms
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: () => void
): void => {
  const start = performance.now();

  res.on('finish', () => {
    const durationMs = performance.now() - start;
    const method = req.method.padEnd(7);
    const path = (req.originalUrl || req.url).padEnd(40);
    const status = String(res.statusCode).padEnd(4);
    const color = statusColor(res.statusCode);

    console.log(
      `\x1b[${color}m${status} ${statusText(res.statusCode)}\x1b[0m ${method} ${path} ${formatTime(durationMs)}`
    );
  });

  next();
};
