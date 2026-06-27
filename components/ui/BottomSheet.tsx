'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[]; // 0-1 ratio of screen height
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.9],
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(26, 46, 42, 0.5)',
              zIndex: 200,
            }}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '430px',
              maxHeight: `${snapPoints[0] * 100}vh`,
              background: 'var(--color-surface)',
              borderRadius: '24px 24px 0 0',
              zIndex: 201,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 -8px 40px rgba(18, 201, 158, 0.15)',
            }}
          >
            {/* Handle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 0 8px',
              flexShrink: 0,
            }}>
              <div style={{
                width: '36px',
                height: '4px',
                background: 'var(--color-border-strong)',
                borderRadius: '2px',
              }} />
            </div>

            {/* Header */}
            {title && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 20px 16px',
                flexShrink: 0,
              }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                }}>
                  {title}
                </h2>
                <button
                  id="bottom-sheet-close"
                  onClick={onClose}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--color-bg-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0 20px 32px',
            }}
              className="no-scrollbar"
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
