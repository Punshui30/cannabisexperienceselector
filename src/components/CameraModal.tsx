import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, RefreshCw } from 'lucide-react';
import { COLORS } from '../lib/colors';

interface CameraModalProps {
    onClose: () => void;
    onCapture: (blob: Blob) => void;
}

export function CameraModal({ onClose, onCapture }: CameraModalProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let activeStream: MediaStream | null = null;

        async function startCamera() {
            try {
                const constraints = {
                    video: {
                        facingMode: 'environment', // Prefer back camera on mobile
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    }
                };
                const newStream = await navigator.mediaDevices.getUserMedia(constraints);
                activeStream = newStream;
                setStream(newStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = newStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Could not access camera. Please ensure permissions are granted.");
            }
        }

        startCamera();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => {
                    track.stop();
                    console.log(`[CAMERA] Stopped track: ${track.label}`);
                });
            }
        };
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                // Match canvas size to video stream
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // Draw the current video frame
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Convert to Blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        onCapture(blob);
                        onClose();
                    }
                }, 'image/jpeg', 0.8);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="relative w-full max-w-lg h-full max-h-[85vh] bg-black rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex flex-col">
                        <h3 className="text-white font-serif text-xl leading-tight">Viewfinder</h3>
                        <span className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Guided Outcomes™ Vision</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-md"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Video Feed */}
                <div className="flex-1 bg-black relative">
                    {error ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                            <p className="text-red-400 mb-4">{error}</p>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-white/10 rounded-xl text-white text-sm"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover opacity-80"
                            />
                            {/* Guides */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-[80%] h-[60%] border border-white/30 rounded-3xl" />
                                <div className="absolute top-[20%] bottom-[20%] left-1/2 w-[1px] bg-white/10" />
                                <div className="absolute left-[10%] right-[10%] top-1/2 h-[1px] bg-white/10" />
                            </div>
                        </>
                    )}
                </div>

                {/* Controls */}
                <div className="p-8 pb-10 flex justify-center bg-black/80 backdrop-blur-md border-t border-white/5">
                    {!error && (
                        <button
                            onClick={handleCapture}
                            className="group relative w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 transition-all"
                        >
                            <div className="w-16 h-16 rounded-full border-2 border-black/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Camera size={32} className="text-black" />
                            </div>
                            {/* Inner Ring Glow */}
                            <div className="absolute inset-[-4px] rounded-full border border-white/20 animate-pulse-slow" />
                        </button>
                    )}
                </div>
            </div>

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
