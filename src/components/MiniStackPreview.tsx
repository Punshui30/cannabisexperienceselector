import { motion } from 'motion/react';

type Layer = {
  color: string;
  height: number; // percentage
};

type Props = {
  layers: Layer[];
  variant?: 'blend' | 'stack';
};

export function MiniStackPreview({ layers, variant = 'stack' }: Props) {
  if (variant === 'blend') {
    // Horizontal bar visualization for blends
    return (
      <div className="flex h-2 rounded-full overflow-hidden border border-white/10">
        {layers.map((layer, idx) => (
          <motion.div
            key={idx}
            initial={{ width: 0 }}
            animate={{ width: `${layer.height}%` }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            style={{ backgroundColor: layer.color }}
            className="relative"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
              className="absolute inset-0 bg-white/20"
            />
          </motion.div>
        ))}
      </div>
    );
  }

  // Vertical stack visualization
  return (
    <div className="flex flex-col-reverse gap-1">
      {layers.map((layer, idx) => (
        <motion.div
          key={idx}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
          className="rounded overflow-hidden border border-white/10 relative"
          style={{ 
            height: `${Math.max(layer.height * 0.6, 8)}px`,
            backgroundColor: layer.color,
            originY: 'bottom'
          }}
        >
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: idx * 0.5 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        </motion.div>
      ))}
    </div>
  );
}
