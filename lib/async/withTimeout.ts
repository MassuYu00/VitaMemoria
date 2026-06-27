interface TimeoutOptions {
  timeoutMs: number;
  message: string;
}

export function withTimeout<T>(promise: Promise<T>, options: TimeoutOptions): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(options.message));
    }, options.timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    clearTimeout(timeoutId);
  });
}
