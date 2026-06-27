import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini/client';
import { isGeminiNetworkError, isGeminiQuotaError, isGeminiTimeoutError } from '@/lib/gemini/errors';
import type { SkillName } from '@/lib/types';

interface AnalyzeInput {
  logs: Array<{
    title: string;
    description?: string;
    emotions: string[];
    aiTags?: string[];
  }>;
}

interface SkillAnalysis {
  skills: Record<SkillName, number>; // 0-100
  insights: string[];
  monthlyReport: string;
}

export async function POST(req: NextRequest) {
  try {
    const { logs }: AnalyzeInput = await req.json();

    if (logs.length === 0) {
      return NextResponse.json({
        skills: {
          '探求心': 10, '創造性': 10, '共感力': 10,
          '行動力': 10, '挑戦心': 10, 'つながり力': 10,
        },
        insights: ['まずは体験を記録してみましょう！'],
        monthlyReport: '体験ログを積み重ねることで、あなたの成長が見えてきます。',
      });
    }

    const prompt = `
あなたは非認知能力の成長分析AIです。
以下のユーザーの体験ログを分析して、6つのスキルスコアを算出してください。

【体験ログ】
${logs.map((log, i) => `
${i + 1}. タイトル: ${log.title}
   感情: ${log.emotions.join('、')}
   説明: ${log.description || 'なし'}
   タグ: ${(log.aiTags || []).join('、')}
`).join('\n')}

【スキル定義】
- 探求心: 新しいことを探求し、好奇心を持って深掘りする力
- 創造性: 独自のアイデアや表現を生み出すクリエイティブな力
- 共感力: 他者の感情や状況を理解し、寄り添う力
- 行動力: 思い立ったらすぐ動き、物事を実現させる力
- 挑戦心: 困難に立ち向かい、新しいことに挑戦し続ける力
- つながり力: 人・場所・自然との豊かなつながりを築く力

【出力形式】
{
  "skills": {
    "探求心": 0〜100の数値,
    "創造性": 0〜100の数値,
    "共感力": 0〜100の数値,
    "行動力": 0〜100の数値,
    "挑戦心": 0〜100の数値,
    "つながり力": 0〜100の数値
  },
  "insights": [
    "気づき1（体験ログから読み取れる特徴）",
    "気づき2",
    "気づき3"
  ],
  "monthlyReport": "今月の成長サマリー（150文字程度）"
}
`;

    const analysis = await generateJSON<SkillAnalysis>(prompt);
    return NextResponse.json({ ...analysis, success: true });
  } catch (error) {
    if (isGeminiQuotaError(error) || isGeminiTimeoutError(error) || isGeminiNetworkError(error)) {
      console.warn('Gemini unavailable. Returning demo skill analysis.');
      return NextResponse.json({
        skills: {
          '探求心': 55, '創造性': 50, '共感力': 60,
          '行動力': 52, '挑戦心': 48, 'つながり力': 58,
        },
        insights: ['Gemini APIの利用枠に達したため、デモ分析を表示しています。'],
        monthlyReport: 'API利用枠が回復すると、記録内容に基づいた分析が表示されます。',
        success: true,
        demo: true,
        quotaExceeded: true,
      });
    }

    console.error('Skill analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
