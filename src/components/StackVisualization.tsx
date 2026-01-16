import { motion } from 'motion/react';
import { ROLE_COLORS } from '../lib/colors';

type Layer = {
  name: string;
  role: string;
  percentage: number;
  color: string;
};

type Props = {
  layers: Layer[];
};

// Custom easing for construction feel
const constructEasing = [0.34, 1.2, 0.64, 1];
const bindEasing = [0.22, 1, 0.36, 1];

export function StackVisualization({ layers }: Props) {
  // Take max 3 layers
  const displayLayers = layers.slice(0, 3);
  
  // Normalize percentages so they add up to 100
  const totalPercentage = displayLayers.reduce((sum, layer) => sum + layer.percentage, 0);
  const normalizedLayers = displayLayers.map(layer => ({
    ...layer,
    normalizedPercentage: (layer.percentage / totalPercentage) * 100
  }));

  // Assign role labels and colors based on contribution
  const layersWithRoles = normalizedLayers
    .sort((a, b) => b.normalizedPercentage - a.normalizedPercentage)
    .map((layer, idx) => ({
      ...layer,
      roleLabel: idx === 0 ? 'Foundation' : idx === 1 ? 'Balance' : 'Accent',
      roleColor: idx === 0 ? ROLE_COLORS.foundation : idx === 1 ? ROLE_COLORS.balance : ROLE_COLORS.accent,
    }));

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background glow - subtle, pulses with foundation color */}
      <motion.div 
        className="absolute inset-0 blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: `radial-gradient(ellipse at center, ${layersWithRoles[0]?.roleColor}, transparent 70%)`
        }}
      />

      {/* Central stack column - straight rectangular composition */}
      <div className="relative flex items-center gap-8">
        {/* Left labels - Role (fade in sequentially) */}
        <div className="flex flex-col justify-center" style={{ height: '240px' }}>
          {layersWithRoles.map((layer, idx) => {
            const segmentHeight = (layer.normalizedPercentage / 100) * 240;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: 0.5 + idx * 0.15,
                  duration: 0.5,
                  ease: bindEasing,
                }}
                className="text-right flex flex-col justify-center"
                style={{ 
                  height: `${segmentHeight}px`,
                }}
              >
                <motion.div 
                  className="text-xs font-medium uppercase tracking-wide" 
                  style={{ color: layer.roleColor }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + idx * 0.15, duration: 0.4 }}
                >
                  {layer.roleLabel}
                </motion.div>
                <div className="text-xs font-light" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {layer.name}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stack column - constructs from bottom up, engineered feel */}
        <div 
          className="relative rounded-lg overflow-hidden"
          style={{ 
            width: '80px',
            height: '240px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Stacked segments from bottom up - SEQUENTIAL CONSTRUCTION */}
          {layersWithRoles.slice().reverse().map((layer, idx) => {
            const reversedIdx = layersWithRoles.length - 1 - idx;
            const segmentHeight = (layer.normalizedPercentage / 100) * 240;
            
            return (
              <motion.div
                key={reversedIdx}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ 
                  scaleY: 1, 
                  opacity: 1,
                }}
                transition={{ 
                  delay: 0.2 + reversedIdx * 0.2, 
                  duration: 0.6,
                  ease: constructEasing,
                }}
                className="absolute left-0 right-0"
                style={{
                  bottom: layersWithRoles.slice(reversedIdx + 1).reduce((sum, l) => sum + (l.normalizedPercentage / 100) * 240, 0),
                  height: `${segmentHeight}px`,
                  backgroundColor: layer.roleColor,
                  boxShadow: `inset 0 0 20px ${layer.roleColor}40, 0 0 12px ${layer.roleColor}30`,
                  transformOrigin: 'bottom',
                }}
              >
                {/* Precision line indicator - appears after segment builds */}
                {reversedIdx > 0 && (
                  <motion.div 
                    className="absolute top-0 left-0 right-0"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ 
                      delay: 0.3 + reversedIdx * 0.2,
                      duration: 0.4,
                      ease: bindEasing,
                    }}
                    style={{
                      height: '1px',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      transformOrigin: 'left',
                      boxShadow: '0 0 2px rgba(0, 0, 0, 0.8)',
                    }}
                  />
                )}

                {/* Glow pulse on segment after construction */}
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{
                    delay: 0.8 + reversedIdx * 0.2,
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  style={{
                    backgroundColor: layer.roleColor,
                    mixBlendMode: 'screen',
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Right labels - Percentages BIND to segments sequentially */}
        <div className="flex flex-col justify-center" style={{ height: '240px' }}>
          {layersWithRoles.map((layer, idx) => {
            const segmentHeight = (layer.normalizedPercentage / 100) * 240;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: 0.5 + idx * 0.15,
                  duration: 0.5,
                  ease: bindEasing,
                }}
                className="flex items-center gap-2"
                style={{ 
                  height: `${segmentHeight}px`,
                }}
              >
                {/* Binding line - draws from segment to percentage */}
                <motion.div 
                  className="h-px"
                  initial={{ width: 0 }}
                  animate={{ width: 12 }}
                  transition={{
                    delay: 0.6 + idx * 0.15,
                    duration: 0.3,
                    ease: bindEasing,
                  }}
                  style={{ 
                    backgroundColor: layer.roleColor,
                    boxShadow: `0 0 4px ${layer.roleColor}80`
                  }}
                />
                
                {/* Percentage badge - snaps into place with spring */}
                <motion.div 
                  className="px-2.5 py-1 rounded-md border text-xs font-medium tabular-nums"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.7 + idx * 0.15,
                    type: 'spring',
                    stiffness: 400,
                    damping: 20,
                  }}
                  whileHover={{ 
                    scale: 1.08,
                    boxShadow: `0 0 16px ${layer.roleColor}60`,
                  }}
                  style={{
                    backgroundColor: `${layer.roleColor}30`,
                    borderColor: layer.roleColor,
                    color: layer.roleColor,
                    boxShadow: `0 0 8px ${layer.roleColor}40`
                  }}
                >
                  {layer.percentage}%
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}