'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store/useAppStore';
import SwipeCard, { SwipeActions } from '@/components/ui/SwipeCard';
import BottomSheet from '@/components/ui/BottomSheet';
import type { Plan, PlanInput } from '@/lib/types';
import { Sparkles, MapPin, Users, Sliders, RefreshCw, Bookmark, CheckCheck } from 'lucide-react';

const MOODS = [
  { emoji: '🌟', label: 'ワクワク', value: 'ワクワクして新しい体験がしたい' },
  { emoji: '😌', label: 'のんびり', value: 'のんびりリラックスしたい' },
  { emoji: '🔥', label: '挑戦', value: '何か新しいことに挑戦したい' },
  { emoji: '🌿', label: '自然', value: '自然の中でリフレッシュしたい' },
  { emoji: '🎨', label: '創作', value: 'クリエイティブな体験をしたい' },
  { emoji: '🍜', label: 'グルメ', value: 'おいしいものが食べたい' },
];

const COMPANIONS = [
  { id: 'solo', label: 'ひとり', emoji: '🙋' },
  { id: 'couple', label: 'カップル', emoji: '💑' },
  { id: 'friends', label: '友人と', emoji: '👥' },
  { id: 'family', label: '家族と', emoji: '👨‍👩‍👧' },
];

const AREAS = ['東京', '大阪', '京都', '神奈川', '愛知', '福岡', '北海道', '沖縄', '地元周辺'];

const INTERESTS = ['アウトドア', '美術館', '温泉', 'カフェ', '読書', 'スポーツ', '音楽', '写真', '料理', '映画'];
const PLAN_REQUEST_TIMEOUT_MS = 25_000;

export default function PlanPage() {
  const { savePlan } = useAppStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  // Form state
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [budgetMax, setBudgetMax] = useState(5000);
  const [selectedArea, setSelectedArea] = useState('東京');
  const [selectedCompanion, setSelectedCompanion] = useState<PlanInput['companion']>('solo');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['アウトドア', 'カフェ']);

  const currentPlan = plans[currentIndex];
  const hasPlans = plans.length > 0 && currentIndex < plans.length;

  const handleGenerate = async () => {
    setIsLoading(true);
    setIsSheetOpen(false);
    setPlans([]);
    setCurrentIndex(0);
    setIsComplete(false);
    setSavedCount(0);
    setIsDemo(false);

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), PLAN_REQUEST_TIMEOUT_MS);
      try {
        const input: PlanInput = {
          mood: selectedMood.value,
          moodEmoji: selectedMood.emoji,
          budgetMin: 0,
          budgetMax,
          area: selectedArea,
          companion: selectedCompanion,
          interests: selectedInterests,
        };

        const res = await fetch('/api/ai/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
          signal: controller.signal,
        });

        const data = await res.json();
        if (data.plans) {
          setPlans(data.plans);
          setIsDemo(data.demo === true);
        } else {
          setIsComplete(false);
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    } catch (e) {
      console.error(e);
      setIsComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipeRight = () => {
    if (currentPlan) {
      savePlan(currentPlan);
      setSavedCount((c) => c + 1);
    }
    advanceCard();
  };

  const handleSwipeLeft = () => {
    advanceCard();
  };

  const advanceCard = () => {
    if (currentIndex >= plans.length - 1) {
      setIsComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 20px) + 36px) 20px 20px',
        background: 'linear-gradient(160deg, #F0FBF8, #FFFFFF)',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px', color: 'var(--color-text-primary)' }}
        >
          ✨ AIプラン提案
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}
        >
          気分や条件を入力して、最適な週末プランを見つけよう
        </motion.p>
        
        {isDemo && hasPlans && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              marginTop: '12px',
              padding: '10px 12px',
              background: '#FFF0ED',
              border: '1px solid #FF7E67',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '14px' }}>⚠️</span>
            <p style={{ fontSize: '11px', color: '#D94A38', margin: 0, lineHeight: 1.5, fontWeight: 600 }}>
              APIキーが未設定か、通信エラーのため、モックデータ（デモモード）を表示しています。
            </p>
          </motion.div>
        )}
      </div>

      <div style={{ padding: '16px' }}>
        {/* Initial State: Start Button */}
        {!hasPlans && !isLoading && !isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '40px 20px' }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              style={{ fontSize: '80px', marginBottom: '24px' }}
            >
              🗺️
            </motion.div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
              週末の冒険を始めよう
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0 0 32px', lineHeight: 1.6 }}>
              気分・予算・エリアを入力するだけで<br />AIがあなただけのプランを提案します
            </p>
            <motion.button
              id="plan-generate-btn"
              className="btn-primary"
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsSheetOpen(true)}
              style={{ fontSize: '16px', padding: '16px 40px' }}
            >
              <Sparkles size={20} />
              プランを生成する
            </motion.button>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '60px 20px' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              style={{ fontSize: '48px', marginBottom: '24px', display: 'inline-block' }}
            >
              ✨
            </motion.div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
              AIがプランを考えています...
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
              {selectedMood.emoji} {selectedMood.label} な気分に合わせた<br />
              最適な体験を見つけています
            </p>

            {/* Loading dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Swipe Cards */}
        {hasPlans && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Progress indicator */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '20px',
            }}>
              {plans.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === currentIndex ? '20px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: i < currentIndex
                      ? 'var(--color-border-strong)'
                      : i === currentIndex
                        ? 'var(--color-primary)'
                        : 'var(--color-border)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* Card stack */}
            <div style={{ position: 'relative', minHeight: '480px', height: 'calc(100dvh - 380px)', maxHeight: '560px' }}>
              <AnimatePresence>
                {plans.slice(currentIndex, currentIndex + 3).reverse().map((plan, stackIdx) => {
                  const realIndex = plans.indexOf(plan);
                  const isTop = realIndex === currentIndex;
                  return (
                    <SwipeCard
                      key={plan.id}
                      plan={plan}
                      stackIndex={2 - stackIdx}
                      onSwipeRight={isTop ? handleSwipeRight : () => {}}
                      onSwipeLeft={isTop ? handleSwipeLeft : () => {}}
                    />
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Action buttons */}
            <SwipeActions onLeft={handleSwipeLeft} onRight={handleSwipeRight} />

            {/* Hint */}
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '-8px' }}>
              ← PASS / GO → でスワイプ、または下のボタンをタップ
            </p>
          </motion.div>
        )}

        {/* Completed State */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', padding: '48px 20px' }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ fontSize: '64px', marginBottom: '20px' }}
            >
              🎉
            </motion.div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
              プラン選択完了！
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>
              {savedCount > 0
                ? `${savedCount}つのプランを保存しました ✨`
                : 'また新しいプランを探してみましょう！'}
            </p>
            {savedCount > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginBottom: '32px',
              }}>
                <Bookmark size={14} color="var(--color-primary)" />
                <span style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600 }}>
                  保存済みプランから体験を記録しよう
                </span>
              </div>
            )}
            <button
              id="plan-regenerate-btn"
              className="btn-primary"
              onClick={() => setIsSheetOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={18} />
              もう一度生成する
            </button>
          </motion.div>
        )}
      </div>

      {/* Input Bottom Sheet */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="プランの条件を入力"
        snapPoints={[0.92]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Mood */}
          <div>
            <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: '10px' }}>
              今の気分は？ 🎭
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {MOODS.map((mood) => (
                <button
                  key={mood.label}
                  id={`mood-${mood.label}`}
                  onClick={() => setSelectedMood(mood)}
                  style={{
                    padding: '12px',
                    borderRadius: '14px',
                    border: `2px solid ${selectedMood.label === mood.label ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: selectedMood.label === mood.label ? 'var(--color-primary-light)' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{mood.emoji}</span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: selectedMood.label === mood.label ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  }}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: '4px' }}>
              予算（〜{budgetMax.toLocaleString()}円）💰
            </label>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 12px' }}>
              スライダーで最大予算を設定してください
            </p>
            <input
              id="budget-slider"
              type="range"
              min={500}
              max={30000}
              step={500}
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>500円</span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>30,000円</span>
            </div>
          </div>

          {/* Area */}
          <div>
            <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: '10px' }}>
              <MapPin size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              行動エリア
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {AREAS.map((area) => (
                <button
                  key={area}
                  id={`area-${area}`}
                  onClick={() => setSelectedArea(area)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: `1.5px solid ${selectedArea === area ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: selectedArea === area ? 'var(--color-primary)' : 'white',
                    color: selectedArea === area ? 'white' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    transition: 'all 0.15s',
                  }}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Companion */}
          <div>
            <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: '10px' }}>
              <Users size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              誰と行く？
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {COMPANIONS.map((c) => (
                <button
                  key={c.id}
                  id={`companion-${c.id}`}
                  onClick={() => setSelectedCompanion(c.id as PlanInput['companion'])}
                  style={{
                    flex: 1,
                    padding: '12px 4px',
                    borderRadius: '14px',
                    border: `2px solid ${selectedCompanion === c.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: selectedCompanion === c.id ? 'var(--color-primary-light)' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{c.emoji}</span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: selectedCompanion === c.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  }}>
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: '10px' }}>
              <Sliders size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              興味・関心（複数選択可）
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {INTERESTS.map((interest) => {
                const selected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    id={`interest-${interest}`}
                    onClick={() => toggleInterest(interest)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: selected ? 'var(--color-primary)' : 'white',
                      color: selected ? 'white' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {selected && <CheckCheck size={12} />}
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <motion.button
            id="sheet-generate-btn"
            className="btn-primary"
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerate}
            style={{ width: '100%', padding: '18px', fontSize: '16px', borderRadius: '16px', marginTop: '8px' }}
          >
            <Sparkles size={20} />
            AIにプランを生成してもらう
          </motion.button>
        </div>
      </BottomSheet>
    </div>
  );
}
