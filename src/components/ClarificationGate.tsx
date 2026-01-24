import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, AlertCircle, RefreshCcw, Shield } from 'lucide-react';

interface ClarificationGateProps {
    onComplete: (data: {
        directionalIssue: string;
        stabilityContext: string;
        additionalDetail?: string;
    }) => void;
    onSkip: () => void;
}

const Q1_OPTIONS = [
    "Too weak",
    "Too strong",
    "Causes anxiety",
    "Too sedating",
    "Inconsistent from batch to batch"
];

const Q2_OPTIONS = [
    "Tolerance has increased",
    "Tolerance has decreased",
    "Usage timing has changed",
    "Nothing has changed",
    "Not sure"
];

export function ClarificationGate({ onComplete, onSkip }: ClarificationGateProps) {
    const [q1Action, setQ1Action] = useState<string | null>(null);
    const [q2Action, setQ2Action] = useState<string | null>(null);
    const [detail, setDetail] = useState('');

    const isComplete = !!(q1Action && q2Action);

    const handleSubmit = () => {
        if (!isComplete) return;
        onComplete({
            directionalIssue: q1Action!,
            stabilityContext: q2Action!,
            additionalDetail: detail.trim() || undefined
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg px-8 flex flex-col gap-8"
            >
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00FFD1]/20 bg-[#00FFD1]/5 text-[10px] text-[#00FFD1] uppercase tracking-[0.2em] mb-2 font-mono">
                        <Shield size={12} />
                        Accuracy Safeguard
                    </div>
                    <h2 className="text-2xl font-light tracking-tight text-white/90 uppercase font-sans">
                        Calibration Required
                    </h2>
                    <p className="text-sm text-white/50 leading-relaxed font-light font-sans italic">
                        "We need one more signal to avoid guessing and improve accuracy."
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Q1 */}
                    <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-widest text-white/30 flex items-center gap-2 font-mono">
                            <RefreshCcw size={10} />
                            When the experience isn’t right, what’s usually the issue?
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {Q1_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setQ1Action(opt)}
                                    className={`px-4 py-2 rounded-full border text-[11px] transition-all duration-300 font-sans tracking-wide ${q1Action === opt
                                            ? "border-[#00FFD1] bg-[#00FFD1]/10 text-white shadow-[0_0_15px_rgba(0,255,209,0.2)]"
                                            : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Q2 */}
                    <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-widest text-white/30 flex items-center gap-2 font-mono">
                            <AlertCircle size={10} />
                            Has anything changed that could affect how it feels?
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {Q2_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setQ2Action(opt)}
                                    className={`px-4 py-2 rounded-full border text-[11px] transition-all duration-300 font-sans tracking-wide ${q2Action === opt
                                            ? "border-[#ffaa00] bg-[#ffaa00]/10 text-white shadow-[0_0_15px_rgba(255,170,0,0.2)]"
                                            : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Optional */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest text-white/20 font-mono">
                            Any additional detail that could improve accuracy?
                        </label>
                        <input
                            type="text"
                            value={detail}
                            onChange={(e) => setDetail(e.target.value)}
                            placeholder="Optional nuances..."
                            className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-sm font-light text-white outline-none focus:border-white/20 transition-colors placeholder:text-white/10"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <button
                        onClick={onSkip}
                        className="text-[10px] text-white/20 uppercase tracking-[0.2em] hover:text-white/60 transition-colors font-mono"
                    >
                        Proceed with Defaults
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isComplete}
                        className={`group relative flex items-center gap-3 px-8 py-4 rounded-full font-mono text-xs tracking-widest uppercase transition-all duration-500 ${isComplete
                                ? "bg-white text-black hover:scale-105"
                                : "bg-white/5 text-white/10 cursor-not-allowed border border-white/5"
                            }`}
                    >
                        Resume Resolution
                        <ChevronRight size={14} className={`transition-transform duration-500 ${isComplete ? "group-hover:translate-x-1" : ""}`} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
