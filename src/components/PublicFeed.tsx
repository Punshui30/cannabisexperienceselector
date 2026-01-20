import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Intelligence, BlendResolutionEvent } from '../lib/merchantIntelligence';
import { Layers, Activity, Lock, Globe } from 'lucide-react';

export function PublicFeed() {
    const [events, setEvents] = useState<BlendResolutionEvent[]>([]);

    useEffect(() => {
        // Poll for new events (Downstream Consumer Pattern)
        const interval = setInterval(() => {
            const recent = Intelligence.getRecentActivity().slice(0, 5); // Top 5
            setEvents(recent);
        }, 1000); // 1s refresh for "Live" feel

        return () => clearInterval(interval);
    }, []);

    if (events.length === 0) return null;

    return (
        <div className="w-full max-w-sm mt-8 space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFD1] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFD1]"></span>
                    </span>
                    <h3 className="text-[10px] uppercase tracking-widest text-[#00FFD1] font-bold">Live Network</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-white/40 uppercase tracking-wider">
                    <Globe size={10} />
                    <span>Public Feed</span>
                </div>
            </div>

            {/* Feed Items */}
            <div className="relative space-y-2">
                {/* Fade mask at bottom */}
                <div className="absolute -bottom-4 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />

                <AnimatePresence mode="popLayout">
                    {events.map((event) => (
                        <motion.div
                            key={event.id}
                            layout
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4, type: "spring" }}
                            className="bg-white/5 border border-white/5 rounded-xl p-3 backdrop-blur-md flex items-center gap-3 group hover:bg-white/10 transition-colors"
                        >
                            {/* Outcome Icon */}
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/10
                                ${event.outcomeCategory === 'Focus' ? 'bg-cyan-500/10 text-cyan-400' :
                                    event.outcomeCategory === 'Relax' ? 'bg-purple-500/10 text-purple-400' :
                                        event.outcomeCategory === 'Sleep' ? 'bg-indigo-500/10 text-indigo-400' :
                                            event.outcomeCategory === 'Social' ? 'bg-yellow-500/10 text-yellow-400' :
                                                'bg-white/5 text-white/60'}
                            `}>
                                <Activity size={14} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-xs text-white font-medium truncate pr-2">
                                        {event.blendName}
                                    </span>
                                    <span className="text-[9px] text-white/30 whitespace-nowrap">
                                        Just now
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-white/50 uppercase tracking-wide">
                                        {event.outcomeCategory}
                                    </span>
                                    <span className="text-[9px] text-white/20">•</span>
                                    <div className="flex items-center gap-1">
                                        <Lock size={8} className="text-white/20" />
                                        <span className="text-[9px] text-white/20">Anonymized</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Disclaimer */}
            <div className="px-2 text-center">
                <p className="text-[9px] text-white/20 leading-tight">
                    Displaying aggregated, non-transactional activity.
                    <br />Personal data is scrubbed at source.
                </p>
            </div>
        </div>
    );
}
