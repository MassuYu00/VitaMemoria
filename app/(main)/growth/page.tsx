'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { useAppStore } from '@/lib/store/useAppStore';
import { SKILL_META } from '@/lib/types';
import type { SkillName } from '@/lib/types';
import { TrendingUp, Star, Sparkles, RefreshCw, Trophy, Zap } from 'lucide-react';

const SKILL_ORDER: SkillName[] = ['探求心', '創造性', '共感力', '行動力', '挑戦心', 'つながり力'];

const LevelBadge = ({ level, color }: { level: number; color: string }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '2px',
      padding: '2px 8px',
      borderRadius: '20px',
      background: color,
      color: 'white',
      fontSize: '10px',
      fontWeight: 800,
    }}
  >
    <Star size={9} fill="white" />
    Lv.{level}
  </motion.div>
);

export default function GrowthPage() {
  const { skills, logs, updateSkills } = useAppStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<string>('');
  const [insights, setInsights] = useState<string[]>([]);
  const [activeSkill, setActiveSkill] = useState<SkillName | null>(null);

  const radarData = SKILL_ORDER.map((name) => {
    const skill = skills.find((s) => s.skillName === name);
    return {
      subject: name,
      score: skill?.score || 0,
      fullMark: 100,
    };
  });

  const totalLevel = skills.reduce((sum, s) => sum + s.level, 0);
  const avgScore = Math.round(skills.reduce((sum, s) => sum + s.score, 0) / skills.length);
  const topSkill = [...skills].sort((a, b) => b.score - a.score)[0];

  const handleAIAnalysis = async () => {
    if (logs.length === 0) {
      setReport('体験ログを記録してから分析を実行してください。');
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: logs.slice(0, 10) }),
      });
      const data = await res.json();

      if (data.skills) {
        const updatedSkills = skills.map((s) => ({
          ...s,
          score: data.skills[s.skillName] ?? s.score,
          exp: data.skills[s.skillName] ?? s.exp,
          level: Math.floor((data.skills[s.skillName] ?? s.score) / 10) + 1,
          updatedAt: new Date().toISOString(),
        }));
        updateSkills(updatedSkills);
      }
      if (data.monthlyReport) setReport(data.monthlyReport);
      if (data.insights) setInsights(data.insights);
    } catch (e) {
      setReport('分析中にエラーが発生しました。再度お試しください。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 20px) + 36px) 20px 24px',
        background: 'linear-gradient(160deg, var(--color-rpg-light), #FFFFFF)',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px', color: 'var(--color-text-primary)' }}
        >
          🧙 成長ステータス
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}
        >
          体験から生まれる、あなただけのスキルツリー
        </motion.p>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #7C5CFC, #E83B8A)',
            borderRadius: '24px',
            padding: '24px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            left: '20px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Trophy size={20} color="rgba(255,255,255,0.9)" />
              <span style={{ fontSize: '14px', fontWeight: 600, opacity: 0.9 }}>アドベンチャーランク</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 4px', lineHeight: 1 }}>
                  {totalLevel}
                </p>
                <p style={{ fontSize: '12px', opacity: 0.8, margin: 0 }}>合計レベル</p>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 4px', lineHeight: 1 }}>
                  {avgScore}
                </p>
                <p style={{ fontSize: '12px', opacity: 0.8, margin: 0 }}>平均スコア</p>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 4px', lineHeight: 1 }}>
                  {logs.length}
                </p>
                <p style={{ fontSize: '12px', opacity: 0.8, margin: 0 }}>体験数</p>
              </div>
            </div>

            {topSkill && (
              <div style={{
                marginTop: '16px',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ fontSize: '18px' }}>{SKILL_META[topSkill.skillName].emoji}</span>
                <div>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>最強スキル: </span>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{topSkill.skillName} Lv.{topSkill.level}</span>
                </div>
                <Zap size={14} style={{ marginLeft: 'auto', opacity: 0.8 }} />
              </div>
            )}
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px', color: 'var(--color-text-primary)' }}>
            📊 スキルレーダー
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="var(--color-border)" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)', fontWeight: 600 }}
              />
              <Radar
                name="スキル"
                dataKey="score"
                stroke="#12C99E"
                fill="#12C99E"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(value) => [`${value}点`, 'スコア']}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  fontSize: '12px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Individual Skill Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px', color: 'var(--color-text-primary)' }}>
            ⚔️ スキル詳細
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {SKILL_ORDER.map((skillName, i) => {
              const skill = skills.find((s) => s.skillName === skillName);
              if (!skill) return null;
              const meta = SKILL_META[skillName];
              const isActive = activeSkill === skillName;
              const expToNext = 100 - skill.exp % 100;

              return (
                <motion.div
                  key={skillName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  onClick={() => setActiveSkill(isActive ? null : skillName)}
                  style={{
                    background: 'white',
                    borderRadius: '18px',
                    padding: '16px',
                    border: `1.5px solid ${isActive ? meta.color : 'var(--color-border)'}`,
                    boxShadow: isActive ? `0 4px 16px ${meta.color}22` : 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      background: meta.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      flexShrink: 0,
                    }}>
                      {meta.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                          {skillName}
                        </span>
                        <LevelBadge level={skill.level} color={meta.color} />
                      </div>
                      {isActive && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}
                        >
                          {meta.description}
                        </motion.p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: meta.color }}>{skill.score}</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>/100</span>
                    </div>
                  </div>

                  {/* EXP Bar */}
                  <div className="exp-bar">
                    <motion.div
                      className="exp-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.score}%` }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 1.2, ease: 'easeOut' }}
                      style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}88)` }}
                    />
                  </div>

                  {/* EXP info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                      EXP: {skill.exp}/100
                    </span>
                    <span style={{ fontSize: '10px', color: meta.color, fontWeight: 600 }}>
                      次のレベルまであと {expToNext} EXP
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* AI Monthly Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-light), #F8FFFE)',
            borderRadius: '24px',
            padding: '20px',
            border: '1px solid var(--color-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--color-primary)" />
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                AIレポート
              </h2>
            </div>
            <motion.button
              id="ai-analyze-btn"
              whileTap={{ scale: 0.95 }}
              onClick={handleAIAnalysis}
              disabled={isAnalyzing}
              style={{
                padding: '8px 14px',
                background: isAnalyzing ? 'var(--color-border)' : 'var(--color-primary)',
                color: isAnalyzing ? 'var(--color-text-muted)' : 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: isAnalyzing ? 'wait' : 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <motion.span
                animate={isAnalyzing ? { rotate: 360 } : { rotate: 0 }}
                transition={{ repeat: isAnalyzing ? Infinity : 0, duration: 1, ease: 'linear' }}
              >
                <RefreshCw size={13} />
              </motion.span>
              {isAnalyzing ? '分析中...' : '分析する'}
            </motion.button>
          </div>

          {report ? (
            <>
              <div style={{
                background: 'white',
                borderRadius: '14px',
                padding: '14px',
                marginBottom: '12px',
              }}>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                  lineHeight: 1.7,
                }}>
                  {report}
                </p>
              </div>

              {insights.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', margin: 0 }}>
                    💡 気づき
                  </p>
                  {insights.map((insight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'flex-start',
                        background: 'white',
                        borderRadius: '10px',
                        padding: '10px 12px',
                      }}
                    >
                      <span style={{ fontSize: '14px', flexShrink: 0 }}>{'✨🔍💡'[i] || '📌'}</span>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        {insight}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '0 0 4px' }}>
                「分析する」ボタンを押すと、AIがあなたの体験ログから
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                成長レポートを生成します ✨
              </p>
            </div>
          )}
        </motion.div>

        {/* Achievement Hints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '16px',
            border: '1px solid var(--color-border)',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px', color: 'var(--color-text-primary)' }}>
            🏆 次のマイルストーン
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: '5つの体験を記録する', progress: Math.min(logs.length, 5), total: 5, emoji: '📖' },
              { label: '全感情タイプを体験する', progress: new Set(logs.flatMap((l) => l.emotions)).size, total: 6, emoji: '🎭' },
              { label: 'すべてのスキルをLv.5以上に', progress: skills.filter((s) => s.level >= 5).length, total: 6, emoji: '⚔️' },
            ].map((milestone) => {
              const pct = Math.round((milestone.progress / milestone.total) * 100);
              return (
                <div key={milestone.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{milestone.emoji}</span> {milestone.label}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      {milestone.progress}/{milestone.total}
                    </span>
                  </div>
                  <div className="exp-bar">
                    <motion.div
                      className="exp-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
