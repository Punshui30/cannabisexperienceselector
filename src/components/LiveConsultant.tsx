import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

repeat: Infinity,
    ease: "easeInOut"
                        }}
                    >
    <div className="w-8 h-8 rounded-full bg-[#00FFD1]/40" />
                    </motion.div >
                </div >

    {/* Consultant Text Display */ }
    < div className = "min-h-[120px] flex items-center justify-center" >
        <p className="text-lg text-white/80 leading-relaxed max-w-xl">
            {displayedText}
            <span className="inline-block w-0.5 h-5 bg-[#00FFD1] ml-1 animate-pulse" />
        </p>
                </div >

    {/* Consultant Analysis Label */ }
    < div className = "mt-8" >
        <p className="text-[10px] text-white/30 uppercase tracking-widest">
            Consultant Analysis
        </p>
                </div >
            </motion.div >
        </div >
    );
}
