
import { useState } from 'react';
import { Camera, Type, Mic, Sprout, Search, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { UserInput } from '../lib/engineAdapter';

// --- DESIGN TOKENS ---
const GLASS_INPUT = "w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[#00FFD1]/50 transition-colors text-sm";
const TAB_ACTIVE = "bg-[#00FFD1] text-black shadow-lg shadow-[#00FFD1]/10";
const TAB_INACTIVE = "text-white/40 hover:text-white hover:bg-white/5";

interface InputScreenProps {
  onSubmit: (input: UserInput) => void;
  onBrowsePresets: () => void;
  onAdminModeToggle: () => void;
  isAdminMode: boolean;
}

export function InputScreen({ onSubmit, onBrowsePresets, onAdminModeToggle, isAdminMode }: InputScreenProps) {
  const [mode, setMode] = useState<'describe' | 'product' | 'strain'>('describe');
  const [description, setDescription] = useState('');
  const [strainName, setStrainName] = useState('');
  const [growerName, setGrowerName] = useState('');
  const [isListening, setIsListening] = useState(false);

  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const canSubmit = () => {
    if (mode === 'describe') return description.length > 5;
    if (mode === 'product') return !!uploadedImage;
    if (mode === 'strain') return strainName.length > 2;
    return false;
  };

  const handleSubmit = () => {
    if (!canSubmit()) return;

    const input: UserInput = {
      mode,
      text: mode === 'describe' ? description : undefined,
      strainName: mode === 'strain' ? strainName : undefined,
      grower: mode === 'strain' ? growerName : undefined,
      image: mode === 'product' && uploadedImage ? URL.createObjectURL(uploadedImage) : undefined
    };

    onSubmit(input);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedImage(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-12 px-6 max-w-xl mx-auto relative z-10">

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-light text-white mb-1 serif">Build your blend</h1>
          <p className="text-white/30 text-sm">Choose how you want to start</p>
        </div>
        <button
          onClick={onAdminModeToggle}
          className="p-2 text-white/10 hover:text-[#00FFD1] transition-colors"
        >
          <div className="w-1.5 h-1.5 rounded-full border border-current" />
        </button>
      </div>

      {/* Tabs - Minimalist, No Icons as per Figma */}
      <div className="flex p-1 bg-white/5 rounded-2xl mb-10 border border-white/10">
        <button
          onClick={() => setMode('describe')}
          className={`flex-1 py-3 px-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${mode === 'describe' ? TAB_ACTIVE : TAB_INACTIVE}`}
        >
          Describe
        </button>
        <button
          onClick={() => setMode('product')}
          className={`flex-1 py-3 px-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${mode === 'product' ? TAB_ACTIVE : TAB_INACTIVE}`}
        >
          Photo
        </button>
        <button
          onClick={() => setMode('strain')}
          className={`flex-1 py-3 px-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${mode === 'strain' ? TAB_ACTIVE : TAB_INACTIVE}`}
        >
          Strain
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">

          {mode === 'describe' && (
            <motion.div
              key="describe"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col"
            >
              <div className="relative flex-1">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us how you want to feel..."
                  className={`${GLASS_INPUT} h-72 resize-none mb-4`}
                />
                <button
                  onClick={() => setIsListening(!isListening)}
                  className={`absolute bottom-8 right-4 p-3 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/10 text-white/30 hover:text-white'}`}
                >
                  <Mic size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'product' && (
            <motion.div
              key="product"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative w-full h-72 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center ${dragActive
                  ? "border-[#00FFD1] bg-[#00FFD1]/5"
                  : uploadedImage
                    ? "border-emerald-400/50 bg-emerald-400/5"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && setUploadedImage(e.target.files[0])}
                />

                {uploadedImage ? (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-400/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-400/30">
                      <Upload size={20} />
                    </div>
                    <p className="text-emerald-400 font-medium text-sm mb-1">{uploadedImage.name}</p>
                    <p className="text-white/20 text-xs">Tap to replace</p>
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer w-full h-full justify-center p-8">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                      <Camera className="text-white/20" size={20} />
                    </div>
                    <p className="text-white font-medium mb-1">Upload Label</p>
                    <p className="text-white/30 text-xs text-center">or drop certification photo here</p>
                  </label>
                )}
              </div>
            </motion.div>
          )}

          {mode === 'strain' && (
            <motion.div
              key="strain"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-semibold text-white/40 mb-3 ml-1">Strain name</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input
                    type="text"
                    value={strainName}
                    onChange={(e) => setStrainName(e.target.value)}
                    placeholder="e.g. Blue Dream"
                    className={`${GLASS_INPUT} pl-12`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/40 mb-3 ml-1">Grower (optional)</label>
                <input
                  type="text"
                  value={growerName}
                  onChange={(e) => setGrowerName(e.target.value)}
                  placeholder="e.g. ABC Farms"
                  className={GLASS_INPUT}
                />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Action */}
      <div className="pb-12 pt-6">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit()}
          className={`w-full btn-neon-green ${!canSubmit() && 'opacity-20 cursor-not-allowed scale-100 shadow-none'}`}
        >
          Generate Recommendations
        </button>

        <button
          onClick={onBrowsePresets}
          className="w-full mt-3 py-3 rounded-xl border border-white/10 text-white/40 text-[10px] font-semibold uppercase tracking-widest hover:bg-white/5 hover:text-[#00FFD1] hover:border-[#00FFD1]/30 transition-all"
        >
          Explore Preset Stacks
        </button>

        {isAdminMode && (
          <button
            onClick={onAdminModeToggle}
            className="w-full text-center mt-6 text-xs text-white/20 hover:text-[#00FFD1] transition-colors"
          >
            Enter admin mode
          </button>
        )}
      </div>

    </div>
  );
}