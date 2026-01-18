import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Intelligence, BlendResolutionEvent } from '../../lib/merchantIntelligence';
import { COLORS } from '../../lib/colors';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
    } | null>(null);

    useEffect(() => {
        // Load metrics on mount
        const load = () => {
            setMetrics({
                topBlends: Intelligence.getTopBlends(),
                topOutcomes: Intelligence.getTopOutcomes(),
                avgConfidence: Intelligence.getAverageConfidence(),
                volume: Intelligence.getDailyVolume()
            });
        };
        load();
        // Poll every 5s for demo liveness
        const interval = setInterval(load, 5000);
        return () => clearInterval(interval);
    }, []);

    if (!metrics) return <div className="text-white">Loading Intelligence...</div>;

    return (
        <div className="space-y-6 pb-12">
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

            {/* PANEL 4: TREND WINDOWS */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="text-sm font-medium text-white mb-4">Activity Trend (Last 7d)</h3>
                <div className="h-32 w-full">
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
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="count" stroke={COLORS.blend.primary} fillOpacity={1} fill="url(#colorVol)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* PANEL 1: WHAT'S WORKING */}
            <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-white/50 font-bold">Top Resolved Blends</h3>
                {metrics.topBlends.length > 0 ? metrics.topBlends.map((b, i) => (
                    <div key={b.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-white/30">{i + 1}</span>
                            <span className="text-sm text-white font-medium">{b.name}</span>
                        </div>
                        <span className="text-xs font-bold text-[#00FFD1]">{b.count} reqs</span>
                    </div>
                )) : (
                    <div className="text-center text-white/20 text-xs py-4">No data yet. Run the engine!</div>
                )}
            </div>

            {/* PANEL 3: MENU GAPS (Outcomes) */}
            <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-white/50 font-bold">Outcome Demand</h3>
                <div className="flex flex-wrap gap-2">
                    {metrics.topOutcomes.map(([cat, count]) => (
                        <div key={cat} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                            <span className="text-xs text-whiteish">{cat}</span>
                            <span className="text-[10px] bg-white/10 px-1.5 rounded text-white/60">{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] uppercase text-white/40 mb-1">{label}</div>
            <div className="text-2xl font-light" style={{ color }}>{value}</div>
        </div>
    );
}
