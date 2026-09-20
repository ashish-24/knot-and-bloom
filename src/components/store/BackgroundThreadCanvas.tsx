'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function BackgroundThreadCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Scroll transforms for dynamic continuous thread motion down the entire landing page
  const threadShiftY1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const threadShiftY2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const threadShiftY3 = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden select-none"
    >
      <svg
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1440 3200"
      >
        <defs>
          {/* Palette Gradients */}
          <linearGradient id="roseToSkyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F3C3B2" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#99CDD8" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#CFD6C4" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#F3C3B2" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="skyToMintGradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#99CDD8" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#DAEBE3" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#657166" stopOpacity="0.75" />
          </linearGradient>

          <linearGradient id="sageForestGradient" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#CFD6C4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#657166" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#F3C3B2" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Continuous Flowing Thread 1: Primary Rose/Sky Weave */}
        <motion.path
          d="M 100 120 
             C 450 40, 950 320, 1350 200 
             S 800 650, 200 800 
             S 1300 1150, 1250 1450 
             S 150 1850, 300 2200 
             S 1200 2550, 1100 2900"
          fill="none"
          stroke="url(#roseToSkyGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="12 6"
          style={{ y: threadShiftY1 }}
        />

        {/* Continuous Flowing Thread 2: Secondary Sky/Mint Parallel Stitch */}
        <motion.path
          d="M 140 150 
             C 490 70, 990 350, 1390 230 
             S 840 680, 240 830 
             S 1340 1180, 1290 1480 
             S 190 1880, 340 2230 
             S 1240 2580, 1140 2930"
          fill="none"
          stroke="url(#skyToMintGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="6 6"
          style={{ y: threadShiftY2 }}
        />

        {/* Continuous Flowing Thread 3: Fine Sage Accent Stitch */}
        <motion.path
          d="M -50 300 
             C 600 550, 1100 450, 1480 750 
             S 500 1100, 100 1400 
             S 1100 1700, 1350 2000 
             S 600 2400, 200 2750 
             S 900 3000, 1400 3150"
          fill="none"
          stroke="url(#sageForestGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 4"
          style={{ y: threadShiftY3 }}
        />
      </svg>
    </div>
  );
}
