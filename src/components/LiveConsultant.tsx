import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UIBlendRecommendation, UIStackRecommendation } from '../types/domain';
import { Send, X } from 'lucide-react';

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
        return "I'm here to help you understand your recommendations. What would you like to know?";
    }

    const rec = context.recommendation;
    const cardTypeLabel = context.cardType === 'primary' ? 'primary recommendation' :
        context.cardType === 'secondary' ? 'alternative approach' :
            context.cardType === 'contextual' ? 'experimental variant' : 'recommendation';

    if (rec.kind === 'blend') {
        const blend = rec as UIBlendRecommendation;
        const cultivarList = blend.cultivars.map(c => `${c.name} (${Math.round(c.ratio * 100)}%)`).join(', ');

        return `You're viewing the ${cardTypeLabel}: "${blend.name}". This blend combines ${cultivarList}. ${blend.reasoning || ''} What would you like to know?`;
    } else {
        const stack = rec as UIStackRecommendation;
        return `You're viewing the stack: "${stack.name}". ${stack.description} What questions do you have?`;
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
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        // Simulate LLM response (in production, this would call your LLM API)
        setTimeout(() => {
            const mockResponse = generateMockResponse(userMessage, context);
            setMessages(prev => [...prev, { role: 'assistant', content: mockResponse }]);
            setIsLoading(false);
        }, 1000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-2xl w-full mx-4 h-[80vh] flex flex-col bg-gradient-to-b from-[#1a1a1a] to-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-[#00FFD1] shadow-[0_0_12px_#00FFD1]" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#00FFD1]">
                            Live Consultation
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        <X size={16} className="text-white/60" />
                    </button>
                </div>

                {/* Context Info */}
                {context?.recommendation && (
                    <div className="px-6 py-3 bg-white/5 border-b border-white/10 flex-shrink-0">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
                            Discussing
                        </p>
                        <p className="text-sm text-white/80 font-medium">
                            {context.recommendation.name}
                        </p>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <AnimatePresence mode="popLayout">
                        {messages.map((message, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                            ? 'bg-[#00FFD1] text-black'
                                            : 'bg-white/10 text-white/90'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed">{message.content}</p>
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
                            <div className="bg-white/10 rounded-2xl px-4 py-3">
                                <div className="flex gap-1">
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-white/60"
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                    />
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-white/60"
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                    />
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-white/60"
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 flex-shrink-0">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about this blend or request changes…"
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#00FFD1]/50 transition-colors"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            className="w-12 h-12 rounded-xl bg-[#00FFD1] hover:bg-[#00FFD1]/90 disabled:bg-white/10 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                            <Send size={20} className={inputValue.trim() ? 'text-black' : 'text-white/40'} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// Mock response generator (replace with real LLM API call)
function generateMockResponse(userMessage: string, context?: LiveConsultantProps['context']): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('why') || lowerMessage.includes('reason')) {
        return context?.recommendation?.reasoning || "This recommendation was selected based on your preferences and the specific chemical profiles of the cultivars.";
    }

    if (lowerMessage.includes('ratio') || lowerMessage.includes('amount')) {
        if (context?.recommendation?.kind === 'blend') {
            const blend = context.recommendation as UIBlendRecommendation;
            return `The ratios are: ${blend.cultivars.map(c => `${c.name} at ${Math.round(c.ratio * 100)}%`).join(', ')}. These proportions are designed to balance the effects while maintaining consistency.`;
        }
    }

    if (lowerMessage.includes('change') || lowerMessage.includes('different') || lowerMessage.includes('adjust')) {
        return "I can help you explore alternatives. What specific aspect would you like to adjust? The ratio, the cultivars used, or the overall effect profile?";
    }

    if (lowerMessage.includes('effect') || lowerMessage.includes('feel')) {
        return context?.recommendation?.effects
            ? `This blend has an onset of ${context.recommendation.effects.onset}, peaks at ${context.recommendation.effects.peak}, and lasts ${context.recommendation.effects.duration}.`
            : "The effects are designed to match your stated preferences while maintaining a balanced experience.";
    }

    return "I'm here to help you understand this recommendation. Feel free to ask about the cultivars, ratios, effects, or request adjustments.";
}
