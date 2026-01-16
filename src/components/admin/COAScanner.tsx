import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type Props = {
  onClose: () => void;
  onComplete: (data: any) => void;
};

type ScanState = 'ready' | 'capturing' | 'processing' | 'confirming' | 'complete';

export function COAScanner({ onClose, onComplete }: Props) {
  const [scanState, setScanState] = useState<ScanState>('ready');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    // Simulate camera/file capture
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScanState('capturing');
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
        setScanState('processing');
        
        // Simulate processing
        setTimeout(() => {
          setScanState('confirming');
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    setScanState('complete');
    setTimeout(() => {
      onComplete({
        productName: 'New Product',
        brand: 'Sample Brand',
        type: 'Flower',
        coaDate: new Date().toISOString(),
      });
      onClose();
    }, 1500);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setScanState('ready');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl mx-4"
      >
        <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-light text-white mb-1">COA Scanner</h2>
              <p className="text-sm text-white/50">
                {scanState === 'ready' && 'Capture Certificate of Analysis'}
                {scanState === 'capturing' && 'Capturing...'}
                {scanState === 'processing' && 'Processing document...'}
                {scanState === 'confirming' && 'Confirm extracted data'}
                {scanState === 'complete' && 'Complete!'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M5 5L15 15M15 5L5 15"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Ready State */}
              {scanState === 'ready' && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="relative mb-8">
                    {/* Camera Frame Guide */}
                    <div className="relative aspect-[8.5/11] max-w-md mx-auto bg-white/5 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden">
                      <svg
                        width="120"
                        height="120"
                        viewBox="0 0 120 120"
                        fill="none"
                        className="text-white/20"
                      >
                        <path
                          d="M60 30V50M60 70V90M30 60H50M70 60H90"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <rect
                          x="35"
                          y="35"
                          width="50"
                          height="50"
                          stroke="currentColor"
                          strokeWidth="2"
                          rx="4"
                        />
                      </svg>
                      
                      {/* Corner guides */}
                      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-emerald-400 rounded-tl-lg" />
                      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-emerald-400 rounded-tr-lg" />
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-emerald-400 rounded-bl-lg" />
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-emerald-400 rounded-br-lg" />
                    </div>
                    
                    <p className="text-sm text-white/50 mt-4">
                      Position COA within frame guides
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <button
                    onClick={handleCapture}
                    className="w-full max-w-sm mx-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors flex items-center justify-center gap-3"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="2" />
                      <path d="M7 6L8 3H16L17 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Capture COA
                  </button>
                </motion.div>
              )}

              {/* Processing State */}
              {scanState === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 rounded-full border-4 border-white/10 border-t-emerald-400"
                    />
                  </div>
                  <h3 className="text-xl text-white font-light mb-2">Processing COA</h3>
                  <p className="text-white/50">Extracting product information...</p>
                </motion.div>
              )}

              {/* Confirming State */}
              {scanState === 'confirming' && (
                <motion.div
                  key="confirming"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mb-6">
                    <h3 className="text-lg font-light text-white mb-4">Confirm Product Details</h3>
                    
                    {capturedImage && (
                      <div className="mb-6">
                        <img
                          src={capturedImage}
                          alt="Captured COA"
                          className="w-full max-h-48 object-contain rounded-lg bg-white/5"
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <label className="text-xs text-white/50 mb-1 block">Product Name</label>
                        <input
                          type="text"
                          defaultValue="Blue Dream"
                          className="w-full bg-transparent text-white outline-none"
                        />
                      </div>

                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <label className="text-xs text-white/50 mb-1 block">Brand</label>
                        <input
                          type="text"
                          defaultValue="Coastal Cultivators"
                          className="w-full bg-transparent text-white outline-none"
                        />
                      </div>

                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <label className="text-xs text-white/50 mb-1 block">Type</label>
                        <input
                          type="text"
                          defaultValue="Flower"
                          className="w-full bg-transparent text-white outline-none"
                        />
                      </div>

                      <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-emerald-400 text-sm">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          COA data extracted and validated
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleRetake}
                      className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10"
                    >
                      Retake
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
                    >
                      Confirm & Add
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Complete State */}
              {scanState === 'complete' && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-400/20 flex items-center justify-center"
                  >
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <path
                        d="M10 24L18 32L38 12"
                        stroke="#10b981"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                  <h3 className="text-2xl text-white font-light mb-2">Product Added</h3>
                  <p className="text-white/50">Ready for blending</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
