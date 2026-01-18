import { getCultivarVisuals } from '../../lib/cultivarData';
import { UIStackRecommendation } from '../../types/domain';

export function TerpeneDisplay({ stack }: { stack: UIStackRecommendation }) {
    // Aggregate terpenes
    // Strategy: Flatten all cultivars, get their mapped terpenes, find unique top 3

    const allTerpenes: { name: string; color: string }[] = [];

    stack.layers.forEach(layer => {
        layer.cultivars.forEach(cultivar => {
            const visuals = getCultivarVisuals(cultivar.name);
            visuals.terpenes.forEach(t => {
                allTerpenes.push({ name: t, color: visuals.color });
            });
        });
    });

    // Unique by name, take first 3 distinct names (preserving color of first occurrence)
    const uniqueTerpenes = Array.from(new Set(allTerpenes.map(t => t.name)))
        .slice(0, 3)
        .map(name => {
            return allTerpenes.find(t => t.name === name)!;
        });

    if (uniqueTerpenes.length === 0) return null;

    return (
        <div>
            <div className="text-[9px] uppercase tracking-widest text-white/40 mb-2 font-bold">Dominant Terpenes</div>
            <div className="flex flex-wrap gap-2">
                {uniqueTerpenes.map((terp, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/5">
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: terp.color }}
                        />
                        <span className="text-[10px] text-white/80 font-medium">
                            {terp.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
