import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { motion } from 'motion/react';
import type { UIBlendRecommendation } from '../types/domain';

interface EngineQRCodeProps {
  url: string;
  type: 'checkout' | 'share';
  recommendation: UIBlendRecommendation;
  size?: number;
}

export const EngineQRCode: React.FC<EngineQRCodeProps> = ({
  url,
  type,
  recommendation,
  size = 200
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return;

      try {
        await QRCode.toCanvas(canvasRef.current, url, {
          width: size,
          color: {
            dark: '#000000', // High contrast for scannability
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M', // Good balance of error correction and density
          margin: 1
        });

        // Get data URL for display
        const dataUrl = canvasRef.current.toDataURL();
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('QR Code generation failed:', err);
      }
    };

    generateQR();
  }, [url, size]);

  // Engine Core V3 aesthetic colors
  const containerColors = {
    checkout: {
      primary: '#D4AF6A', // Gold
      secondary: '#B8860B',
      glow: 'rgba(212, 175, 106, 0.3)'
    },
    share: {
      primary: '#8B5CF6', // Violet
      secondary: '#7C3AED',
      glow: 'rgba(139, 92, 246, 0.3)'
    }
  };

  const colors = containerColors[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      {/* Outer Glow Ring */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-60"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          transform: 'scale(1.2)'
        }}
      />

      {/* Main Container */}
      <div
        className="relative rounded-full border-2 overflow-hidden backdrop-blur-md"
        style={{
          borderColor: colors.primary,
          background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`,
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.2),
            0 0 20px ${colors.glow},
            0 0 40px ${colors.glow}20
          `
        }}
      >
        {/* Inner metallic ring */}
        <div
          className="absolute inset-2 rounded-full border border-white/20"
          style={{
            background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`
          }}
        />

        {/* QR Code Container */}
        <div className="relative flex items-center justify-center p-4">
          <div className="relative">
            {/* QR Canvas (hidden for data URL generation) */}
            <canvas
              ref={canvasRef}
              className="hidden"
              width={size}
              height={size}
            />

            {/* QR Display Image */}
            {qrDataUrl && (
              <motion.img
                src={qrDataUrl}
                alt={`${type} QR code`}
                className="rounded-lg shadow-lg"
                style={{ width: size, height: size }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              />
            )}

            {/* Subtle pulse animation */}
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-transparent"
              style={{ borderColor: colors.primary }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.02, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>

        {/* Accent dots */}
        <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-white/60" />
        <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-white/60" />
        <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-white/60" />
        <div className="absolute bottom-2 right-2 w-1 h-1 rounded-full bg-white/60" />
      </div>

      {/* Label */}
      <div className="text-center mt-4">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.primary }}>
          {type === 'checkout' ? 'Present at Checkout' : 'Save or Share'}
        </p>
        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">
          {recommendation.name}
        </p>
      </div>
    </motion.div>
  );
};