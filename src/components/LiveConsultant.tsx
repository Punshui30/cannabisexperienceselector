import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveConsultantProps {
    consultantText: string;
    onClose: () => void;
}

export function LiveConsultant({ consultantText, onClose }: LiveConsultantProps) {
    const [displayedSentences, setDisplayedSentences] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // Split text into sentences
        const sentences = consultantText
            .split(/(?<=[.!?])\s+/)
            .filter(s => s.trim().length > 0);

        let currentIndex = 0;
        const sentenceInterval = setInterval(() => {
            if (currentIndex < sentences.length) {
                setDisplayedSentences(prev => [...prev, sentences[currentIndex]]);
                currentIndex++;
            } else {
                setIsComplete(true);
                clearInterval(sentenceInterval);
                // Auto-close after showing complete text
                setTimeout(() => {
                    onClose();
                }, 2500);
            }
        }, 1200); // 1.2 seconds between sentences - deliberate pacing

        return () => clearInterval(sentenceInterval);
    }, [consultantText, onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-md w-full mx-4 p-8 bg-gradient-to-b from-[#1a1a1a] to-black rounded-2xl border border-white/10 shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-[#00FFD1] shadow-[0_0_12px_#00FFD1]" />
                        {!isComplete && (
                            <motion.div
                                className="absolute inset-0 w-3 h-3 rounded-full bg-[#00FFD1]"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}
                    </div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#00FFD1]">
                        {isComplete ? 'Analysis Complete' : 'Analyzing'}
                    </h3>
                </div>

                {/* Consultant Text - Brand Typography */}
                <div className="space-y-3 min-h-[120px]">
                    <AnimatePresence mode="popLayout">
                        {displayedSentences.map((sentence, i) => (
                            <motion.p
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="text-base text-white/80 leading-relaxed font-normal"
                                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                            >
                                {sentence}
                            </motion.p>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
