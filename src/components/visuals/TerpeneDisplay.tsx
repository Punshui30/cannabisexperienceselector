import { getStackTerpeneProfile } from '../../lib/cultivarData';
import { UIStackRecommendation } from '../../types/domain';

export function TerpeneDisplay({ stack }: { stack: UIStackRecommendation }) {
    // Use Shared Logic to guarantee 1:1 binding with Graph
    const uniqueTerpenes = getStackTerpeneProfile(stack);

    if (uniqueTerpenes.length === 0) return null;

    return (
        <div>
            <div className="text-[9px] uppercase tracking-widest text-white/40 mb-2 font-bold opacity-70">Dominant Terpenes</div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
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
