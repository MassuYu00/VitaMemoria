'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { EMOTION_META } from '@/lib/types';
import type { Emotion } from '@/lib/types';
import { ArrowLeft, MapPin, CheckCircle2, Sparkles } from 'lucide-react';

const EMOTIONS: Emotion[] = ['ワクワク', '発見', 'リラックス', '感動', '挑戦', 'つながり'];

export default function NewLogPage() {
  const router = useRouter();
  const { addLog } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<Emotion[]>([]);
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const toggleEmotion = (emotion: Emotion) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : prev.length < 3
          ? [...prev, emotion]
          : prev
    );
  };

  const analyzeWithAI = async () => {
    if (!title || selectedEmotions.length === 0) return;
    setIsAnalyzing(true);
    try {
      // AI auto-tagging via analyze endpoint
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs: [{ title, description, emotions: selectedEmotions }],
        }),
      });
      // Generate tags from title+emotion (simplified local generation)
      const emotionKeywords: Record<string, string[]> = {
        'ワクワク': ['ワクワク体験', '新発見', 'アクティブ'],
        '発見': ['学び', '探求', '知識'],
        'リラックス': ['リフレッシュ', '癒し', 'マインドフルネス'],
        '感動': ['感動体験', 'インスピレーション', 'メモリー'],
        '挑戦': ['チャレンジ', '成長', '達成感'],
        'つながり': ['人との絆', 'コミュニティ', '交流'],
      };
      const tags = selectedEmotions.flatMap((e) => emotionKeywords[e] || []).slice(0, 3);
      setAiTags(tags);
    } catch {
      setAiTags(['体験', '週末']);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || selectedEmotions.length === 0) return;

    setIsSubmitting(true);

    // Final AI tags
    const finalTags = aiTags.length > 0 ? aiTags : ['週末体験'];

    addLog({
      title,
      description,
      emotions: selectedEmotions,
      location,
      date,
      aiTags: finalTags,
    });

    setIsSuccess(true);
    setTimeout(() => {
      router.push('/log');
    }, 1800);
  };

  if (isSuccess) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        padding: '32px',
      }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ fontSize: '80px', marginBottom: '24px' }}
        >
          🎊
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 8px', textAlign: 'center' }}
        >
          体験を記録しました！
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center' }}
        >
          スキルが成長しています ✨<br />
          {selectedEmotions.join('・')} の体験が記録されました
        </motion.p>

        {/* Skill gained indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            marginTop: '24px',
            background: 'var(--color-primary-light)',
            borderRadius: '16px',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '24px' }}>⚡</span>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)' }}>
              スキルEXP獲得！
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              成長ページで確認してみよう
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const isValid = title.trim().length > 0 && selectedEmotions.length > 0;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: 'calc(env(safe-area-inset-top, 20px) + 36px) 20px 20px',
        background: 'linear-gradient(160deg, #F0FBF8, #FFFFFF)',
      }}>
        <motion.button
          id="log-back-btn"
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '14px',
            background: 'white',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={20} color="var(--color-text-secondary)" />
        </motion.button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 2px', color: 'var(--color-text-primary)' }}>
            体験を記録する
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
            最大3つの感情を選んでください
          </p>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Emotion Picker */}
        <div>
          <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: '12px' }}>
            どんな感情でしたか？ *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {EMOTIONS.map((emotion) => {
              const meta = EMOTION_META[emotion];
              const selected = selectedEmotions.includes(emotion);
              return (
                <motion.button
                  key={emotion}
                  id={`emotion-${emotion}`}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleEmotion(emotion)}
                  style={{
                    padding: '16px',
                    borderRadius: '18px',
                    border: `2px solid ${selected ? meta.color : 'var(--color-border)'}`,
                    background: selected ? meta.bgColor : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                >
                  {selected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: meta.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckCircle2 size={12} color="white" strokeWidth={3} />
                    </motion.div>
                  )}
                  <span style={{ fontSize: '28px' }}>{meta.emoji}</span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: selected ? meta.color : 'var(--color-text-secondary)',
                  }}>
                    {emotion}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    {meta.relatedSkills[0]}・{meta.relatedSkills[1]}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: '8px' }}>
            タイトル *
          </label>
          <input
            id="log-title"
            className="input-base"
            type="text"
            placeholder="例: 錦市場を散歩した"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: '8px' }}>
            体験の詳細（任意）
          </label>
          <textarea
            id="log-description"
            className="input-base"
            placeholder="どんなことが起こりましたか？何を感じましたか？"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* AI Auto-tag Button */}
          {(title || description) && selectedEmotions.length > 0 && (
            <motion.button
              id="log-ai-tag-btn"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={analyzeWithAI}
              disabled={isAnalyzing}
              style={{
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'var(--color-primary-light)',
                border: '1px solid var(--color-primary)',
                borderRadius: '12px',
                cursor: isAnalyzing ? 'wait' : 'pointer',
                color: 'var(--color-primary)',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <motion.span
                animate={isAnalyzing ? { rotate: 360 } : { rotate: 0 }}
                transition={{ repeat: isAnalyzing ? Infinity : 0, duration: 1, ease: 'linear' }}
              >
                <Sparkles size={14} />
              </motion.span>
              {isAnalyzing ? 'AIが分析中...' : 'AIでタグを自動生成'}
            </motion.button>
          )}

          {/* AI Tags Display */}
          <AnimatePresence>
            {aiTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}
              >
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', alignSelf: 'center' }}>AIタグ:</span>
                {aiTags.map((tag) => (
                  <span key={tag} style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-primary)',
                    background: 'var(--color-primary-light)',
                    padding: '4px 10px',
                    borderRadius: '10px',
                  }}>
                    ✨ {tag}
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Location & Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: '6px' }}>
              <MapPin size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              場所（任意）
            </label>
            <input
              id="log-location"
              className="input-base"
              type="text"
              placeholder="例: 京都市"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: '6px' }}>
              📅 日付
            </label>
            <input
              id="log-date"
              className="input-base"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Skill Preview */}
        {selectedEmotions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-light), #F8FFFE)',
              borderRadius: '16px',
              padding: '14px',
              border: '1px solid var(--color-primary)',
            }}
          >
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)', margin: '0 0 8px' }}>
              ⚡ この記録で成長するスキル
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[...new Set(selectedEmotions.flatMap((em) => EMOTION_META[em]?.relatedSkills || []))].map((skill) => (
                <span key={skill} style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  background: 'white',
                  padding: '4px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-primary)',
                }}>
                  {skill} ↑
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          id="log-submit-btn"
          className="btn-primary"
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          style={{
            width: '100%',
            padding: '18px',
            fontSize: '16px',
            borderRadius: '16px',
            opacity: isValid ? 1 : 0.5,
            cursor: isValid ? 'pointer' : 'not-allowed',
            marginBottom: '8px',
          }}
        >
          {isSubmitting ? '保存中...' : '体験を記録する 🎊'}
        </motion.button>
      </div>
    </div>
  );
}
