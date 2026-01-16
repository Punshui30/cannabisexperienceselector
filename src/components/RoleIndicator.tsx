import { motion } from 'motion/react';
import { ROLE_COLORS } from '../lib/colors';

type Role = 'driver' | 'balance' | 'support';

type Props = {
  role: Role;
  percentage: number;
  compact?: boolean;
};

const roleConfig = {
  driver: {
    label: 'Driver',
    color: ROLE_COLORS.driver,
    description: 'Primary effect',
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 2L6 10M2 6L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  balance: {
    label: 'Balance',
    color: ROLE_COLORS.balance,
    description: 'Modulator',
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="6" cy="6" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  support: {
    label: 'Support',
    color: ROLE_COLORS.support,
    description: 'Foundation',
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="2" y="6" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <line x1="4" y1="2" x2="4" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="6" y1="3.5" x2="6" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="4.5" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
};

export function RoleIndicator({ role, percentage, compact = false }: Props) {
  const config = roleConfig[role];

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg backdrop-blur-xl border"
        style={{
          backgroundColor: `${config.color}20`,
          borderColor: `${config.color}80`,
        }}
      >
        <div style={{ color: config.color }}>
          {config.icon}
        </div>
        <span className="text-xs font-medium" style={{ color: config.color }}>
          {config.label}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Role bar */}
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border"
          style={{
            backgroundColor: `${config.color}30`,
            borderColor: `${config.color}`,
            boxShadow: `0 0 20px ${config.color}60`,
          }}
        >
          <div style={{ color: config.color }}>
            {config.icon}
          </div>
        </div>

        {/* Label and bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: config.color }}>
              {config.label}
            </span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {config.description}
            </span>
          </div>
          
          {/* Visual strength bar */}
          <div className="relative h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                backgroundColor: config.color,
                boxShadow: `0 0 10px ${config.color}`,
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Determine role based on percentage
export function getRole(percentage: number): Role {
  if (percentage >= 40) return 'driver';
  if (percentage >= 20) return 'balance';
  return 'support';
}
