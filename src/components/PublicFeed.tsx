import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Intelligence, BlendResolutionEvent } from '../lib/merchantIntelligence';
import { Activity, Lock, Globe, Tv } from 'lucide-react';
import { NetworkDetailModal } from './NetworkDetailModal';

const MotionButton = motion.button as any;
const MotionDiv = motion.div as any;

interface PublicFeedProps {
    isTvMode?: boolean;
}

export function PublicFeed({ isTvMode = false }: PublicFeedProps) {
    const [events, setEvents] = useState<BlendResolutionEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<BlendResolutionEvent | null>(null);
    const [advanceProgress, setAdvanceProgress] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Poll for new events (Downstream Consumer Pattern)
        const interval = setInterval(() => {
            let recent = Intelligence.getRecentActivity();

            // If TV Mode, only show what the merchant has manually "Broadcasted"
            if (isTvMode) {
                recent = recent.filter(e => e.broadcasted);
            }

            setEvents(recent.slice(0, 5)); // Top 5
        }, 1000); // 1s refresh for "Live" feel

        return () => clearInterval(interval);
    }, [isTvMode]);

    // TV Mode: Auto-Advance Logic
    useEffect(() => {
        if (!isTvMode || events.length === 0 || selectedEvent) return;

        const cycleTime = 12000; // 12 seconds
        const stepTime = 100;
        const totalSteps = cycleTime / stepTime;

        let currentStep = 0;

        const autoAdvance = setInterval(() => {
            currentStep++;
            setAdvanceProgress((currentStep / totalSteps) * 100);

            if (currentStep >= totalSteps) {
                // Time to advance!
                const nextIdx = (currentIndex + 1) % events.length;
                setCurrentIndex(nextIdx);
                setSelectedEvent(events[nextIdx]);
                currentStep = 0;
            }
        }, stepTime);

        return () => {
            clearInterval(autoAdvance);
            setAdvanceProgress(0);
        };
    }, [isTvMode, events, currentIndex, selectedEvent]);

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
                    <h3 className="text-[10px] uppercase tracking-widest text-[#00FFD1] font-bold">
                        {isTvMode ? 'Network Broadcast' : 'Live Network'}
                    </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-white/40 uppercase tracking-wider">
                    {isTvMode ? <Tv size={10} /> : <Globe size={10} />}
                    <span>{isTvMode ? 'Commercial Channel' : 'Public Feed'}</span>
                </div>
            </div>

            {/* TV Mode: Progress Bar */}
            {isTvMode && !selectedEvent && (
                <div className="px-2">
                    <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <MotionDiv
                            className="h-full bg-[#00FFD1]/40"
                            style={{ width: `${advanceProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Feed Items */}
            <div className="relative space-y-2">
                {/* Fade mask at bottom */}
                {!isTvMode && (
                    <div className="absolute -bottom-4 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
                )}

                <AnimatePresence mode="popLayout">
                    {events.map((event, idx) => (
                        <MotionButton
                            key={event.id}
                            layout
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{
                                opacity: 1,
                                x: 0,
                                scale: 1,
                                borderColor: (isTvMode && currentIndex === idx) ? '#00FFD1' : 'rgba(255,255,255,0.05)'
                            }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4, type: "spring" }}
                            onClick={() => {
                                console.log('🔍 Feed item clicked:', event.blendName);
                                setSelectedEvent(event);
                                setCurrentIndex(idx);
                            }}
                            className={`w-full bg-white/5 border rounded-xl p-3 backdrop-blur-md flex items-center gap-3 group hover:bg-white/10 transition-all cursor-pointer ${isTvMode && currentIndex === idx ? 'border-[#00FFD1]/50 shadow-[0_0_15px_rgba(0,255,209,0.1)]' : 'border-white/5'}`}
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
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-xs text-white font-medium truncate pr-2">
                                        {event.blendName}
                                    </span>
                                    {isTvMode && currentIndex === idx ? (
                                        <MotionDiv
                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="text-[8px] bg-[#00FFD1]/20 text-[#00FFD1] px-1.5 py-0.5 rounded uppercase font-black"
                                        >
                                            Next
                                        </MotionDiv>
                                    ) : (
                                        <span className="text-[9px] text-white/30 whitespace-nowrap">
                                            Just now
                                        </span>
                                    )}
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
                        </MotionButton>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {selectedEvent && (
                    <NetworkDetailModal
                        event={selectedEvent}
                        isTvMode={isTvMode}
                        onClose={() => setSelectedEvent(null)}
                    />
                )}
            </AnimatePresence>

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
