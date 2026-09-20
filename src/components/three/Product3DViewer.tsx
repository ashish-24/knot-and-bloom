'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, Center } from '@react-three/drei';
import { Box, RefreshCw, Eye, Image as ImageIcon } from 'lucide-react';

interface Product3DViewerProps {
  modelUrl?: string;
  fallbackImage: string;
  productName: string;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function Product3DViewer({ modelUrl, fallbackImage, productName }: Product3DViewerProps) {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [mode, setMode] = useState<'3d' | 'image'>('3d');

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        setMode('image');
      }
    } catch (e) {
      setHasWebGL(false);
      setMode('image');
    }
  }, []);

  if (!modelUrl || !hasWebGL || hasError || mode === 'image') {
    return (
      <div className="relative w-full h-[350px] sm:h-[450px] rounded-3xl overflow-hidden bg-cream-200 border border-cream-300 group">
        <Image
          src={fallbackImage}
          alt={productName}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute bottom-4 right-4 bg-cream-100/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-charcoal-700 flex items-center gap-1.5 shadow-sm">
          <ImageIcon className="w-3.5 h-3.5 text-brand-700" />
          <span>High-Res Photo View</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[350px] sm:h-[450px] rounded-3xl overflow-hidden bg-gradient-to-b from-cream-100 to-cream-200 border border-cream-300 shadow-inner-light">
      {/* 3D Canvas */}
      <Suspense
        fallback={
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-charcoal-500">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-700" />
            <span className="text-xs font-serif">Loading 3D Artisanal Model...</span>
          </div>
        }
      >
        <Canvas
          shadows
          camera={{ position: [0, 0, 4], fov: 45 }}
          onError={() => {
            setHasError(true);
            setMode('image');
          }}
        >
          <ambientLight intensity={0.7} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <Center>
            <Stage environment="studio" intensity={0.5} adjustCamera={true}>
              <Model url={modelUrl} />
            </Stage>
          </Center>
          <OrbitControls enableZoom={true} autoRotate={true} autoRotateSpeed={1.5} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      </Suspense>

      {/* Control Overlay */}
      <div className="absolute top-4 left-4 bg-cream-100/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-brand-900 flex items-center gap-1.5 shadow-sm border border-cream-300">
        <Box className="w-3.5 h-3.5 text-terracotta-500" />
        <span>3D Interactive Experience</span>
      </div>

      {/* Toggle View Mode Button */}
      <button
        onClick={() => setMode('image')}
        className="absolute bottom-4 right-4 bg-cream-100 hover:bg-white text-charcoal-800 px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-md border border-cream-300 transition-colors"
      >
        <Eye className="w-3.5 h-3.5 text-brand-800" />
        <span>Switch to 2D Photo</span>
      </button>
    </div>
  );
}
