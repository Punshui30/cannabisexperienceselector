import { motion } from 'motion/react';
import { COLORS } from '../lib/colors';

type Props = {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
};

export function ConfidenceVisual({ score, size = 'md', showLabel = true }: Props) {
  const dimensions = {
    sm: { radius: 32, strokeWidth: 4, fontSize: 'text-lg' },
    md: { radius: 48, strokeWidth: 5, fontSize: 'text-2xl' },
    lg: { radius: 64, strokeWidth: 6, fontSize: 'text-3xl' },
  };

  const config = dimensions[size];
  const circumference = 2 * Math.PI * config.radius;
  const offset = circumference - (score / 100) * circumference;

  // Color based on confidence level - HIGH CHROMA
  const getColor = () => {
    if (score >= 90) return { primary: '#00ffa3', label: 'Excellent' };
    if (score >= 75) return { primary: '#00d9ff', label: 'Very Good' };
    if (score >= 60) return { primary: '#ffd700', label: 'Good' };
    return { primary: 'rgba(255,255,255,0.5)', label: 'Fair' };
  };

  const colors = getColor();
  const svgSize = (config.radius + config.strokeWidth) * 2 + 10;

  return (
    <div className="relative inline-flex flex-col items-center gap-3">
      {/* Circular progress */}
      <div className="relative">
        {/* Glow effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 rounded-full blur-xl"
          style={{ backgroundColor: colors.primary, opacity: 0.4 }}
        />

        <svg
          width={svgSize}
          height={svgSize}
          className="relative"
        >
          <defs>
            {/* Single-hue gradient for depth */}
            <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
              <stop offset="100%" stopColor={colors.primary} stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={config.radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={config.strokeWidth}
          />

          {/* Progress circle */}
          <motion.circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={config.radius}
            fill="none"
            stroke={`url(#gradient-${score})`}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              filter: `drop-shadow(0 0 8px ${colors.primary})`,
            }}
          />

          {/* Center content */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className={`font-medium ${config.fontSize}`}
            fill="#ffffff"
          >
            {score}
          </text>
        </svg>
      </div>

      {/* Label */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Precision Match
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ 
                backgroundColor: colors.primary,
                boxShadow: `0 0 8px ${colors.primary}`,
              }}
            />
            <span className="text-sm font-medium" style={{ color: colors.primary }}>
              {colors.label}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
