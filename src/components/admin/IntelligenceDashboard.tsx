import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Intelligence, BlendResolutionEvent } from '../../lib/merchantIntelligence';
import { COLORS } from '../../lib/colors';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Tv, CheckCircle, Activity } from 'lucide-react';
import { toast } from 'sonner';

/**
 * INTELLIGENCE DASHBOARD
 * Displays the 4 Core Merchant Primitives:
 * 1. What's Working (Top Blends)
 * 2. What's Not (Confidence Issues)
 * 3. Menu Gaps (Under-served categories)
 * 4. Trends (Activity over time)
 */
export function IntelligenceDashboard() {
    const [metrics, setMetrics] = useState<{
        topBlends: { name: string; count: number }[];
        topOutcomes: [string, number][];
        avgConfidence: number;
        volume: { date: string; count: number }[];
        recentActivity: BlendResolutionEvent[];
    } | null>(null);

    const load = () => {
        setMetrics({
            topBlends: Intelligence.getTopBlends(),
            topOutcomes: Intelligence.getTopOutcomes(),
            avgConfidence: Intelligence.getAverageConfidence(),
            volume: Intelligence.getDailyVolume(),
            recentActivity: Intelligence.getRecentActivity()
        });
    };

    useEffect(() => {
        load();
        const subscribe = Intelligence.subscribe(load);
        return () => subscribe();
    }, []);

    const handleBroadcast = (id: string) => {
        Intelligence.broadcastEvent(id);
        toast.success("Broadcast Engaged", {
            description: "Event has been pushed to the main TV display.",
            duration: 3000
        });
    };

    if (!metrics) return <div className="text-white p-6">Loading Intelligence...</div>;

    return (
        <div className="space-y-8 pb-32">
            {/* Header Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <MetricCard
                    label="Avg Confidence"
                    value={`${metrics.avgConfidence.toFixed(1)}%`}
                    color={metrics.avgConfidence > 80 ? COLORS.success : COLORS.warning}
                />
                <MetricCard
                    label="Resolution Vol (7d)"
                    value={metrics.volume.reduce((a, b) => a + b.count, 0).toString()}
                    color={COLORS.blend.primary}
                />
            </div>

            {/* CURATION ZONE: Live Resolutions */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">Live Resolutions</h3>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Control TV Broadcasts</span>
                </div>

                <div className="space-y-3">
                    {metrics.recentActivity.length > 0 ? metrics.recentActivity.map((event) => (
                        <div key={event.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white/10 
                                    ${event.outcomeCategory === 'Focus' ? 'bg-cyan-500/10 text-cyan-400' :
                                        event.outcomeCategory === 'Relax' ? 'bg-purple-500/10 text-purple-400' :
                                            event.outcomeCategory === 'Sleep' ? 'bg-indigo-500/10 text-indigo-400' :
                                                event.outcomeCategory === 'Social' ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-white/5 text-white/60'}
                                `}>
                                    <Activity size={18} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-white truncate">{event.blendName}</div>
                                    <div className="text-[10px] text-white/40 uppercase tracking-widest">{event.outcomeCategory} • {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </div>

                            {event.broadcasted ? (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00FFD1]/10 border border-[#00FFD1]/30 text-[#00FFD1]">
                                    <CheckCircle size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Active</span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleBroadcast(event.id)}
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-[#00FFD1]/10 hover:border-[#00FFD1]/30 hover:text-[#00FFD1] transition-all flex items-center gap-2"
                                >
                                    <Tv size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Broadcast</span>
                                </button>
                            )}
                        </div>
                    )) : (
                        <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <p className="text-xs text-white/20">Awaiting user resolutions...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* PANEL 4: TREND WINDOWS */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-white mb-6 uppercase tracking-widest">Activity Trend (7D)</h3>
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={metrics.volume}>
                            <defs>
                                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.blend.primary} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.blend.primary} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="count" stroke={COLORS.blend.primary} fillOpacity={1} fill="url(#colorVol)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* GRID FOR TOP ITEMS */}
            <div className="grid grid-cols-1 gap-6">
                {/* PANEL 1: WHAT'S WORKING */}
                <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-widest text-white/50 font-bold">Top Resolved Blends</h3>
                    <div className="space-y-2">
                        {metrics.topBlends.length > 0 ? metrics.topBlends.map((b, i) => (
                            <div key={b.name} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono text-white/20">{String(i + 1).padStart(2, '0')}</span>
                                    <span className="text-sm text-white font-medium">{b.name}</span>
                                </div>
                                <span className="text-xs font-bold text-[#00FFD1] bg-[#00FFD1]/10 px-2 py-0.5 rounded-full">{b.count} reqs</span>
                            </div>
                        )) : (
                            <div className="text-center text-white/20 text-xs py-4">No data yet.</div>
                        )}
                    </div>
                </div>

                {/* PANEL 3: MENU GAPS (Outcomes) */}
                <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-widest text-white/50 font-bold">Outcome Demand</h3>
                    <div className="flex flex-wrap gap-2">
                        {metrics.topOutcomes.map(([cat, count]) => (
                            <div key={cat} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                <span className="text-xs text-white font-medium">{cat}</span>
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-[#00FFD1] font-bold">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-bold">{label}</div>
            <div className="text-3xl font-serif" style={{ color }}>{value}</div>
        </div>
    );
}
