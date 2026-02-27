import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InventoryService, InventoryItem, InventoryStatus } from '../../lib/merchantInventory';
import { CultivarCard } from '../shared/CultivarCard';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Props = {
  onAddInventory: () => void;
};

export function InventoryDashboard({ onAddInventory }: Props) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'needs-coa'>('all');
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    setItems(InventoryService.getAllItems());
  }, [lastUpdate]);

  const handleUpdateStatus = (id: string, status: InventoryStatus) => {
    InventoryService.updateStatus(id, status);
    setLastUpdate(Date.now());
  };

  const handleToggleCOA = (id: string) => {
    InventoryService.toggleCOA(id);
    setLastUpdate(Date.now());
  };

  const filtered = items.filter(item => {
    const { status } = item.inventory;
    if (filter === 'all') return true;
    if (filter === 'active') return status === 'active';
    if (filter === 'inactive') return status === 'inactive';
    if (filter === 'needs-coa') return status === 'needs-coa' || !item.inventory.hasCOA;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-black">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-light text-white tracking-tight">Inventory</h1>
            <p className="text-sm text-white/40 mt-1">{filtered.length} products available</p>
          </div>
          <button
            onClick={onAddInventory}
            className="px-4 py-2 rounded-xl bg-[#00FFD1]/10 text-[#00FFD1] border border-[#00FFD1]/20 hover:bg-[#00FFD1]/20 transition-all flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            <span className="text-sm font-medium">Add Product</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          {(['all', 'active', 'needs-coa', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${filter === f
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 text-white/40 border-transparent hover:bg-white/10 hover:text-white'
                }`}
            >
              {f === 'needs-coa' ? 'Needs COA' : capitalize(f)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode='popLayout'>
            {filtered.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative group"
              >
                <CultivarCard
                  name={item.name}
                  profile={capitalize(item.cultivarType)}
                  characteristics={item.vibeTags.slice(0, 3)}
                  context={{ density: 'default', showPercentage: false }}
                />

                {/* Admin Interactions Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-3 pt-12 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end rounded-b-xl pointer-events-none">

                  <div className="flex gap-2 pointer-events-auto">
                    {/* COA Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCOA(item.id);
                      }}
                      className={`px-2 py-1 rounded text-xs font-bold border backdrop-blur-md ${item.inventory.hasCOA
                          ? 'bg-[#00FFD1]/20 border-[#00FFD1]/50 text-[#00FFD1]'
                          : 'bg-red-500/20 border-red-500/50 text-red-400'
                        }`}
                    >
                      {item.inventory.hasCOA ? 'COA OK' : 'NO COA'}
                    </button>
                  </div>

                  <div className="flex gap-2 pointer-events-auto">
                    {/* Status Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = item.inventory.status === 'active' ? 'inactive' : 'active';
                        handleUpdateStatus(item.id, next);
                      }}
                      className={`px-3 py-1 rounded text-xs font-bold border backdrop-blur-md uppercase ${item.inventory.status === 'active'
                          ? 'bg-white text-black border-white'
                          : 'bg-white/10 text-white/40 border-white/10 hover:bg-white/20 hover:text-white'
                        }`}
                    >
                      {item.inventory.status}
                    </button>
                  </div>
                </div>

                {/* Persistent Status Indicators (Visible when not hovering) */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end group-hover:opacity-0 transition-opacity">
                  {item.inventory.status !== 'active' && (
                    <span className="w-2 h-2 rounded-full bg-white/20" title="Inactive" />
                  )}
                  {!item.inventory.hasCOA && (
                    <span className="w-2 h-2 rounded-full bg-red-500" title="Missing COA" />
                  )}
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-white/30">
            <p>No inventory matches this filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
