import { motion, AnimatePresence } from 'motion/react';
import { Activity, X, Info, Share2, Twitter, Instagram, Facebook, Link as LinkIcon, Check } from 'lucide-react';
import { resolveCultivarVisuals } from '../lib/visuals';
import { useState } from 'react';

interface NetworkDetailModalProps {
    event: any;
    onClose: () => void;
}

export function NetworkDetailModal({ event, onClose }: NetworkDetailModalProps) {
    // Determine category theme color
    const categoryColors: Record<string, string> = {
        'Focus': '#00FFD1',
        'Relax': '#BF5AF2',
        'Sleep': '#6366F1',
        'Social': '#EAB308',
        'Relief': '#34D399',
        'Other': '#ffffff'
    };
    const themeColor = categoryColors[event.outcomeCategory] || '#00FFD1';

    // Share Handler
    const [copied, setCopied] = useState(false);
    const shareUrl = window.location.href; // Or specific deep link logic
    const shareText = `Check out this ${event.blendName} experience on StrainMath.`;

    const handleShare = (platform: 'twitter' | 'facebook' | 'copy') => {
        if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        } else if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(shareUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            style={{
                paddingTop: 'max(1rem, env(safe-area-inset-top))',
                paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
            }}
        >
            {/* Backdrop with heavy blur and deep vignette */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-3xl"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-[#0a0a0a]/80 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_45px_100px_-20px_rgba(0,0,0,1)] relative backdrop-blur-md my-4 max-h-[90vh] flex flex-col"
            >
                {/* IRIDESCENT BORDER GLOW */}
                <div
                    className="absolute inset-x-0 top-0 h-[2px] opacity-70"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${themeColor}, #BF5AF2, ${themeColor}, transparent)`
                    }}
                />

                {/* Header with VIBRANT Mesh Gradient */}
                <div
                    className="relative h-48 flex items-center justify-center overflow-hidden"
                    style={{
                        background: `radial-gradient(circle at 50% 100%, ${themeColor}30 0%, #000 100%)`
                    }}
                >
                    {/* Animated Mesh Blurs - High Vibrance */}
                    <motion.div
                        className="absolute top-[-40%] left-[-20%] w-[100%] h-[100%] rounded-full blur-[80px]"
                        animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.3, 0.5, 0.3],
                            rotate: [0, 120, 0]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundColor: themeColor }}
                    />
                    <motion.div
                        className="absolute bottom-[-30%] right-[-10%] w-[80%] h-[80%] rounded-full blur-[60px]"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.2, 0.4, 0.2],
                            rotate: [0, -90, 0]
                        }}
                        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundColor: '#BF5AF2' }}
                    />

                    <div className="absolute top-8 right-8 z-20">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all active:scale-90"
                        >
                            <X size={18} className="text-white/70" />
                        </button>
                    </div>

                    <div className="relative z-10 w-24 h-24 rounded-full bg-black/40 border-2 border-white/20 flex items-center justify-center backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.05)] group overflow-hidden">
                        <Activity
                            size={36}
                            className="text-white group-hover:scale-110 transition-transform duration-700"
                            style={{
                                filter: `drop-shadow(0 0 15px ${themeColor}) drop-shadow(0 0 5px white)`
                            }}
                        />
                        {/* Shimmer overlay using Framer Motion */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            style={{ skewX: -25, width: '200%' }}
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                </div>

                {/* Scrollable Content Wrapper */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {/* Content */}
                    <div className="p-8 pt-6 space-y-8">
                        <div className="text-center">
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[10px] uppercase tracking-[0.4em] font-black mb-3 block"
                                style={{
                                    color: themeColor,
                                    textShadow: `0 0 10px ${themeColor}40`
                                }}
                            >
                                {event.outcomeCategory === 'Other' ? 'Curated Experience' : event.outcomeCategory}
                            </motion.span>
                            <h2 className="text-4xl font-serif text-white mb-4 tracking-tight leading-tight">
                                {event.blendName}
                            </h2>
                            <div className="flex items-center justify-center gap-3">
                                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/10" />
                                <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">
                                    Engine Resolution
                                </span>
                                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/10" />
                            </div>
                        </div>

                        {/* Composition list with iridescent hover */}
                        <div className="space-y-3">
                            {(event.components || event.componentSkus?.map((s: string) => ({ name: s })) || []).map((comp: any, idx: number) => {
                                const sku = comp.name || comp;
                                const visuals = resolveCultivarVisuals(sku);
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 + 0.3 }}
                                        className="bg-white/[0.04] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 relative overflow-hidden"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-2 h-2 rounded-full shadow-[0_0_10px_currentcolor]"
                                                style={{ backgroundColor: visuals.primaryColor, color: visuals.primaryColor }}
                                            />
                                            <span className="text-[13px] text-white/90 font-medium tracking-wide">{sku}</span>
                                        </div>
                                        {comp.ratio && (
                                            <span className="text-[10px] text-white/40 font-bold">{Math.round(comp.ratio * 100)}%</span>
                                        )}
                                        <span className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-black">COA Verified</span>

                                        {/* Hover Gradient Fill */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Narrative with Refined Category Text */}
                        <div className="relative group">
                            <div
                                className="absolute -left-3 top-0 bottom-0 w-[3px] rounded-full transition-all group-hover:w-1"
                                style={{
                                    background: `linear-gradient(to bottom, ${themeColor}, #BF5AF2)`,
                                    boxShadow: `0 0 15px ${themeColor}40`
                                }}
                            />
                            <p className="text-sm leading-relaxed text-white/60 font-light italic pl-5">
                                &ldquo;{event.commentary || "Resolving experience profile..."}&rdquo;
                            </p>
                        </div>

                        {/* SOCIAL SHARING SECTION - Glassy & Vibrant */}
                        <div className="pt-4 border-t border-white/10">
                            <span className="text-[9px] text-white/40 uppercase tracking-[0.3em] font-black block mb-5 text-center">Share This Profile</span>
                            <div className="flex justify-between items-center gap-4">
                                {[
                                    { icon: Twitter, label: 'Twitter', color: '#1DA1F2', action: () => handleShare('twitter') },
                                    { icon: Facebook, label: 'Facebook', color: '#4267B2', action: () => handleShare('facebook') },
                                    { icon: copied ? Check : LinkIcon, label: copied ? 'Copied' : 'Copy Link', color: copied ? '#00FFD1' : '#ffffff', action: () => handleShare('copy') }
                                ].map((social, i) => (
                                    <button
                                        key={i}
                                        onClick={social.action}
                                        className="flex-1 aspect-square rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-95 group relative overflow-hidden cursor-pointer touch-manipulation"
                                        title={social.label}
                                    >
                                        {/* Glass Shine */}
                                        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                                        <social.icon
                                            size={20}
                                            className="group-hover:scale-125 transition-transform duration-500 z-10"
                                            style={{
                                                filter: `drop-shadow(0 0 8px ${social.color}40)`,
                                                color: social.label === 'Copied' ? '#00FFD1' : undefined
                                            }}
                                        />

                                        <div
                                            className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                                            style={{ backgroundColor: social.color }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action button - Iridescent Glass */}
                    <div className="p-8 pt-0">
                        <button
                            onClick={onClose}
                            className="w-full py-5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/90 transition-all active:scale-[0.98] shadow-[0_10px_30px_rgba(255,255,255,0.1)] relative overflow-hidden"
                        >
                            Dismiss Overlay
                            {/* Shimmer on button */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent"
                                style={{ skewX: -25, width: '200%' }}
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
