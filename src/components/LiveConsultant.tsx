import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UIBlendRecommendation, UIStackRecommendation } from '../types/domain';
import { Send, X, Mic } from 'lucide-react';
import { callLLMChat } from '../lib/llmChat';

interface LiveConsultantProps {
    consultantText?: string;
    context?: {
        recommendation?: UIBlendRecommendation | UIStackRecommendation;
        userInput?: string;
        cardType?: 'primary' | 'secondary' | 'contextual';
    };
    onClose: () => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

function generateContextAwareIntro(context?: LiveConsultantProps['context']): string {
    if (!context?.recommendation) {
        return "Hi — do you have questions about your recommendations?";
    }

    const rec = context.recommendation;

    if (rec.kind === 'blend') {
        const blend = rec as UIBlendRecommendation;
        return `Hi — do you have questions about this ${blend.name}?`;
    } else {
        const stack = rec as UIStackRecommendation;
        return `Hi — do you have questions about this ${stack.name}?`;
    }
}

export function LiveConsultant({ consultantText, context, onClose }: LiveConsultantProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Initialize with context-aware intro
        const intro = consultantText || generateContextAwareIntro(context);
        setMessages([{ role: 'assistant', content: intro }]);
    }, [consultantText, context]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // Add user message
        const newUserMessage: Message = { role: 'user', content: userMessage };
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);

        try {
            // Call real LLM API
            const response = await callLLMChat(
                [...messages, newUserMessage].map(m => ({ role: m.role, content: m.content })),
                context
            );

            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I apologize, but I encountered an error. Please try again.'
            }]);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-lg h-[80vh] flex flex-col bg-[#0a0a0a]/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/5 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00FFD1]/5 to-transparent pointer-events-none" />
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFD1] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFD1]"></span>
                            </span>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-white shadow-[#00FFD1]/20 drop-shadow-sm">Live Consultant</h3>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider pl-4">
                            {context?.recommendation && 'recommendation' in context.recommendation ? 'Session Active' : 'AI Assistant'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white backdrop-blur-md border border-white/5"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <AnimatePresence initial={false} mode="popLayout">
                        {messages.map((message, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`
                                        max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm
                                        ${message.role === 'user'
                                            ? 'bg-[#00FFD1] text-black font-medium rounded-br-sm shadow-[0_0_15px_rgba(0,255,209,0.15)]'
                                            : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm backdrop-blur-md'
                                        }
                                    `}
                                >
                                    {message.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-5 py-4 backdrop-blur-md">
                                <div className="flex gap-1.5">
                                    {[0, 1, 2].map(j => (
                                        <motion.div
                                            key={j}
                                            className="w-1.5 h-1.5 rounded-full bg-[#00FFD1]/80"
                                            animate={{ y: [0, -3, 0] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: j * 0.1 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-5 bg-black/20 border-t border-white/10 backdrop-blur-md shrink-0">
                    <div className="flex gap-3 items-center relative">
                        {/* Voice Input Trigger */}
                        <button
                            className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-[#00FFD1] hover:border-[#00FFD1]/30 hover:bg-[#00FFD1]/5 flex items-center justify-center transition-all duration-300 group"
                            onClick={() => alert("Voice interface activating...")}
                            title="Voice Input"
                        >
                            <Mic size={18} className="group-hover:scale-110 transition-transform" />
                        </button>

                        <div className="flex-1 relative group">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="w-full bg-black/40 border border-white/10 rounded-full pl-5 pr-12 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00FFD1]/40 focus:bg-black/60 focus:shadow-[0_0_20px_rgba(0,255,209,0.05)] transition-all"
                                disabled={isLoading}
                                autoFocus
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className="absolute right-1.5 top-1.5 w-9 h-9 rounded-full bg-[#00FFD1] hover:bg-[#00FFD1]/90 disabled:bg-white/10 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-[0_0_10px_rgba(0,255,209,0.2)] hover:scale-105 active:scale-95"
                            >
                                <Send size={16} className={inputValue.trim() ? 'text-black' : 'text-white/40'} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
