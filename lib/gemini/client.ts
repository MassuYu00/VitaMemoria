import { GoogleGenerativeAI, Tool } from '@google/generative-ai';
import { withTimeout } from '@/lib/async/withTimeout';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const GEMINI_TIMEOUT_MS = 20_000;

// 通常モデル（構造化JSON生成用）
export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.85,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
});

// Google Search グラウンディング対応モデル（最新イベント情報取得用）
// gemini-2.0-flash は googleSearch ツールをサポート
export const geminiSearchModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.75,
    topK: 40,
    topP: 0.9,
    maxOutputTokens: 4096,
  },
  tools: [{ googleSearch: {} } as Tool],
});

export async function generateText(prompt: string): Promise<string> {
  const result = await withTimeout(geminiModel.generateContent(prompt), {
    timeoutMs: GEMINI_TIMEOUT_MS,
    message: 'Gemini API request timed out',
  });
  return result.response.text();
}

export async function generateTextWithSearch(prompt: string): Promise<string> {
  const result = await withTimeout(geminiSearchModel.generateContent(prompt), {
    timeoutMs: GEMINI_TIMEOUT_MS,
    message: 'Gemini API search request timed out',
  });
  return result.response.text();
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const fullPrompt = `${prompt}\n\n必ずJSON形式のみで回答してください。マークダウンのコードブロックは使わないでください。`;
  const text = await generateText(fullPrompt);

  // Clean up any markdown code blocks if present
  const cleaned = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  return JSON.parse(cleaned) as T;
}

// Google Search グラウンディングでテキスト取得後、JSONにパース
export async function generateJSONWithSearch<T>(prompt: string): Promise<T> {
  const fullPrompt = `${prompt}\n\n必ずJSON形式のみで回答してください。マークダウンのコードブロックは使わないでください。`;
  const text = await generateTextWithSearch(fullPrompt);

  const cleaned = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  return JSON.parse(cleaned) as T;
}
