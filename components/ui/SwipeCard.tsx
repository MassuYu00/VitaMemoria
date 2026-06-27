'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import type { Plan } from '@/lib/types';
import { MapPin, Clock, Wallet, CalendarDays, CheckCircle2, XCircle } from 'lucide-react';

interface SwipeCardProps {
  plan: Plan;
  onSwipeRight: () => void; // "行く！"
  onSwipeLeft: () => void;  // "パス"
  stackIndex: number; // 0 = top
}

export default function SwipeCard({ plan, onSwipeRight, onSwipeLeft, stackIndex }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Like/Nope overlay opacity
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);

  const scale = stackIndex === 0 ? 1 : 0.95 - stackIndex * 0.02;
  const yOffset = stackIndex * 10;

  const handleDragEnd = () => {
    const xVal = x.get();
    if (xVal > 100) {
      animate(x, 500, { duration: 0.3, onComplete: onSwipeRight });
    } else if (xVal < -100) {
      animate(x, -500, { duration: 0.3, onComplete: onSwipeLeft });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  };

  const categoryColors: Record<string, string> = {
    'アウトドア': '#12C99E',
    'カルチャー': '#7C5CFC',
    'グルメ': '#FF7E67',
    'スポーツ': '#3B6FE8',
    'アート': '#E83B8A',
    'リラックス': '#FFBD4F',
    'イベント': '#FF7E67',
  };

  const catColor = categoryColors[plan.category] || '#12C99E';

  return (
    <motion.div
      className="swipe-card"
      style={{
        x,
        rotate,
        opacity,
        scale,
        y: yOffset,
        zIndex: 10 - stackIndex,
        pointerEvents: stackIndex === 0 ? 'auto' : 'none',
      }}
      drag={stackIndex === 0 ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
    >
      {/* Card Content */}
      <div style={{
        background: 'white',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        userSelect: 'none',
      }}>
        {/* Hero Section */}
        <div style={{
          height: '180px',
          background: `linear-gradient(135deg, ${catColor}22, ${catColor}44)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Pattern */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(circle at 30% 50%, ${catColor}33 0%, transparent 50%),
                              radial-gradient(circle at 70% 20%, ${catColor}22 0%, transparent 40%)`,
          }} />

          <span style={{ fontSize: '80px', position: 'relative', zIndex: 1 }}>
            {plan.emoji}
          </span>

          {/* Category badge */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: catColor,
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
          }}>
            {plan.category}
          </div>

          {/* Event badge — 最新イベントの場合に左上表示 */}
          {plan.isEvent && (
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: -6 }}
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'linear-gradient(135deg, #FF7E67, #FFBD4F)',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 8px rgba(255,126,103,0.4)',
              }}
            >
              🎫 最新イベント
            </motion.div>
          )}

          {/* Like overlay */}
          <motion.div
            style={{
              position: 'absolute',
              top: '20px',
              left: '16px',
              opacity: likeOpacity,
              border: '3px solid #12C99E',
              borderRadius: '8px',
              padding: '4px 12px',
              transform: 'rotate(-15deg)',
            }}
          >
            <span style={{ color: '#12C99E', fontWeight: 800, fontSize: '20px' }}>GO!</span>
          </motion.div>

          {/* Nope overlay */}
          <motion.div
            style={{
              position: 'absolute',
              top: '20px',
              right: '16px',
              opacity: nopeOpacity,
              border: '3px solid #FF7E67',
              borderRadius: '8px',
              padding: '4px 12px',
              transform: 'rotate(15deg)',
            }}
          >
            <span style={{ color: '#FF7E67', fontWeight: 800, fontSize: '20px' }}>PASS</span>
          </motion.div>
        </div>

        {/* Info Section */}
        <div style={{ padding: '20px' }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            margin: '0 0 8px',
            lineHeight: 1.3,
          }}>
            {plan.title}
          </h3>

          <p style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 16px',
            lineHeight: 1.6,
          }}>
            {plan.description}
          </p>

          {/* Meta info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={14} color={catColor} />
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{plan.location}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={13} color={catColor} />
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{plan.duration}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wallet size={13} color={catColor} />
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{plan.budget}</span>
              </div>
              {/* 開催日（イベントのみ） */}
              {plan.isEvent && plan.eventDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CalendarDays size={13} color='#FF7E67' />
                  <span style={{ fontSize: '12px', color: '#FF7E67', fontWeight: 600 }}>{plan.eventDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reason */}
          <div style={{
            background: `${catColor}11`,
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '16px',
          }}>
            <p style={{ fontSize: '12px', color: catColor, fontWeight: 600, margin: '0 0 4px' }}>
              💬 あなたにおすすめの理由
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {plan.reason}
            </p>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {plan.tags.map((tag) => (
              <span key={tag} style={{
                padding: '4px 10px',
                background: 'var(--color-bg-secondary)',
                borderRadius: '20px',
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                fontWeight: 500,
              }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Action buttons below the card
export function SwipeActions({
  onLeft,
  onRight,
}: {
  onLeft: () => void;
  onRight: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '32px',
      padding: '24px 0',
    }}>
      <motion.button
        id="swipe-pass"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={onLeft}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'white',
          border: '2px solid #FFE4DE',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(255, 126, 103, 0.2)',
        }}
      >
        <XCircle size={32} color="#FF7E67" strokeWidth={1.5} />
      </motion.button>

      <motion.button
        id="swipe-go"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={onRight}
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #12C99E, #09A884)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(18, 201, 158, 0.45)',
        }}
      >
        <CheckCircle2 size={36} color="white" strokeWidth={2} />
      </motion.button>
    </div>
  );
}
