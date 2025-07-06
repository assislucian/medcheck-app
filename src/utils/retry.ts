interface RetryOptions {
  retries: number;
  factor: number;
  minTimeout: number;
  maxTimeout: number;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  let lastError: Error;
  let attempt = 0;

  while (attempt < options.retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempt++;

      if (attempt === options.retries) {
        throw lastError;
      }

      // Calculate exponential backoff
      const timeout = Math.min(
        options.minTimeout * Math.pow(options.factor, attempt),
        options.maxTimeout,
      );

      await new Promise((resolve) => setTimeout(resolve, timeout));
    }
  }

  throw lastError!;
}

export function isRetryableError(error: Error): boolean {
  // Add specific error types that should be retried
  const retryableErrors = [
    "ECONNRESET",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "EPIPE",
    "EHOSTUNREACH",
    "ENETUNREACH",
    "ENOTFOUND",
  ];

  return (
    retryableErrors.some((code) => error.message.includes(code)) ||
    error.message.toLowerCase().includes("timeout") ||
    error.message.toLowerCase().includes("network") ||
    error.message.toLowerCase().includes("connection")
  );
}

export function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> {
  const defaultOptions: RetryOptions = {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 5000,
  };

  return retry(fn, { ...defaultOptions, ...options });
}
