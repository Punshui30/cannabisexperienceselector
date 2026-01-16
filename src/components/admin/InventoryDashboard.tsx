import { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS } from '../../lib/colors';

export type InventoryItem = {
  id: string;
  productName: string;
  brand: string;
  type: string;
  status: 'active' | 'inactive' | 'needs-coa';
  hasCOA: boolean;
  needsScan: boolean;
  readyForBlending: boolean;
  dateAdded: string;
};

type Props = {
  onAddInventory: () => void;
};

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    productName: 'Durban Poison',
    brand: 'Emerald Fields',
    type: 'Flower',
    status: 'active',
    hasCOA: true,
    needsScan: false,
    readyForBlending: true,
    dateAdded: '2026-01-10',
  },
  {
    id: '2',
    productName: 'Blue Dream',
    brand: 'Coastal Cultivators',
    type: 'Flower',
    status: 'active',
    hasCOA: true,
    needsScan: false,
    readyForBlending: true,
    dateAdded: '2026-01-09',
  },
  {
    id: '3',
    productName: 'Wedding Cake',
    brand: 'Peak Farms',
    type: 'Flower',
    status: 'needs-coa',
    hasCOA: false,
    needsScan: true,
    readyForBlending: false,
    dateAdded: '2026-01-12',
  },
  {
    id: '4',
    productName: 'Jack Herer',
    brand: 'Green Valley',
    type: 'Flower',
    status: 'active',
    hasCOA: true,
    needsScan: false,
    readyForBlending: true,
    dateAdded: '2026-01-08',
  },
  {
    id: '5',
    productName: 'OG Kush',
    brand: 'Emerald Fields',
    type: 'Flower',
    status: 'inactive',
    hasCOA: true,
    needsScan: false,
    readyForBlending: false,
    dateAdded: '2026-01-05',
  },
  {
    id: '6',
    productName: 'Harlequin',
    brand: 'Pure CBD Co',
    type: 'Flower',
    status: 'active',
    hasCOA: true,
    needsScan: false,
    readyForBlending: true,
    dateAdded: '2026-01-11',
  },
  {
    id: '7',
    productName: 'ACDC',
    brand: 'Wellness Farms',
    type: 'Flower',
    status: 'active',
    hasCOA: true,
    needsScan: false,
    readyForBlending: true,
    dateAdded: '2026-01-10',
  },
  {
    id: '8',
    productName: 'Northern Lights',
    brand: 'Peak Farms',
    type: 'Flower',
    status: 'needs-coa',
    hasCOA: false,
    needsScan: true,
    readyForBlending: false,
    dateAdded: '2026-01-13',
  },
];

export function InventoryDashboard({ onAddInventory }: Props) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'needs-coa'>('all');

  const filteredInventory = mockInventory.filter(item => 
    filterStatus === 'all' ? true : item.status === filterStatus
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: COLORS.blend.primary,
          bgColor: 'rgba(0, 255, 163, 0.1)',
          borderColor: 'rgba(0, 255, 163, 0.3)',
          label: 'Ready',
        };
      case 'inactive':
        return {
          color: COLORS.neutral.text.tertiary,
          bgColor: COLORS.neutral.surface,
          borderColor: COLORS.neutral.border,
          label: 'Inactive',
        };
      case 'needs-coa':
        return {
          color: COLORS.warning,
          bgColor: 'rgba(255, 170, 0, 0.1)',
          borderColor: 'rgba(255, 170, 0, 0.3)',
          label: 'Needs COA',
        };
      default:
        return {
          color: COLORS.neutral.text.tertiary,
          bgColor: COLORS.neutral.surface,
          borderColor: COLORS.neutral.border,
          label: 'Unknown',
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Title + Add Button - MOBILE OPTIMIZED */}
      <div className="flex-shrink-0 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-light" style={{ color: COLORS.foreground }}>
              Inventory
            </h1>
            <p className="text-sm" style={{ color: COLORS.neutral.text.secondary }}>
              {filteredInventory.length} products
            </p>
          </div>
          
          {/* Mobile: Icon button, Desktop: Full button */}
          <button
            onClick={onAddInventory}
            className="px-4 py-3 rounded-xl flex items-center gap-2 border"
            style={{
              background: COLORS.blend.gradient,
              borderColor: COLORS.blend.primary,
              color: COLORS.foreground,
              boxShadow: `0 0 20px ${COLORS.blend.primary}40`,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4V16M4 10H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="hidden md:inline text-sm font-medium">Scan COA</span>
          </button>
        </div>

        {/* Filters - Horizontal Scroll on Mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {(['all', 'active', 'needs-coa', 'inactive'] as const).map(status => {
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-sm border transition-colors"
                style={{
                  backgroundColor: isActive ? COLORS.neutral.surface : 'transparent',
                  borderColor: isActive ? COLORS.neutral.border : 'transparent',
                  color: isActive ? COLORS.foreground : COLORS.neutral.text.secondary,
                }}
              >
                {status === 'all' ? 'All' : status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inventory Cards - MOBILE-FIRST, CARD-BASED (not tables) */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-7xl">
          {filteredInventory.map((item, idx) => {
            const statusConfig = getStatusConfig(item.status);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="rounded-2xl border p-4"
                style={{
                  backgroundColor: COLORS.neutral.surface,
                  borderColor: COLORS.neutral.border,
                }}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium truncate" style={{ color: COLORS.foreground }}>
                      {item.productName}
                    </h3>
                    <p className="text-sm truncate" style={{ color: COLORS.neutral.text.secondary }}>
                      {item.brand}
                    </p>
                  </div>
                  <div 
                    className="flex-shrink-0 ml-2 px-2.5 py-1 rounded-lg text-xs font-medium border"
                    style={{
                      backgroundColor: statusConfig.bgColor,
                      borderColor: statusConfig.borderColor,
                      color: statusConfig.color,
                    }}
                  >
                    {statusConfig.label}
                  </div>
                </div>

                {/* Card Details */}
                <div className="space-y-2 mb-3 pb-3 border-b" style={{ borderColor: COLORS.neutral.border }}>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: COLORS.neutral.text.tertiary }}>Type</span>
                    <span style={{ color: COLORS.neutral.text.secondary }}>{item.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: COLORS.neutral.text.tertiary }}>Added</span>
                    <span style={{ color: COLORS.neutral.text.secondary }}>
                      {new Date(item.dateAdded).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Status Indicators - ONE-THUMB REACHABLE */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="w-5 h-5 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: item.hasCOA ? 'rgba(0, 255, 163, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      {item.hasCOA ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke={COLORS.blend.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 3L9 9M9 3L3 9" stroke={COLORS.neutral.text.tertiary} strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: item.hasCOA ? COLORS.blend.primary : COLORS.neutral.text.tertiary }}>
                      COA
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div 
                      className="w-5 h-5 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: item.readyForBlending ? 'rgba(0, 255, 163, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      {item.readyForBlending ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke={COLORS.blend.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="5" stroke={COLORS.neutral.text.tertiary} strokeWidth="1.5" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: item.readyForBlending ? COLORS.blend.primary : COLORS.neutral.text.tertiary }}>
                      Ready
                    </span>
                  </div>

                  {item.needsScan && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <div 
                        className="w-5 h-5 rounded-md flex items-center justify-center"
                        style={{
                          backgroundColor: 'rgba(255, 170, 0, 0.2)',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M6 3V6M6 8H6.01" stroke={COLORS.warning} strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium" style={{ color: COLORS.warning }}>
                        Scan
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredInventory.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: COLORS.neutral.surface }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="6" y="6" width="20" height="20" rx="2" stroke={COLORS.neutral.text.tertiary} strokeWidth="2" />
              </svg>
            </div>
            <p className="text-lg font-light mb-1" style={{ color: COLORS.neutral.text.secondary }}>
              No products found
            </p>
            <p className="text-sm" style={{ color: COLORS.neutral.text.tertiary }}>
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
