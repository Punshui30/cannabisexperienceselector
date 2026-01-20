import { motion, AnimatePresence } from 'motion/react';
import { Activity, X, Info, Share2, Twitter, Instagram, Facebook, Link as LinkIcon } from 'lucide-react';

interface NetworkDetailModalProps {
    event: {
        id: string;
        blendName: string;
        outcomeCategory: string;
        componentSkus: string[];
        inputMode: string;
    };
    onClose: () => void;
}

export function NetworkDetailModal({ event, onClose }: NetworkDetailModalProps) {
    // Determine category theme color
    const categoryColors: Record<string, string> = {
        'Focus': '#00FFD1',
        'Relax': '#A855F7',
        'Sleep': '#6366F1',
        'Social': '#EAB308',
        'Relief': '#34D399',
        'Other': '#ffffff'
    };
    const themeColor = categoryColors[event.outcomeCategory] || '#00FFD1';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[60] flex items-center justify-center p-4 sm:p-6"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] relative"
            >
                {/* Header with Mesh Gradient */}
                <div
                    className="relative h-40 flex items-center justify-center overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg, ${themeColor}20 0%, #111 100%)`
                    }}
                >
                    {/* Animated Mesh Blurs */}
                    <motion.div
                        className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[60px]"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.2, 0.1],
                            rotate: [0, 90, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundColor: themeColor }}
                    />
                    <motion.div
                        className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full blur-[40px]"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.05, 0.15, 0.05],
                            rotate: [0, -45, 0]
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundColor: '#BF5AF2' }}
                    />

                    <div className="absolute top-6 right-6 z-20">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-all active:scale-90"
                        >
                            <X size={18} className="text-white/70" />
                        </button>
                    </div>

                    <div className="relative z-10 w-20 h-20 rounded-full bg-black/40 border border-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner group overflow-hidden">
                        <Activity
                            size={32}
                            className="text-white group-hover:scale-110 transition-transform duration-500"
                            style={{ filter: `drop-shadow(0 0 10px ${themeColor})` }}
                        />
                        {/* Shimmer overlay using Framer Motion */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            style={{ skewX: -20, width: '200%' }}
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    <div className="text-center">
                        <span
                            className="text-[10px] uppercase tracking-[0.3em] font-bold mb-2 block"
                            style={{ color: themeColor }}
                        >
                            {event.outcomeCategory === 'Other' ? 'Curated Experience' : event.outcomeCategory}
                        </span>
                        <h2 className="text-3xl font-serif text-white mb-3 tracking-tight">{event.blendName}</h2>
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-[1px] w-8 bg-white/10" />
                            <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium">
                                Engine Resolution
                            </span>
                            <div className="h-[1px] w-8 bg-white/10" />
                        </div>
                    </div>

                    {/* Composition list */}
                    <div className="space-y-3">
                        {event.componentSkus.map((sku, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 + 0.3 }}
                                className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/[0.05] transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                                    <span className="text-sm text-white/90 font-medium">{sku}</span>
                                </div>
                                <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold">COA Verified</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Narrative with Refined Category Text */}
                    <div className="relative">
                        <div className="absolute -left-2 top-0 bottom-0 w-[2px] rounded-full opacity-50" style={{ backgroundColor: themeColor }} />
                        <p className="text-sm leading-relaxed text-white/50 font-light italic pl-4">
                            &ldquo;This clinical-grade configuration targets {event.outcomeCategory === 'Other' ? 'your specific goals' : event.outcomeCategory.toLowerCase()} by optimizing terpene ratios. The synergy between these cultivars provides a controlled, repeatable experience.&rdquo;
                        </p>
                    </div>

                    {/* SOCIAL SHARING SECTION */}
                    <div className="pt-2 border-t border-white/5">
                        <span className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold block mb-4 text-center">Share This Profile</span>
                        <div className="flex justify-between items-center gap-3">
                            {[
                                { icon: Twitter, label: 'Twitter' },
                                { icon: Instagram, label: 'Instagram' },
                                { icon: Facebook, label: 'Facebook' },
                                { icon: LinkIcon, label: 'Copy Link' }
                            ].map((social, i) => (
                                <button
                                    key={i}
                                    className="flex-1 aspect-square rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 group"
                                    title={social.label}
                                >
                                    <social.icon size={18} className="group-hover:scale-110 transition-transform" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action button */}
                <div className="p-6 pt-0">
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/90 transition-all active:scale-[0.98] shadow-xl"
                    >
                        Dismiss Overlay
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
