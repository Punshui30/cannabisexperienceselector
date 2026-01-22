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
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
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
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6">
            <div className="relative w-full max-w-lg aspect-[3/4] bg-white/5 rounded-3xl border border-white/10 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
                    <h3 className="text-white font-light serif text-lg">Viewfinder</h3>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
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
                                className="w-full h-full object-cover"
                            />
                            {/* Guides */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-8 border border-white/20 rounded-2xl" />
                                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10" />
                                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/10" />
                            </div>
                        </>
                    )}
                </div>

                {/* Controls */}
                <div className="p-8 flex justify-center bg-black">
                    {!error && (
                        <button
                            onClick={handleCapture}
                            className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
                        >
                            <div className="w-16 h-16 rounded-full border-4 border-black/5 flex items-center justify-center">
                                <Camera size={32} className="text-black" />
                            </div>
                        </button>
                    )}
                </div>
            </div>

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
