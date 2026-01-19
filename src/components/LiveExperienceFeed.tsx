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

    return (
        <div className="w-full h-full flex flex-col bg-black text-white relative overflow-hidden animate-in fade-in duration-500">

            {/* BACKGROUND */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] via-black to-black" />
                <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#00FFD1]/5 to-transparent opacity-50" />
            </div>

            {/* HEADER */}
            <div className="relative z-20 p-6 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-white/60 transition-colors"
                >
                    <ArrowLeft size={14} />
                    <span className="text-[10px] uppercase tracking-widest">Back</span>
                </button>

                <div className="flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFD1] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00FFD1] shadow-[0_0_10px_#00FFD1]"></span>
                    </div>
                    <div className="text-right">
                        <h1 className="text-sm font-bold uppercase tracking-widest text-white">Live Experience Feed</h1>
                        <p className="text-[9px] text-white/40 uppercase tracking-widest">Anonymized Global Activity</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative z-10">

                {/* GLOBAL STATS SIDEBAR (Desktop) / TOP (Mobile) */}
                <div className="w-full md:w-80 p-6 border-r border-white/5 bg-white/[0.02] flex flex-col gap-6 shrink-0">
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                            <Activity size={12} /> Network Pulse
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="text-2xl font-serif text-white mb-1">{stats.total}</div>
                                <div className="text-[9px] text-white/40 uppercase tracking-widest">Experiences Generated</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="text-2xl font-serif text-[#00FFD1] mb-1">{Math.round(stats.confidence)}%</div>
                                <div className="text-[9px] text-white/40 uppercase tracking-widest">Engine Confidence</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#00FFD1]/10 to-transparent border border-[#00FFD1]/20">
                        <div className="flex items-center gap-2 mb-2 text-[#00FFD1]">
                            <Users size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Active Now</span>
                        </div>
                        <p className="text-[10px] text-white/60 leading-relaxed">
                            The Live Assistant is currently analyzing intent for active users. Data is scrubbed and broadcast in real-time.
                        </p>
                    </div>
                </div>

                {/* FEED STREAM */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-black">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 sticky top-0 bg-black/80 backdrop-blur-xl py-4 z-10">
                            Recent Outcomes
                        </h3>

                        <AnimatePresence mode="popLayout">
                            {events.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-20 opacity-30"
                                >
                                    <p>Waiting for network activity...</p>
                                </motion.div>
                            ) : (
                                events.map((event) => (
                                    <motion.div
                                        key={event.id}
                                        layout
                                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        className="group relative p-5 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-all hover:bg-white/[0.02]"
                                    >
                                        <div className="absolute top-5 right-5 flex items-center gap-1.5 text-[9px] text-white/30 uppercase tracking-widest">
                                            <Clock size={10} />
                                            <span>{timeAgo(event.timestamp)}</span>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-[#00FFD1]/30 transition-colors">
                                                <Zap size={18} className="text-white/40 group-hover:text-[#00FFD1] transition-colors" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FFD1] bg-[#00FFD1]/10 px-2 py-0.5 rounded-full">
                                                        {event.outcomeCategory}
                                                    </span>
                                                    <span className="text-[10px] text-white/30 border border-white/10 px-1.5 rounded bg-black/40">
                                                        {(event.confidenceScore * 100).toFixed(0)}% Match
                                                    </span>
                                                </div>

                                                <h4 className="text-lg font-serif text-white group-hover:text-[#00FFD1] transition-colors">
                                                    {event.blendName}
                                                </h4>

                                                <div className="mt-3 flex flex-wrap gap-1.5">
                                                    {event.componentSkus.map((sku, i) => (
                                                        <span key={i} className="text-[9px] text-white/50 bg-white/5 px-2 py-1 rounded">
                                                            {sku}
                                                        </span>
                                                    ))}
                                                </div>

                                                {event.inputMode === 'assisted' && (
                                                    <div className="mt-3 text-xs text-white/40 italic pl-3 border-l-2 border-white/10">
                                                        "Generated via Live Assistant"
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
