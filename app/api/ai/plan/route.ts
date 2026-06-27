import { NextRequest, NextResponse } from 'next/server';
import { generateJSONWithSearch, generateJSON } from '@/lib/gemini/client';
import { isGeminiNetworkError, isGeminiQuotaError, isGeminiTimeoutError } from '@/lib/gemini/errors';
import type { Plan, PlanInput } from '@/lib/types';

// 簡易インメモリキャッシュ（開発・デモ時のAPIリミット対策）
const planCache = new Map<string, { plans: Plan[], timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1時間

const demoPlans: Plan[] = [
  {
    id: 'mock_1',
    title: '早朝の神社めぐりと朝食',
    description: '人が少ない早朝の神社は空気が澄んでいて清々しい。参拝後は近くの老舗喫茶でモーニングを楽しもう。',
    location: '地元の神社 → 近隣喫茶店',
    duration: '2〜3時間',
    budget: '500円〜1,500円',
    category: 'カルチャー',
    emoji: '⛩️',
    reason: 'リフレッシュしたい気分にぴったり。静かな朝の時間で心が整います。',
    tips: ['7時前に訪問すると空いています', '神社によっては御朱印がもらえます', '歩きやすい靴で行きましょう'],
    tags: ['神社', '朝活', '散歩'],
  },
  {
    id: 'mock_2',
    title: '地元マルシェ探索',
    description: '週末に開催されるファーマーズマーケットやクラフトマルシェへ。地元の生産者と会話しながら旬の食材や手作り品を発見。',
    location: '近隣のマルシェ・朝市',
    duration: '2〜4時間',
    budget: '1,000円〜5,000円',
    category: 'グルメ',
    emoji: '🛒',
    reason: '発見と交流の体験ができる場所。予算内で楽しめます。',
    tips: ['午前中が商品が揃っています', 'エコバッグを持参しよう', '試食を積極的に楽しもう'],
    tags: ['マルシェ', '食', '地域'],
  },
];

function demoPlanResponse() {
  return NextResponse.json({
    plans: demoPlans,
    success: true,
    demo: true,
    quotaExceeded: true,
    message: 'Gemini APIの利用枠に達したため、デモプランを表示しています。',
  });
}

export async function POST(req: NextRequest) {
  try {
    const input: PlanInput = await req.json();

    const companionLabel = {
      solo: 'ひとり',
      couple: 'カップル',
      friends: '友人グループ',
      family: '家族',
    }[input.companion];

    // キャッシュキーの生成（条件が同じならキャッシュを返す）
    const cacheKey = JSON.stringify({
      mood: input.mood,
      budget: input.budgetMax,
      area: input.area,
      companion: input.companion,
      interests: input.interests,
    });

    const cached = planCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Returning plans from cache');
      return NextResponse.json({ plans: cached.plans, success: true, fromCache: true });
    }

    // 現在の日付情報（イベント検索の精度向上のため）
    const now = new Date();
    const dateStr = now.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
    const thisWeekend = getUpcomingWeekend(now);

    const prompt = `
あなたは日本の週末体験を提案するライフスタイルAIアシスタントです。
Google検索を使って最新情報を調べながら、ユーザーに最適な週末のお出かけプランを5つ提案してください。

【今日の日付】
${dateStr}

【今週末の日程】
${thisWeekend}

【ユーザーの状況】
- 今の気分: ${input.moodEmoji} ${input.mood}
- 予算: ${input.budgetMin}円〜${input.budgetMax}円
- 行動エリア: ${input.area}
- 同行者: ${companionLabel}
- 興味・関心: ${input.interests.join('、')}

【重要：最新イベント情報の検索】
Google検索を使って、以下を必ず調べてください：
- 「${input.area} 週末 イベント ${now.getFullYear()}年${now.getMonth() + 1}月」
- 「${input.area} ${input.interests[0] || 'お出かけ'} 今週末」
- 「${input.area} ${input.interests[1] || '体験'} 開催中」

検索結果を踏まえた上で、実際に開催されているまたは開催予定のイベントや体験を優先的に提案してください。
定常的なスポット（公園・美術館など）とイベント（期間限定の展示・フェス・マルシェなど）を混ぜて提案するのが理想的です。

【出力形式】
以下のJSON配列形式で5つのプランを返してください:
[
  {
    "id": "plan_1",
    "title": "プランのタイトル（魅力的な30文字以内）",
    "description": "プランの説明（100文字程度）。最新イベントの場合は開催期間や日程も含める",
    "location": "具体的な場所名や施設名・地域名",
    "duration": "所要時間（例: 2〜3時間）",
    "budget": "概算費用（例: 1,500円〜3,000円）",
    "category": "カテゴリ（例: アウトドア/カルチャー/グルメ/スポーツ/アート/リラックス/イベント）",
    "emoji": "プランを表す絵文字（1文字）",
    "reason": "このユーザーにおすすめする理由（50文字程度）",
    "tips": ["お役立ちTips1", "お役立ちTips2", "お役立ちTips3"],
    "tags": ["タグ1", "タグ2", "タグ3"],
    "isEvent": true または false,
    "eventDate": "イベントの場合は「2025年7月5日〜6日」のような開催日（定常スポットは空文字）"
  }
]

【ガイドライン】
- 5プランのうち、少なくとも1〜2つはGoogle検索で見つけた最新のイベント・期間限定体験を含める
- 日本国内の実在する場所・施設名を使う
- 指定されたエリアに近い場所を優先する
- ユーザーの気分や興味に合った体験を提案する
- 予算内で楽しめる体験を提案する
- 現在の季節（${getSeason(now)}）を考慮する
- プランの多様性を持たせる（全て同じカテゴリにならないよう）
`;

    // まずGoogle Search グラウンディングで試みる
    let plans: Plan[];
    try {
      plans = await generateJSONWithSearch<Plan[]>(prompt);
    } catch (searchError) {
      if (isGeminiQuotaError(searchError) || isGeminiTimeoutError(searchError) || isGeminiNetworkError(searchError)) {
        console.warn('Gemini search unavailable. Returning demo plans.');
        return demoPlanResponse();
      }

      console.warn('Search grounding failed, falling back to standard model:', searchError);
      // グラウンディング失敗時は通常モデルにフォールバック
      plans = await generateJSON<Plan[]>(prompt);
    }

    // キャッシュに保存
    planCache.set(cacheKey, { plans, timestamp: Date.now() });

    return NextResponse.json({ plans, success: true });
  } catch (error) {
    if (isGeminiQuotaError(error) || isGeminiTimeoutError(error) || isGeminiNetworkError(error)) {
      console.warn('Gemini unavailable. Returning demo plans.');
      return demoPlanResponse();
    }

    console.error('Plan generation error:', error);

    return NextResponse.json({ plans: demoPlans, success: true, demo: true });
  }
}

// ユーティリティ: 直近の週末を返す
function getUpcomingWeekend(today: Date): string {
  const dayOfWeek = today.getDay(); // 0=日, 6=土
  const daysToSat = dayOfWeek === 0 ? 6 : 6 - dayOfWeek;
  const daysToSun = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  const sat = new Date(today);
  sat.setDate(today.getDate() + daysToSat);
  const sun = new Date(today);
  sun.setDate(today.getDate() + daysToSun);

  const fmt = (d: Date) =>
    d.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });

  return dayOfWeek === 0
    ? `今日 ${fmt(today)}（本日中）`
    : `${fmt(sat)} 〜 ${fmt(sun)}`;
}

// ユーティリティ: 季節を返す
function getSeason(date: Date): string {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return '春';
  if (month >= 6 && month <= 8) return '夏';
  if (month >= 9 && month <= 11) return '秋';
  return '冬';
}
