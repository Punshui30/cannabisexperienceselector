import { useState } from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../lib/colors';
import chemotypeData from '../data/chemotype_reference.json';
import { BLEND_SCENARIOS } from '../data/presetBlends';

// Limit to first 20 for performance in scroll list, or randomize
const LIVE_MENU = chemotypeData.cultivars.slice(0, 20);

// Pre-computed blends (Mocking server-side suggestions)
const FEATURED_BLENDS = BLEND_SCENARIOS.slice(0, 3);

export function RemoteAccessPreview() {
    const [activeTab, setActiveTab] = useState<'menu' | 'blends'>('menu');

    return (
        <div className="w-full min-h-dvh bg-black text-white font-sans selection:bg-[#00FFD1] selection:text-black flex flex-col">

            {/* --- GLOBAL BACKGROUND --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-[#7C3AED]/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[60%] bg-[#059669]/20 rounded-full blur-[100px]" />
            </div>

            {/* --- HEADER --- */}
            <header className="relative z-20 px-6 pt-12 pb-6 bg-gradient-to-b from-black via-black/90 to-transparent sticky top-0 backdrop-blur-md border-b border-white/5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white mb-1">Demo Dispensary</h1>
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span>Downtown • Closing 10pm</span>
                        </div>
                    </div>
                    <div className="px-2 py-1 rounded border border-[#00FFD1]/30 bg-[#00FFD1]/5 text-[#00FFD1] text-[9px] font-bold uppercase tracking-wider">
                        Live Preview
                    </div>
                </div>

                {/* --- TABS --- */}
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('menu')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'menu' ? 'bg-white/10 text-white' : 'text-white/40'}`}
                    >
                        Live Menu
                    </button>
                    <button
                        onClick={() => setActiveTab('blends')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'blends' ? 'bg-white/10 text-white' : 'text-white/40'}`}
                    >
                        Featured Blends
                    </button>
                </div>
            </header>

            {/* --- CONTENT --- */}
            <div className="relative z-10 flex-1 overflow-y-auto pb-24">

                {activeTab === 'menu' && (
                    <div className="px-4 pt-4 space-y-4">
                        {LIVE_MENU.map((strain) => (
                            <StrainCard key={strain.id} strain={strain} />
                        ))}
                        <div className="text-center py-8 text-white/20 text-xs uppercase tracking-widest">
                            + 40 More Strains Available In-Store
                        </div>
                    </div>
                )}

                {activeTab === 'blends' && (
                    <div className="px-4 pt-4 space-y-6">
                        {FEATURED_BLENDS.map((scenario, idx) => (
                            <LockedBlendCard key={idx} scenario={scenario} />
                        ))}
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 text-center mt-8">
                            <p className="text-sm text-white/60 mb-4">Want to create your own custom blend?</p>
                            <button disabled className="w-full py-3 rounded-xl bg-white/10 border border-white/10 text-white/40 text-xs font-bold uppercase tracking-widest cursor-not-allowed">
                                Connect Live Wallet
                            </button>
                            <p className="text-[9px] text-white/30 mt-2">Available when connected to a live dispensary.</p>
                        </div>
                    </div>
                )}

            </div>

            {/* --- FOOTER --- */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-30">
                <div className="flex items-center justify-center gap-2 opacity-50">
                    <span className="text-[10px] text-white/60 uppercase tracking-widest">Powered by</span>
                    <span className="text-[10px] text-[#ffd700] uppercase tracking-widest font-bold serif">StrainMath™</span>
                </div>
            </div>

        </div>
    );
}

function StrainCard({ strain }: { strain: any }) {
    // Determine gradient based on type
    const gradient = strain.type === 'sativa'
        ? 'from-amber-500/10 to-transparent'
        : strain.type === 'indica'
            ? 'from-purple-500/10 to-transparent'
            : 'from-emerald-500/10 to-transparent';

    const accent = strain.type === 'sativa' ? '#F59E0B' : strain.type === 'indica' ? '#8B5CF6' : '#10B981';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`relative rounded-2xl border border-white/10 bg-white/5 overflow-hidden`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`} />

            <div className="relative p-5">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                                {strain.type}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                                Flower
                            </span>
                        </div>
                        <h3 className="text-xl font-light text-white leading-tight">{strain.name}</h3>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-medium" style={{ color: accent }}>{strain.thc_percent}%</div>
                        <div className="text-[9px] text-white/30 uppercase tracking-widest">THC</div>
                    </div>
                </div>

                {/* Terpenes */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(strain.terpenes || {})
                        .sort(([, a]: any, [, b]: any) => b - a)
                        .slice(0, 3)
                        .map(([name, val]: any) => (
                            <div key={name} className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-white/5 bg-black/20">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent, opacity: 0.7 }} />
                                <span className="text-[9px] uppercase tracking-wider text-white/70">{name}</span>
                            </div>
                        ))}
                </div>

                {/* Actions (Mock/Locked) */}
                <div className="flex gap-2 mt-2">
                    <button disabled className="flex-1 py-2 rounded-lg bg-white/5 border border-white/5 text-white/30 text-[10px] font-bold uppercase tracking-widest cursor-not-allowed hover:bg-white/5">
                        Reserve
                    </button>
                    <button disabled className="flex-1 py-2 rounded-lg bg-white/5 border border-white/5 text-white/30 text-[10px] font-bold uppercase tracking-widest cursor-not-allowed hover:bg-white/5">
                        Learn More
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

function LockedBlendCard({ scenario }: { scenario: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-5 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-light text-white">{scenario.label}</h3>
                <div className="px-2 py-1 rounded bg-[#00FFD1]/10 text-[#00FFD1] text-[9px] font-bold uppercase tracking-widest">
                    Pre-Calculated
                </div>
            </div>

            <p className="text-xs text-white/50 leading-relaxed mb-6">
                "{scenario.text}"
            </p>

            <button disabled className="w-full py-3 rounded-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/10 text-white/40 text-xs font-bold uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2">
                <span>Unlock Full Recipe</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </button>
        </motion.div>
    )
}
