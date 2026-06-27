'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { EMOTION_META } from '@/lib/types';
import type { Emotion } from '@/lib/types';
import { Plus, Search, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const EMOTIONS: Emotion[] = ['ワクワク', '発見', 'リラックス', '感動', '挑戦', 'つながり'];

export default function LogPage() {
  const router = useRouter();
  const { logs } = useAppStore();
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | 'all'>('all');
  const [searchText, setSearchText] = useState('');

  const filtered = logs.filter((log) => {
    const matchesEmotion = selectedEmotion === 'all' || log.emotions.includes(selectedEmotion);
    const matchesSearch = !searchText ||
      log.title.toLowerCase().includes(searchText.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchText.toLowerCase());
    return matchesEmotion && matchesSearch;
  });

  // Group by month
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, log) => {
    const monthKey = format(new Date(log.date), 'yyyy年M月', { locale: ja });
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(log);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 20px) + 36px) 20px 20px',
        background: 'linear-gradient(160deg, #F0FBF8, #FFFFFF)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px', color: 'var(--color-text-primary)' }}>
              📖 体験ログ
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
              {logs.length}件の体験を記録中
            </p>
          </div>
          <motion.button
            id="log-add-btn"
            className="btn-primary"
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/log/new')}
            style={{ padding: '10px 16px', fontSize: '14px', borderRadius: '14px' }}
          >
            <Plus size={18} />
            記録する
          </motion.button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={16} color="var(--color-text-muted)" style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
          }} />
          <input
            id="log-search"
            className="input-base"
            type="text"
            placeholder="体験を検索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>

        {/* Emotion Filter */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
          <button
            id="filter-all"
            onClick={() => setSelectedEmotion('all')}
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              border: `1.5px solid ${selectedEmotion === 'all' ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: selectedEmotion === 'all' ? 'var(--color-primary)' : 'white',
              color: selectedEmotion === 'all' ? 'white' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            すべて
          </button>
          {EMOTIONS.map((emotion) => {
            const meta = EMOTION_META[emotion];
            const isSelected = selectedEmotion === emotion;
            return (
              <button
                key={emotion}
                id={`filter-${emotion}`}
                onClick={() => setSelectedEmotion(isSelected ? 'all' : emotion)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: `1.5px solid ${isSelected ? meta.color : 'var(--color-border)'}`,
                  background: isSelected ? meta.bgColor : 'white',
                  color: isSelected ? meta.color : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {meta.emoji} {emotion}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '60px 20px' }}
          >
            <p style={{ fontSize: '48px', margin: '0 0 16px' }}>🔍</p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
              {logs.length === 0 ? '最初の体験を記録しよう！' : '該当する体験が見つかりません'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '0 0 24px' }}>
              {logs.length === 0
                ? '週末に体験したことを感情とともに記録しましょう'
                : 'フィルターを変えてみてください'}
            </p>
            {logs.length === 0 && (
              <button
                id="log-first-add-btn"
                className="btn-primary"
                onClick={() => router.push('/log/new')}
              >
                <Plus size={18} />
                記録を始める
              </button>
            )}
          </motion.div>
        ) : (
          Object.entries(grouped).map(([month, monthLogs]) => (
            <div key={month} style={{ marginBottom: '24px' }}>
              {/* Month header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <Calendar size={14} color="var(--color-text-muted)" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                  {month}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {monthLogs.length}件
                </span>
              </div>

              {/* Log cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <AnimatePresence>
                  {monthLogs.map((log, i) => {
                    const primaryEmotion = log.emotions[0];
                    const emotionMeta = EMOTION_META[primaryEmotion];
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          background: 'white',
                          borderRadius: '20px',
                          overflow: 'hidden',
                          border: '1px solid var(--color-border)',
                          boxShadow: 'var(--shadow-sm)',
                          cursor: 'pointer',
                        }}
                      >
                        {/* Color accent strip */}
                        <div style={{
                          height: '4px',
                          background: `linear-gradient(90deg, ${emotionMeta?.color || '#12C99E'}, ${emotionMeta?.color || '#12C99E'}66)`,
                        }} />

                        <div style={{ padding: '16px' }}>
                          {/* Emotions */}
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                            {log.emotions.map((em) => {
                              const meta = EMOTION_META[em];
                              return (
                                <span key={em} style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: meta?.color,
                                  background: meta?.bgColor,
                                  padding: '3px 10px',
                                  borderRadius: '10px',
                                }}>
                                  {meta?.emoji} {em}
                                </span>
                              );
                            })}
                            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                              {format(new Date(log.date), 'M月d日（eee）', { locale: ja })}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 style={{
                            fontSize: '16px',
                            fontWeight: 800,
                            color: 'var(--color-text-primary)',
                            margin: '0 0 8px',
                            lineHeight: 1.3,
                          }}>
                            {log.title}
                          </h3>

                          {/* Description */}
                          {log.description && (
                            <p style={{
                              fontSize: '13px',
                              color: 'var(--color-text-secondary)',
                              margin: '0 0 12px',
                              lineHeight: 1.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}>
                              {log.description}
                            </p>
                          )}

                          {/* Footer */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            {log.location ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={12} color="var(--color-text-muted)" />
                                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{log.location}</span>
                              </div>
                            ) : <div />}

                            {/* AI Tags */}
                            {log.aiTags && log.aiTags.length > 0 && (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {log.aiTags.slice(0, 2).map((tag) => (
                                  <span key={tag} style={{
                                    fontSize: '10px',
                                    color: 'var(--color-text-muted)',
                                    background: 'var(--color-bg-secondary)',
                                    padding: '2px 8px',
                                    borderRadius: '8px',
                                  }}>
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      {logs.length > 0 && (
        <motion.button
          id="log-fab"
          className="btn-primary"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => router.push('/log/new')}
          style={{
            position: 'fixed',
            bottom: 'calc(var(--bottom-nav-height) + var(--safe-area-bottom) + 16px)',
            right: '16px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 90,
          }}
        >
          <Plus size={24} />
        </motion.button>
      )}
    </div>
  );
}
