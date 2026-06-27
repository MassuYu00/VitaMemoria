'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Sparkles, BookHeart, TrendingUp } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'ホーム', icon: Home, href: '/' },
  { id: 'plan', label: 'プラン', icon: Sparkles, href: '/plan' },
  { id: 'log', label: 'ログ', icon: BookHeart, href: '/log' },
  { id: 'growth', label: '成長', icon: TrendingUp, href: '/growth' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveId = () => {
    if (pathname === '/') return 'home';
    const segment = pathname.split('/')[1];
    return segment || 'home';
  };

  const activeId = getActiveId();

  return (
    <nav
      className="bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '430px',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        paddingTop: '10px',
        zIndex: 100,
        boxShadow: '0 -4px 20px rgba(18, 201, 158, 0.08)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            id={`nav-${tab.id}`}
            onClick={() => router.push(tab.href)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              WebkitTapHighlightColor: 'transparent',
              minWidth: '64px',
            }}
          >
            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '32px',
                  height: '3px',
                  background: 'var(--color-primary)',
                  borderRadius: '0 0 4px 4px',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            {/* Icon */}
            <motion.div
              animate={{
                scale: isActive ? 1.1 : 1,
                y: isActive ? -1 : 0,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                background: isActive ? 'var(--color-primary-light)' : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                color={isActive ? 'var(--color-primary)' : 'var(--color-text-muted)'}
              />
            </motion.div>

            {/* Label */}
            <span style={{
              fontSize: '10px',
              fontWeight: isActive ? 700 : 400,
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              transition: 'all 0.2s',
              letterSpacing: '0.02em',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
