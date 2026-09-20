'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ThreadUnderlineProps {
  className?: string;
  color1?: string; // Default: #F3C3B2 (Blush Dusty Rose)
  color2?: string; // Default: #99CDD8 (Sky Blue)
}

export default function ThreadUnderline({
  className = '',
  color1 = '#F3C3B2',
  color2 = '#99CDD8',
}: ThreadUnderlineProps) {
  return (
    <svg
      className={`absolute -bottom-3 left-0 w-full h-6 overflow-visible pointer-events-none ${className}`}
      viewBox="0 0 340 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M 4 12 C 95 22, 220 4, 335 14"
        stroke={color1}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="10 4"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
      />
      <motion.path
        d="M 12 16 C 115 6, 205 18, 325 8"
        stroke={color2}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="6 4"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.0, delay: 0.2, ease: 'easeOut' }}
      />
    </svg>
  );
}
