import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UIBlendRecommendation, UIStackRecommendation } from '../types/domain';
import { InvocationContext } from '../types/context';
import { Send, X, Mic, Sparkles, Check } from 'lucide-react';

import { startListening } from '../lib/speech';
import { callLLMChat } from '../lib/llmChat';

export interface LiveConsultantProps {
    consultantText?: string;
    context?: InvocationContext;
    onApplyResult?: (result: any) => void;
    onClose: () => void;
    isGenerating?: boolean;
    consultantMode?: 'default' | 'clarification_required';
    recommendation?: UIBlendRecommendation | UIStackRecommendation;
}

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export function LiveConsultant(props: LiveConsultantProps) {
    const { consultantText, context, onApplyResult, onClose, isGenerating = false, recommendation } = props;
    const consultantMode: 'default' | 'clarification_required' = props.consultantMode || 'default';
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRefactorComplete, setIsRefactorComplete] = useState(false);
    const [hasCommitted, setHasCommitted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleMicClick = () => {
        startListening(t => setInputValue(prev => prev ? `${prev} ${t}` : t), setIsListening);
    };

    // Initial Greeting (Context-Aware)
    useEffect(() => {
        // MODE 1: CLARIFICATION REQUIRED (Engine-Triggered Ambiguity)
        if (consultantMode === 'clarification_required') {
            setMessages([{
                role: 'assistant',
                content: consultantText || "Let's dial this in. To get it strictly right, I need to know: what's usually \"not hitting\" for you?"
            }]);
            return;
        }

        // MODE 3: DEFAULT (Chat Assistant)
        // Log context binding for debugging
        if (context) {
            console.log(`[ASSISTANT_CONTEXT_BOUND] view=${context.viewType} entity=${context.activeEntityType || 'none'} id=${context.activeEntityId || 'none'} mode=${consultantMode}`);
        }

        let intro = consultantText || "";
        if (!intro) {
            switch (context?.viewType) {
                case 'results':
                    intro = context.activeEntityType === 'stack'
                        ? "Viewing stack results. I can modify layers, add phases, or adjust timing."
                        : "I've analyzed these blend options. Would you like to refine the terpene profile or effect target?";
                    break;
                case 'blend-detail':
                    intro = "Analyzing blend synergy. Ask about specific terpene effects or request adjustments.";
                    break;
                case 'stack-detail':
                case 'stack-card':
                    intro = context.activeEntityType === 'stack'
                        ? "Stack Protocol Assistant: I can add layers, modify phases, or adjust timing. What would you like to change?"
                        : "Viewing Stack architecture. I can explain the layer interactions.";
                    break;
                case 'resolution':
                    intro = context.activeEntityType === 'stack'
                        ? "Resolution Assistant: Modify this stack before generating session artifacts."
                        : "Resolution Assistant: Refine this blend before generating session artifacts.";
                    break;
                case 'checkout':
                case 'share':
                    intro = "Session Review: This blend has been prepared for your records.";
                    break;
                case 'library':
                    intro = "Accessing Strain Library. Looking for a specific chemotype?";
                    break;
                case 'input':
                    intro = "Hi, I'm your StrainMath™ Assistant. I can help you construct a query or explore presets.";
                    break;
                default:
                    intro = "Hi, I'm your StrainMath™ Assistant. Adjust parameters or query logic.";
            }
        }
        setMessages([{ role: 'assistant', content: intro }]);
    }, [context?.activeEntityId, context?.viewType, consultantText, consultantMode]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // TRANSACTIONAL EXIT: Auto-close after success
    useEffect(() => {
        if (isRefactorComplete) {
            const timer = setTimeout(() => {
                onClose();
            }, 500); // 500ms mandated delay
            return () => clearTimeout(timer);
        }
    }, [isRefactorComplete, onClose]);

    // --- CLARIFICATION LOGIC ---
    const submitClarification = (clarification: string) => {
        const payload = {
            directionalIssue: 'Clarified',
            stabilityContext: 'None',
            targetGoal: 'None',
            additionalDetail: clarification
        };

        // Final message
        setMessages(prev => [...prev, { role: 'user', content: clarification }]);
        setMessages(prev => [...prev, { role: 'assistant', content: "Calibration Signal Received. Re-running logic." }]);

        setHasCommitted(true);
        setIsRefactorComplete(true);

        if (onApplyResult) {
            onApplyResult(payload);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // MODE: CLARIFICATION REQUIRED
        if (consultantMode === 'clarification_required') {
            submitClarification(userMessage);
            return;
        }

        // DEFAULT CHAT LOGIC
        const newMessages = [...messages, { role: 'user', content: userMessage } as Message];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await callLLMChat(newMessages, {
                userInput: userMessage,
                recommendation
            });

            if (response && response.text) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.text
                }]);
            }
            setIsLoading(false);

        } catch (error) {
            setMessages(prev => [...prev, { role: 'system', content: "Lost contact with refinement engine." }]);
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 bottom-24 z-[100] max-w-lg mx-auto"
        >
            <div className="bg-black/80 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh]">
                {/* SYSTEM HEADER */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2 text-[#00FFD1]">
                        <Sparkles size={14} />
                        <span className="text-[10px] font-bold tracking-widest uppercase">
                            {consultantMode === 'clarification_required' ? "Clarification Required" : "StrainMath Assistant"}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* MESSAGE AREA */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${m.role === 'user'
                                ? 'bg-[#00FFD1] text-black font-medium rounded-tr-none'
                                : 'bg-white/10 text-white/90 border border-white/5 rounded-tl-none'
                                }`}>
                                {m.content}
                            </div>
                        </div>
                    ))}


                    {/* CLARIFICATION MODE RENDERING */}
                    {consultantMode === 'clarification_required' && !hasCommitted && (
                        <div className="flex flex-col items-end gap-2 mt-2">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mr-2">Quick Responses</div>
                            <div className="flex flex-wrap justify-end gap-2">
                                {["It's usually too weak", "I get anxious", "Just doesn't feel right"].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => {
                                            setInputValue(opt);
                                        }}
                                        className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/70 text-[10px] hover:border-[#00FFD1] hover:text-[#00FFD1] hover:bg-[#00FFD1]/5 transition-all"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* INPUT AREA */}
                <div className="p-4 bg-white/5 border-t border-white/10">
                    <div className="relative">
                        {isGenerating ? (
                            <div className="flex items-center justify-center py-2 gap-3">
                                <div className="w-1.5 h-1.5 bg-[#00FFD1] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-1.5 h-1.5 bg-[#00FFD1] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1.5 h-1.5 bg-[#00FFD1] rounded-full animate-bounce" />
                                <span className="text-[10px] text-[#00FFD1] uppercase tracking-[0.2em] font-bold">Optimizing Logic</span>
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-10 py-2 text-white text-xs focus:outline-none focus:border-[#00FFD1]/50 placeholder-white/20"
                                    placeholder={isLoading ? "Processing..." : "Enter response..."}
                                    disabled={isLoading || isRefactorComplete}
                                    autoFocus
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#00FFD1] hover:scale-110 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all"
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-[#00FFD1] border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Send size={16} />
                                    )}
                                </button>
                                <button
                                    onClick={handleMicClick}
                                    className={`absolute right-10 top-1/2 -translate-y-1/2 p-1 transition-all ${isListening ? 'text-red-500 animate-pulse' : 'text-white/20 hover:text-white'}`}
                                >
                                    <Mic size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
