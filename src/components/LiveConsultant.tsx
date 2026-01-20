import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UIBlendRecommendation, UIStackRecommendation } from '../types/domain';
import { Send, X, Mic, Terminal, Check } from 'lucide-react';

interface LiveConsultantProps {
    consultantText?: string;
    context?: {
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Greeting
    useEffect(() => {
        const intro = consultantText || "System Ready. Adjust parameters or query logic.";
        setMessages([{ role: 'assistant', content: intro }]);
    }, [context?.recommendation?.id, consultantText]);

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
                        content: "Changes applied. Returning to updated results..."
                    }]);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl font-mono">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full max-w-lg h-[60vh] flex flex-col border border-white/20 bg-black shadow-2xl overflow-hidden"
            >
                {/* SYSTEM HEADER */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2 text-[#00FFD1]">
                        <Terminal size={14} />
                        <span className="text-xs font-bold tracking-widest uppercase">System Overlay</span>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* TERMINAL LOG */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex flex-col ${m.role === 'user' ? 'text-white/60' : 'text-[#00FFD1]'}`}>
                            <span className="whitespace-pre-wrap leading-relaxed">{m.content}</span>
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
                <div className="p-3 border-t border-white/10 bg-black">
                    <div className="flex items-center gap-2">
                        <span className="text-[#00FFD1] text-xs font-bold">{`>`}</span>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 bg-transparent border-none text-white text-xs focus:outline-none placeholder-white/20 font-mono"
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
