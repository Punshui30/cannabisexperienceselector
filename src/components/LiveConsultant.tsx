import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UIBlendRecommendation, UIStackRecommendation } from '../types/domain';
import { Send, X, Mic, Sparkles, Check, Brain } from 'lucide-react';

interface LiveConsultantProps {
    consultantText?: string;
    context?: {
        screen?: string;
        recommendation?: UIBlendRecommendation | UIStackRecommendation;
        userInput?: string;
        cardType?: 'primary' | 'secondary' | 'contextual';
    };
    onApplyResult?: (result: any) => void;
    onClose: () => void;
    isGenerating?: boolean;
}

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export function LiveConsultant({ consultantText, context, onApplyResult, onClose, isGenerating = false }: LiveConsultantProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRefactorComplete, setIsRefactorComplete] = useState(false);
    const [hasCommitted, setHasCommitted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Greeting (Context-Aware)
    useEffect(() => {
        let intro = consultantText;
        if (!intro) {
            switch (context?.screen) {
                case 'results':
                    intro = "I've analyzed these options. Would you like to refine the terpene profile or effect target?";
                    break;
                case 'blend-detail':
                    intro = "Analyzing blend synergy. Ask about specific terpene effects or request adjustments.";
                    break;
                case 'stack-detail':
                    intro = "Viewing Stack architecture. I can explain the layer interactions.";
                    break;
                case 'library':
                    intro = "Accessing Strain Library. Looking for a specific chemotype?";
                    break;
                case 'input':
                    intro = "System Ready. I can help you construct a query or explore presets.";
                    break;
                default:
                    intro = "System Ready. Adjust parameters or query logic.";
            }
        }
        setMessages([{ role: 'assistant', content: intro }]);
    }, [context?.recommendation?.id, context?.screen, consultantText]);

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

    const handleSendMessage = async () => {
        if (hasCommitted) return; // Prevent re-entry after commit
        if (isGenerating || isRefactorComplete || !inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue(''); // Hide input immediately

        // Log user command
        setMessages(prev => [...prev, { role: 'user', content: `> ${userMessage}` }]);
        setIsLoading(true);

        try {
            const { callLLMChat, triggerRefactor } = await import('../lib/llmChat');

            // 1. Read-only check
            const response = await callLLMChat(
                messages.map(m => ({ role: m.role, content: m.content.replace('> ', '') })),
                { ...context, userInput: userMessage }
            );

            // 2. Intent Detection
            const refactorMatch = response.text.match(/\[\[REFACTOR:\s*(.*?)\]\]/);

            if (refactorMatch) {
                const query = refactorMatch[1];

                // System Status Update
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `ACTION: Engine Refactor Initiated\nQUERY: "${query}"`
                }]);

                // 3. Trigger Engine
                const result = await triggerRefactor(query, { mode: 'blend-engine' });

                if (result.success) {
                    // SUCCESS STATE - MANDATED TERMINAL MESSAGE
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: "Changes applied. Updating results..."
                    }]);

                    setHasCommitted(true); // Lock out further input
                    setIsRefactorComplete(true); // Locks UI

                    if (onApplyResult) {
                        onApplyResult(result.data);
                    }
                } else {
                    throw new Error("Engine returned no results");
                }

            } else {
                // Standard Response
                setMessages(prev => [...prev, { role: 'assistant', content: response.text }]);
            }

        } catch (error) {
            console.error("System Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "ERROR: Processing failed. Retry command." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full max-w-lg h-[60vh] flex flex-col glass-card-neon-green shadow-2xl overflow-hidden border-[#00FFD120]"
            >
                {/* SYSTEM HEADER */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2 text-[#00FFD1]">
                        <Sparkles size={14} />
                        <span className="text-[10px] font-bold tracking-widest uppercase">Live Assistant</span>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* TERMINAL LOG */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${m.role === 'user'
                                ? 'bg-[#00FFD1] text-black font-semibold rounded-tr-none'
                                : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                                }`}>
                                {m.content.replace('> ', '')}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="text-white/40 animate-pulse">
                            Processing...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* INPUT LINE */}
                <div className="p-3 border-t border-white/10 bg-white/5">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white text-xs focus:outline-none focus:border-[#00FFD1]/50 placeholder-white/20"
                            placeholder={isLoading ? "Processing..." : "Enter command..."}
                            disabled={isLoading || isRefactorComplete}
                            autoFocus
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoading || isRefactorComplete}
                            className="p-2 text-[#00FFD1] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            {isRefactorComplete ? <Check size={14} /> : <Send size={14} />}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
