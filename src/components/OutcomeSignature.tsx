import React from 'react';
import { motion } from 'motion/react';
import fingerprintImg from '../assets/strainmath_fingerprint.svg';

export function OutcomeSignature() {
    return (
        <div className="relative w-full h-[280px] sm:h-[320px] flex items-center justify-center pointer-events-none select-none overflow-visible">
            <img
                src={fingerprintImg}
                alt="Outcome Signature"
                className="w-full h-full object-contain opacity-90 mix-blend-screen"
                style={{ filter: "drop-shadow(0 0 30px rgba(124, 58, 237, 0.2))" }}
            />
        </div>
    );
}
