function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isGeminiQuotaError(error: unknown): boolean {
  if (!isRecord(error) && !(error instanceof Error)) {
    return false;
  }

  const status = isRecord(error) ? error.status : undefined;
  const statusText = isRecord(error) ? error.statusText : undefined;
  const message = error instanceof Error ? error.message : String(isRecord(error) ? error.message ?? '' : '');

  return (
    status === 429 ||
    statusText === 'Too Many Requests' ||
    message.includes('429 Too Many Requests') ||
    message.includes('You exceeded your current quota') ||
    message.includes('Quota exceeded')
  );
}

export function isGeminiTimeoutError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(isRecord(error) ? error.message ?? '' : '');

  return message.includes('Gemini API') && message.includes('timed out');
}

export function isGeminiNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(isRecord(error) ? error.message ?? '' : '');

  return message.includes('GoogleGenerativeAI Error') && message.includes('fetch failed');
}
