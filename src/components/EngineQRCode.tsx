import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { motion } from 'motion/react';
import type { UIBlendRecommendation } from '../types/domain';

interface EngineQRCodeProps {
  url: string;
  type: 'checkout' | 'share';
  recommendation: UIBlendRecommendation;
  size?: number;
  showLabels?: boolean;
}

export const EngineQRCode: React.FC<EngineQRCodeProps> = ({
  url,
  type,
  recommendation,
  size = 200,
  showLabels = true
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
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M',
          margin: 1
        });

        const dataUrl = canvasRef.current.toDataURL();
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('QR Code generation failed:', err);
      }
    };

    generateQR();
  }, [url, size]);

  const containerColors = {
    checkout: { primary: '#D4AF6A', secondary: '#B8860B', glow: 'rgba(212, 175, 106, 0.3)' },
    share: { primary: '#8B5CF6', secondary: '#7C3AED', glow: 'rgba(139, 92, 246, 0.3)' }
  };

  const colors = containerColors[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex flex-col items-center"
    >
      {/* Main Container */}
      <div
        className="relative rounded-xl border overflow-hidden bg-white shadow-xl flex items-center justify-center p-2"
        style={{ borderColor: colors.primary + '40' }}
      >
        <canvas ref={canvasRef} className="hidden" />
        {qrDataUrl && (
          <img
            src={qrDataUrl}
            alt={`${type} QR code`}
            style={{ width: size, height: size, maxWidth: '100%', objectFit: 'contain' }}
          />
        )}
      </div>

      {/* Label */}
      {showLabels && (
        <div className="text-center mt-3">
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.primary }}>
            {type === 'checkout' ? 'Present at Checkout' : 'Save or Share'}
          </p>
        </div>
      )}
    </motion.div>
  );
};