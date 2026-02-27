import { useState, useRef } from 'react';
import { Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OpenAIVisionProvider, LabelScan } from '../ai/providers/visionProvider';
import { isMerchantMode } from '../ai/config';
import { toast } from 'sonner';

interface ScanButtonProps {
    onScanComplete: (result: LabelScan) => void;
    className?: string;
}

export function ScanButton({ onScanComplete, className }: ScanButtonProps) {
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Hard gate: Remove button entirely in Merchant mode
    if (isMerchantMode()) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        try {
            const result = await OpenAIVisionProvider.scanLabel(file);
            onScanComplete(result);
            toast.success("Scan complete! Match found.");
        } catch (error: any) {
            console.error("Scan failed:", error);
            toast.error(error.message || "Failed to analyze label.");
        } finally {
            setIsScanning(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={className}>
            <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${isScanning
                        ? 'bg-amber-400/20 border-amber-400/40 text-amber-400'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70 hover:text-white'
                    }`}
            >
                {isScanning ? (
                    <>
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Analyzing...</span>
                    </>
                ) : (
                    <>
                        <Camera size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Scan Label</span>
                    </>
                )}
            </motion.button>
        </div>
    );
}
