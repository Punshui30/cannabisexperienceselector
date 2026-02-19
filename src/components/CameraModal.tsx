import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Camera, FlipHorizontal, Upload, AlertTriangle } from 'lucide-react';

interface CameraModalProps {
    onClose: () => void;
    onCapture: (blob: Blob) => void;
}

type FacingMode = 'user' | 'environment';

export function CameraModal({ onClose, onCapture }: CameraModalProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<FacingMode>('environment');
    const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isCapturing, setIsCapturing] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    }, []);

    const startCamera = useCallback(async (facing: FacingMode) => {
        stopStream();
        setIsLoading(true);
        setError(null);

        // Check if getUserMedia is supported at all
        if (!navigator.mediaDevices?.getUserMedia) {
            setError('Camera API not supported in this browser. Please use file upload instead.');
            setIsLoading(false);
            return;
        }

        // Strategy: Try ideal facingMode, fall back to any camera
        const constraints: MediaStreamConstraints[] = [
            // 1st try: preferred facing mode with HD
            { video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } } },
            // 2nd try: preferred facing mode, any resolution
            { video: { facingMode: { ideal: facing } } },
            // 3rd try: exact facingMode (may fail on desktop)
            { video: { facingMode: facing } },
            // 4th fallback: any camera at all (works on all desktops/Windows)
            { video: true },
        ];

        let lastErr: unknown;
        for (const constraint of constraints) {
            try {
                const newStream = await navigator.mediaDevices.getUserMedia(constraint);
                streamRef.current = newStream;
                setStream(newStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = newStream;
                }
                setIsLoading(false);

                // Check if multiple cameras exist for flip button
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoCameras = devices.filter(d => d.kind === 'videoinput');
                setHasMultipleCameras(videoCameras.length > 1);
                return;
            } catch (err) {
                lastErr = err;
                console.warn(`[CAMERA] Constraint failed:`, constraint, err);
            }
        }

        // All strategies failed
        console.error('[CAMERA] All constraints failed:', lastErr);
        const e = lastErr as any;
        const isPermission = e?.name === 'NotAllowedError' || e?.name === 'PermissionDeniedError';
        setError(
            isPermission
                ? 'Camera permission denied. Please allow camera access in your browser settings — or use the file upload below.'
                : 'No camera found or camera is in use by another app. Use the file upload option below.'
        );
        setIsLoading(false);
    }, [stopStream]);

    useEffect(() => {
        startCamera(facingMode);
        return () => stopStream();
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    const handleFlip = () => {
        const next: FacingMode = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(next);
        startCamera(next);
    };

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsCapturing(true);
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;

        // Mirror front-facing captures (selfie style)
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            setIsCapturing(false);
            if (blob) {
                onCapture(blob);
                onClose();
            }
        }, 'image/jpeg', 0.9);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onCapture(file);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-black rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col"
                style={{ maxHeight: '90dvh' }}
            >
                {/* Header */}
                <div className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-black">
                    <div>
                        <h3 className="text-white font-serif text-lg leading-tight">Scan Label</h3>
                        <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Point at packaging</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasMultipleCameras && !error && (
                            <button
                                onClick={handleFlip}
                                title="Flip camera"
                                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                            >
                                <FlipHorizontal size={16} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Video Viewfinder */}
                <div className="relative bg-black flex-1" style={{ minHeight: '300px', maxHeight: '50dvh' }}>
                    {isLoading && !error && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-[#00FFD1]/30 border-t-[#00FFD1] animate-spin" />
                                <span className="text-white/40 text-xs">Starting camera…</span>
                            </div>
                        </div>
                    )}

                    {error ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4">
                            <AlertTriangle size={32} className="text-amber-400" />
                            <p className="text-white/60 text-sm leading-relaxed">{error}</p>
                        </div>
                    ) : (
                        <>
                            {/* Mirror the video feed for front camera like a natural selfie */}
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                                style={{
                                    transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                                    opacity: isLoading ? 0 : 1,
                                    transition: 'opacity 0.3s ease'
                                }}
                            />
                            {/* Targeting overlay */}
                            {!isLoading && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div className="relative w-[80%] h-[65%]">
                                        {/* Corner indicators */}
                                        {[
                                            'top-0 left-0 border-t-2 border-l-2 rounded-tl-lg',
                                            'top-0 right-0 border-t-2 border-r-2 rounded-tr-lg',
                                            'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg',
                                            'bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg',
                                        ].map((cls, i) => (
                                            <div key={i} className={`absolute w-6 h-6 border-[#00FFD1] ${cls}`} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Controls */}
                <div className="px-8 py-6 flex flex-col items-center gap-4 bg-black border-t border-white/5">
                    {/* Capture button — only if camera is live */}
                    {!error && !isLoading && (
                        <button
                            onClick={handleCapture}
                            disabled={isCapturing}
                            className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-95 transition-all disabled:opacity-50"
                        >
                            <div className="w-16 h-16 rounded-full border-2 border-black/10 flex items-center justify-center">
                                {isCapturing
                                    ? <div className="w-6 h-6 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                                    : <Camera size={28} className="text-black" />
                                }
                            </div>
                            <div className="absolute inset-[-4px] rounded-full border border-white/20" />
                        </button>
                    )}

                    {/* Divider */}
                    <div className="flex items-center gap-3 w-full max-w-xs">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-[10px] text-white/30 uppercase tracking-widest">or upload</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* File upload fallback — always visible, critical for Windows/desktop */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs font-medium"
                    >
                        <Upload size={14} />
                        Choose from gallery / files
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                    />

                    <p className="text-[10px] text-white/20 text-center">
                        Works on Windows, iPhone & Android
                    </p>
                </div>
            </div>

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
