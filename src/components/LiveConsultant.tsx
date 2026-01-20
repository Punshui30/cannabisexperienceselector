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
    onApplyResult?: (result: any) => void;
    onClose: () => void;
    isGenerating?: boolean; // Guardrail prop
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

function generateContextAwareIntro(context?: LiveConsultantProps['context']): string {
    if (!context?.recommendation) {
        return "Tell me what you’re trying to feel or do, and I’ll help refine your experience.";
    }

    const rec = context.recommendation;
    const name = rec.name;

    return `Have questions about ${name}? I can explain why this blend fits your goal, suggest adjustments, or help refine it.`;
}

export function LiveConsultant({ consultantText, context, onApplyResult, onClose, isGenerating = false }: LiveConsultantProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const toggleVoiceInput = () => {
        if (isListening) {
            // Manual stop not typically needed for single-shot, but good UX
            setIsListening(false);
            return;
        }

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsListening(true);
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                if (transcript) {
                    setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
                }
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        } else {
            // Fallback for unsupported browsers
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "⚠️ **Voice Not Supported**\n\nYour browser doesn't support the Web Speech API. Please type your message."
            }]);
        }
    };

    useEffect(() => {
        // PROMPT 1 & 7: Fresh Start & Context-Aware Intro
        // Clear previous messages and initialize with context-aware intro
        const intro = consultantText || generateContextAwareIntro(context);
        setMessages([{ role: 'assistant', content: intro }]);

        // Ensure input is cleared
        setInputValue('');
    }, [context?.recommendation?.id, consultantText]); // Trigger on specific recommendation change or text override

    const handleSendMessage = async () => {
        // PROMPT 4: Stability Guardrail (Prevent race conditions during generation)
        if (isGenerating) {
            console.warn("⚠️ LIVE CONSULTANT: Blocked interaction during engine generation.");
            return;
        }

        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // Add user message
        const newUserMessage: Message = { role: 'user', content: userMessage };
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);

        try {
            // Import trigger function dynamically (or from module)
            const { callLLMChat, triggerRefactor } = await import('../lib/llmChat');

            // Call conversation facade (read-only first)
            const response = await callLLMChat(
                [...messages, newUserMessage].map(m => ({ role: m.role, content: m.content })),
                context
            );

            // CHECK FOR REFACTOR TAG
            const refactorMatch = response.text.match(/\[\[REFACTOR:\s*(.*?)\]\]/);

            if (refactorMatch) {
                // 1. Extract the Clean Text (Hide the tag)
                const cleanText = response.text.replace(/\[\[REFACTOR:.*?\]\]/, '').trim();
                const query = refactorMatch[1];

                // 2. Show the confirmation text immediately
                setMessages(prev => [...prev, { role: 'assistant', content: cleanText }]);

                // 3. Trigger the Refactor (Authoritative)
                console.log(`[LiveConsultant] Detected ACTION INTENT: ${query}`);

                // Show a "Thinking/Processing" indicator message? 
                // Alternatively, the UI is blocked by isLoading, generally. 
                // But we want to show we are "Working on it".
                const busyMessageId = Date.now();
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `🔄 **Updating Blends...**\nRunning engine with query: "${query}"`
                }]);

                const result = await triggerRefactor(query, {
                    mode: 'blend-engine' // Force engine mode
                });

                // 4. Validate and Apply
                if (result.success && result.data.length > 0) {
                    // Success!
                    // Remove busy message if possible, or just append success.
                    setMessages(prev => prev.filter(m => !m.content.includes('Updating Blends')));

                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: "✅ **Update Complete.**\nI've refactored your recommendations based on your request."
                    }]);

                    // Apply to App State
                    if (onApplyResult) {
                        onApplyResult(result.data);
                    }
                } else {
                    throw new Error("Engine returned no results");
                }

            } else {
                // Standard Chat Response (No Action)
                setMessages(prev => [...prev, { role: 'assistant', content: response.text }]);
            }

        } catch (error) {
            console.error("Live Consultant Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I encountered an error processing that request. Please try again."
            }]);
        } finally {
            setIsLoading(false);
            setInputValue(''); // Clear input
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-lg h-[80vh] flex flex-col glass-card overflow-hidden relative"
                style={{
                    background: `
                        linear-gradient(rgba(10, 10, 10, 0.95), rgba(0, 0, 0, 0.98)) padding-box, 
                        linear-gradient(135deg, #00FFD140 0%, #BF5AF220 45%, rgba(255,255,255,0.2) 50%, #00FFD130 100%) border-box
                    `,
                    border: '1px solid transparent',
                    boxShadow: `
                        inset 0 1px 1px 0 rgba(255, 255, 255, 0.05), 
                        inset 0 0 20px -10px #00FFD120,
                        0 20px 60px -10px rgba(0, 0, 0, 0.5)
                    `,
                }}
            >
                {/* Header - Premium Glass Treatment */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent relative overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00FFD1]/30 to-transparent" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFD1] opacity-50"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFD1] shadow-[0_0_10px_#00FFD1]"></span>
                            </span>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">Live Consultant</h3>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest pl-5 font-medium">
                            {context?.recommendation && 'recommendation' in context.recommendation ? 'Session Active' : 'AI Assistant'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white border border-white/10 hover:border-white/20 group"
                    >
                        <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Messages Area - Premium Scrollbar */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <AnimatePresence initial={false} mode="popLayout">
                        {messages.map((message, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`
                                        max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed relative overflow-hidden
                                        ${message.role === 'user'
                                            ? 'bg-gradient-to-br from-[#00FFD1] to-[#00E0B8] text-black font-medium rounded-br-md shadow-[0_4px_20px_rgba(0,255,209,0.25)]'
                                            : 'backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-white/90 rounded-bl-md shadow-lg'
                                        }
                                    `}
                                    style={message.role === 'assistant' ? {
                                        boxShadow: `
                                            inset 0 1px 1px 0 rgba(255, 255, 255, 0.1),
                                            0 4px 16px rgba(0, 0, 0, 0.3)
                                        `
                                    } : undefined}
                                >
                                    {/* Subtle top shine for assistant bubbles */}
                                    {message.role === 'assistant' && (
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                    )}

                                    {/* Render message with markdown-style formatting */}
                                    <div className="whitespace-pre-wrap">
                                        {message.content.split('\n').map((line, idx) => {
                                            // Handle bold markdown
                                            if (line.startsWith('**') && line.endsWith('**')) {
                                                return <div key={idx} className="font-bold text-[#00FFD1] mb-2">{line.slice(2, -2)}</div>;
                                            }
                                            // Handle italic markdown
                                            if (line.startsWith('*') && line.endsWith('*')) {
                                                return <div key={idx} className="italic text-white/60 text-xs mt-2">{line.slice(1, -1)}</div>;
                                            }
                                            // Handle warning emoji
                                            if (line.startsWith('⚠️')) {
                                                return <div key={idx} className="flex items-center gap-2 mb-2"><span className="text-lg">⚠️</span><span className="font-bold text-orange-400">{line.slice(2)}</span></div>;
                                            }
                                            return line ? <div key={idx} className="mb-1">{line}</div> : <div key={idx} className="h-2" />;
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Loading State - Premium Treatment */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl rounded-bl-md px-6 py-5 shadow-lg"
                                style={{
                                    boxShadow: `
                                        inset 0 1px 1px 0 rgba(255, 255, 255, 0.1),
                                        0 4px 16px rgba(0, 0, 0, 0.3)
                                    `
                                }}
                            >
                                <div className="flex gap-1.5">
                                    {[0, 1, 2].map(j => (
                                        <motion.div
                                            key={j}
                                            className="w-2 h-2 rounded-full bg-[#00FFD1]"
                                            animate={{
                                                y: [0, -6, 0],
                                                opacity: [0.4, 1, 0.4],
                                                scale: [1, 1.2, 1]
                                            }}
                                            transition={{ duration: 0.8, repeat: Infinity, delay: j * 0.15 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Input Area - Premium Floating Pill */}
                <div className="p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent shrink-0">
                    <div className="relative group">
                        {/* Glow underlayer on focus */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFD1]/20 to-[#BF5AF2]/20 rounded-full blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

                        {/* Guardrail Overlay */}
                        {isGenerating && (
                            <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] rounded-full flex items-center justify-center">
                                <span className="text-[10px] text-white/60 uppercase tracking-widest font-medium animate-pulse">
                                    System Syncing...
                                </span>
                            </div>
                        )}

                        <div className="relative flex items-center backdrop-blur-xl bg-[#0a0a0a]/90 border border-white/10 rounded-full p-1.5 shadow-2xl"
                            style={{
                                boxShadow: `
                                    inset 0 1px 1px 0 rgba(255, 255, 255, 0.05),
                                    0 8px 32px rgba(0, 0, 0, 0.4)
                                `
                            }}
                        >
                            {/* Voice Trigger */}
                            <button
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ml-1 ${isListening
                                    ? 'bg-[#00FFD1]/20 text-[#00FFD1] animate-pulse'
                                    : 'text-white/40 hover:text-[#00FFD1] hover:bg-white/5'
                                    }`}
                                onClick={toggleVoiceInput}
                            >
                                <Mic size={18} className={isListening ? 'animate-bounce' : ''} />
                            </button>

                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 bg-transparent border-none text-white placeholder-white/30 text-sm px-4 focus:outline-none h-10 tracking-wide"
                                disabled={isLoading}
                                autoFocus
                            />

                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FFD1] to-[#00E0B8] hover:from-[#00E0B8] hover:to-[#00FFD1] disabled:from-white/10 disabled:to-white/5 disabled:cursor-not-allowed flex items-center justify-center text-black shadow-lg shadow-[#00FFD1]/20 transition-all hover:scale-105 active:scale-95 disabled:shadow-none"
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
