'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { SKILL_META, EMOTION_META } from '@/lib/types';
import { Sparkles, BookHeart, TrendingUp, ChevronRight, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
};

export default function HomePage() {
  const router = useRouter();
  const { user, logs, skills } = useAppStore();
  const recentLogs = logs.slice(0, 3);
  const topSkills = [...skills].sort((a, b) => b.score - a.score).slice(0, 3);

  const today = format(new Date(), 'M月d日（eee）', { locale: ja });
  const greeting = new Date().getHours() < 12 ? 'おはよう' : new Date().getHours() < 17 ? 'こんにちは' : 'こんばんは';

  return (
    <div style={{ padding: '0 0 16px' }}>
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          padding: 'calc(env(safe-area-inset-top, 20px) + 36px) 20px 32px',
          background: 'linear-gradient(160deg, #F0FBF8 0%, #FFFFFF 60%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(18,201,158,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '-20px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,252,0.08) 0%, transparent 70%)',
        }} />

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 4px', fontWeight: 500 }}
        >
          {today}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px', color: 'var(--color-text-primary)' }}
        >
          {greeting}、〇〇さん 👋
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}
        >
          今週末はどんな体験をしたい？
        </motion.p>
      </motion.div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Quick Action Cards */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', gap: '12px' }}
        >
          {/* Plan CTA */}
          <motion.button
            id="home-plan-cta"
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/plan')}
            style={{
              flex: 1,
              padding: '20px 16px',
              background: 'linear-gradient(135deg, #12C99E 0%, #09A884 100%)',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: '0 6px 24px rgba(18, 201, 158, 0.35)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
            }} />
            <Sparkles size={24} color="white" style={{ marginBottom: '8px' }} />
            <p style={{ margin: 0, color: 'white', fontSize: '13px', fontWeight: 500, opacity: 0.85 }}>AIに相談する</p>
            <p style={{ margin: '2px 0 0', color: 'white', fontSize: '16px', fontWeight: 800 }}>週末プラン生成</p>
          </motion.button>

          {/* Log CTA */}
          <motion.button
            id="home-log-cta"
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/log/new')}
            style={{
              flex: 1,
              padding: '20px 16px',
              background: 'white',
              borderRadius: '20px',
              border: '1.5px solid var(--color-border)',
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <BookHeart size={24} color="var(--color-accent)" style={{ marginBottom: '8px' }} />
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '13px', fontWeight: 500 }}>記録する</p>
            <p style={{ margin: '2px 0 0', color: 'var(--color-text-primary)', fontSize: '16px', fontWeight: 800 }}>体験ログ追加</p>
          </motion.button>
        </motion.div>

        {/* Growth Preview */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
              🌟 成長ステータス
            </h2>
            <button
              id="home-growth-link"
              onClick={() => router.push('/growth')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--color-primary)', fontSize: '13px', fontWeight: 600 }}
            >
              詳細 <ChevronRight size={14} />
            </button>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '16px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {topSkills.map((skill, i) => {
              const meta = SKILL_META[skill.skillName];
              return (
                <div key={skill.skillName} style={{ marginBottom: i < topSkills.length - 1 ? '14px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px' }}>{meta.emoji}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {skill.skillName}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: meta.color,
                        background: meta.bgColor,
                        padding: '1px 6px',
                        borderRadius: '10px',
                      }}>
                        Lv.{skill.level}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      {skill.score}/100
                    </span>
                  </div>
                  <div className="exp-bar">
                    <motion.div
                      className="exp-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.score}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 1, ease: 'easeOut' }}
                      style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}bb)` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Logs */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
              📖 最近の体験
            </h2>
            <button
              id="home-log-link"
              onClick={() => router.push('/log')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--color-primary)', fontSize: '13px', fontWeight: 600 }}
            >
              全て見る <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentLogs.map((log, i) => {
              const firstEmotion = log.emotions[0];
              const emotionMeta = firstEmotion ? EMOTION_META[firstEmotion] : null;

              return (
                <motion.div
                  key={log.id}
                  custom={3 + i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/log')}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {/* Emotion icon */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    background: emotionMeta?.bgColor || 'var(--color-bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '22px',
                  }}>
                    {emotionMeta?.emoji || '📝'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      margin: '0 0 4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {log.title}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {log.emotions.map((em) => {
                        const meta = EMOTION_META[em];
                        return (
                          <span key={em} style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: meta?.color,
                            background: meta?.bgColor,
                            padding: '2px 8px',
                            borderRadius: '10px',
                          }}>
                            {meta?.emoji} {em}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date */}
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                    {format(new Date(log.date), 'M/d')}
                  </span>
                </motion.div>
              );
            })}

            {recentLogs.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '32px',
                background: 'white',
                borderRadius: '20px',
                border: '1.5px dashed var(--color-border-strong)',
              }}>
                <p style={{ fontSize: '32px', margin: '0 0 8px' }}>✨</p>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>
                  まだ体験がありません。<br />最初のログを記録してみましょう！
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Total Stats */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          style={{
            background: 'linear-gradient(135deg, var(--color-rpg-light), #F8FFFE)',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[
              { label: '体験数', value: logs.length, emoji: '🗺️' },
              { label: '最高スキル', value: `Lv.${Math.max(...skills.map(s => s.level))}`, emoji: '⚡' },
              { label: '感情タイプ', value: new Set(logs.flatMap(l => l.emotions)).size, emoji: '🎭' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '24px', margin: '0 0 4px' }}>{stat.emoji}</p>
                <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 2px' }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
