import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Intelligence, BlendResolutionEvent } from '../lib/merchantIntelligence';
import { ArrowLeft, Activity, Users, Clock, Zap } from 'lucide-react';

interface LiveExperienceFeedProps {
    onBack: () => void;
}

export function LiveExperienceFeed({ onBack }: LiveExperienceFeedProps) {
    const [events, setEvents] = useState<BlendResolutionEvent[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        confidence: 0,
        volume: [] as { date: string, count: number }[]
    });

    const refreshData = () => {
        setEvents(Intelligence.getRecentActivity());
        setStats({
            total: Intelligence.getTopBlends(100).reduce((acc, curr) => acc + curr.count, 0),
            confidence: Intelligence.getAverageConfidence(),
            volume: Intelligence.getDailyVolume()
        });
    };

    useEffect(() => {
        // Initial load
        refreshData();

        // Subscribe to real-time updates
        const unsubscribe = Intelligence.subscribe(() => {
            refreshData();
        });

        return () => unsubscribe();
    }, []);

    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return '1d+ ago';
    };

    const hasRealData = events.length > 0;

    return (
        <div className="w-full h-full flex flex-col bg-black text-white relative overflow-hidden">

            {/* BACKGROUND - Premium Gradient */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#00FFD1]/10 via-black to-black" />
                <div className="absolute top-0 w-full h-48 bg-gradient-to-b from-[#00FFD1]/5 to-transparent" />
            </div>

            {/* HEADER - Glass Treatment */}
            <div className="relative z-20 p-6 flex items-center justify-between border-b border-white/10 backdrop-blur-xl"
                style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.6))'
                }}
            >
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all"
                >
                    <ArrowLeft size={14} />
                    <span className="text-[10px] uppercase tracking-widest">Back</span>
                </button>

                <div className="flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFD1] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00FFD1] shadow-[0_0_15px_#00FFD1]"></span>
                    </div>
                    <div className="text-right">
                        <h1 className="text-base font-bold uppercase tracking-widest text-white">Live Blends</h1>
                        <p className="text-[9px] text-white/40 uppercase tracking-widest">
                            {hasRealData ? 'Real-Time Activity' : 'Demo Preview'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative z-10">

                {/* STATS SIDEBAR - Premium Cards */}
                <div className="w-full md:w-80 p-6 border-r border-white/5 bg-white/[0.01] flex flex-col gap-6 shrink-0">
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                            <Activity size={12} /> Network Pulse
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10"
                                style={{
                                    boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                <div className="text-2xl font-serif text-white mb-1">{stats.total}</div>
                                <div className="text-[9px] text-white/40 uppercase tracking-widest">Experiences</div>
                            </div>
                            <div className="p-4 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-[#00FFD1]/10 to-transparent border border-[#00FFD1]/20"
                                style={{
                                    boxShadow: 'inset 0 1px 1px 0 rgba(0, 255, 209, 0.1)'
                                }}
                            >
                                <div className="text-2xl font-serif text-[#00FFD1] mb-1">{Math.round(stats.confidence)}%</div>
                                <div className="text-[9px] text-white/40 uppercase tracking-widest">Confidence</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-[#00FFD1]/10 to-transparent border border-[#00FFD1]/20"
                        style={{
                            boxShadow: 'inset 0 1px 1px 0 rgba(0, 255, 209, 0.1), 0 4px 16px rgba(0, 0, 0, 0.3)'
                        }}
                    >
                        <div className="flex items-center gap-2 mb-3 text-[#00FFD1]">
                            <Users size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Discovery Mode</span>
                        </div>
                        <p className="text-[10px] text-white/60 leading-relaxed">
                            Explore what others are creating. This is a read-only view — no ordering or inventory actions available.
                        </p>
                    </div>
                </div>

                {/* FEED STREAM - Premium Treatment */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 sticky top-0 bg-black/90 backdrop-blur-xl py-4 z-10 border-b border-white/5">
                            Recent Creations
                        </h3>

                        <AnimatePresence mode="popLayout">
                            {events.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-20"
                                >
                                    <div className="p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 max-w-md mx-auto">
                                        <Activity size={32} className="text-white/20 mx-auto mb-4" />
                                        <p className="text-white/40 text-sm mb-2">Waiting for network activity...</p>
                                        <p className="text-white/20 text-xs">Try using the Live Assistant to generate blends</p>
                                    </div>
                                </motion.div>
                            ) : (
                                events.map((event) => (
                                    <motion.div
                                        key={event.id}
                                        layout
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="group relative p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-[#00FFD1]/30 transition-all cursor-pointer overflow-hidden"
                                        style={{
                                            boxShadow: `
                                                inset 0 1px 1px 0 rgba(255, 255, 255, 0.1),
                                                0 4px 16px rgba(0, 0, 0, 0.3)
                                            `
                                        }}
                                    >
                                        {/* Top shine */}
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                        {/* Time indicator */}
                                        <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[9px] text-white/30 uppercase tracking-widest">
                                            <Clock size={10} />
                                            <span>{timeAgo(event.timestamp)}</span>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00FFD1]/20 to-transparent flex items-center justify-center shrink-0 border border-[#00FFD1]/30 group-hover:border-[#00FFD1]/50 transition-colors">
                                                <Zap size={20} className="text-[#00FFD1]" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FFD1] bg-[#00FFD1]/10 px-2 py-0.5 rounded-full border border-[#00FFD1]/20">
                                                        {event.outcomeCategory}
                                                    </span>
                                                    <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                                                        {(event.confidenceScore * 100).toFixed(0)}% Match
                                                    </span>
                                                </div>

                                                <h4 className="text-xl font-serif text-white group-hover:text-[#00FFD1] transition-colors mb-3">
                                                    {event.blendName}
                                                </h4>

                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    {event.componentSkus.map((sku, i) => (
                                                        <span key={i} className="text-[9px] text-white/60 bg-white/5 px-2 py-1 rounded border border-white/10">
                                                            {sku}
                                                        </span>
                                                    ))}
                                                </div>

                                                {event.inputMode === 'assisted' && (
                                                    <div className="flex items-center gap-2 text-xs text-white/40 italic">
                                                        <div className="w-1 h-1 rounded-full bg-[#00FFD1]" />
                                                        <span>Generated via Live Assistant</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
