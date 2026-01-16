import { motion } from 'motion/react';
import type { Recommendation } from '../App';
import { isStacked } from '../App';

type Props = {
  recommendation: Recommendation;
};

export function ShareArtifact({ recommendation }: Props) {
  const isStack = isStacked(recommendation);

  if (isStack) {
    return (
      <div className="relative bg-[#0a0a0a] rounded-2xl p-8 border" style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="3" rx="1" fill="currentColor" className="text-violet-400" opacity="0.5" />
              <rect x="2" y="6.5" width="12" height="3" rx="1" fill="currentColor" className="text-violet-400" opacity="0.75" />
              <rect x="2" y="11" width="12" height="3" rx="1" fill="currentColor" className="text-violet-400" />
            </svg>
            <span className="text-sm font-medium text-violet-400">Stacked Experience</span>
          </div>
          <h3 className="text-2xl font-medium text-white mb-2 tracking-tight">{recommendation.name}</h3>
          <p className="text-sm text-white/60 font-normal">{recommendation.reasoning}</p>
        </div>

        {/* Visual System Diagram - Layered Blocks */}
        <div className="space-y-3 mb-6">
          {recommendation.layers.map((layer, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              {/* Layer block */}
              <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ minHeight: '60px' }}>
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: idx === 0 ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)' :
                               idx === 1 ? 'linear-gradient(90deg, #c026d3, #d946ef)' :
                               'linear-gradient(90deg, #ec4899, #f472b6)'
                  }}
                />
                
                <div className="relative p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div 
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-medium"
                        style={{
                          background: idx === 0 ? 'linear-gradient(135deg, #8b5cf6, #a78bfa)' :
                                     idx === 1 ? 'linear-gradient(135deg, #c026d3, #d946ef)' :
                                     'linear-gradient(135deg, #ec4899, #f472b6)',
                          color: '#000'
                        }}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium text-white">{layer.layerName}</span>
                    </div>
                    <div className="text-xs text-white/50 ml-9">{layer.cultivars.length} cultivars • {layer.timing}</div>
                  </div>
                  
                  {/* Visual bar indicator */}
                  <div className="flex gap-1">
                    {layer.cultivars.map((c, cidx) => (
                      <div 
                        key={cidx}
                        className="h-8 rounded"
                        style={{ 
                          width: `${c.ratio * 60}px`,
                          background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.2))'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Connector arrow */}
              {idx < recommendation.layers.length - 1 && (
                <div className="flex justify-center py-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 4V12M8 12L5 9M8 12L11 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white/20"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer metadata */}
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(184, 151, 90, 0.15)' }}>
          <span className="text-xs text-white/40">Total duration: {recommendation.totalDuration}</span>
          <span className="text-xs font-medium" style={{ color: '#d4af6a' }}>
            {recommendation.matchScore}% Match
          </span>
        </div>
      </div>
    );
  }

  // Blend visualization
  return (
    <div className="relative bg-[#0a0a0a] rounded-2xl p-8 border border-emerald-400/20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">Precision Blend</span>
        </div>
        <h3 className="text-2xl font-medium text-white mb-2 tracking-tight">{recommendation.name}</h3>
        <p className="text-sm text-white/60 font-normal">{recommendation.reasoning}</p>
      </div>

      {/* Visual System Diagram - Horizontal Blend Bar */}
      <div className="mb-6">
        <div className="flex rounded-xl overflow-hidden h-16 border border-white/10">
          {recommendation.cultivars.map((cultivar, idx) => (
            <motion.div
              key={idx}
              initial={{ width: 0 }}
              animate={{ width: `${cultivar.ratio * 100}%` }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="relative group"
              style={{
                background: `linear-gradient(180deg, 
                  ${idx === 0 ? 'rgba(16, 185, 129, 0.5)' : 
                    idx === 1 ? 'rgba(20, 184, 166, 0.5)' : 
                    'rgba(13, 148, 136, 0.5)'}, 
                  ${idx === 0 ? 'rgba(16, 185, 129, 0.2)' : 
                    idx === 1 ? 'rgba(20, 184, 166, 0.2)' : 
                    'rgba(13, 148, 136, 0.2)'}
                )`
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-medium text-white">{Math.round(cultivar.ratio * 100)}%</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-2">
          {recommendation.cultivars.map((cultivar, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded"
                  style={{
                    background: idx === 0 ? 'rgba(16, 185, 129, 0.5)' : 
                               idx === 1 ? 'rgba(20, 184, 166, 0.5)' : 
                               'rgba(13, 148, 136, 0.5)'
                  }}
                />
                <span className="text-white font-medium">{cultivar.name}</span>
              </div>
              <span className="text-white/50">{cultivar.profile}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer metadata */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(184, 151, 90, 0.15)' }}>
        <span className="text-xs text-white/40">
          {recommendation.effects.onset} onset • {recommendation.effects.duration} duration
        </span>
        <span className="text-xs font-medium" style={{ color: '#d4af6a' }}>
          {recommendation.matchScore}% Match
        </span>
      </div>
    </div>
  );
}
