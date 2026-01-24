import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UIBlendRecommendation, UIStackRecommendation } from '../types/domain';
import { InvocationContext } from '../types/context';
import { Send, X, Mic, Sparkles, Check, Brain } from 'lucide-react';

import { startListening } from '../lib/speech';

interface LiveConsultantProps {
    consultantText?: string;
    context?: InvocationContext;
    onApplyResult?: (result: any) => void;
    onClose: () => void;
    isGenerating?: boolean;
    consultantMode?: 'default' | 'accuracy_enhancement' | 'clarification_required';
}

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface AccuracyState {
    step: number;
    issue: string;
    sensitivity: string;
    goal: string;
    detail: string;
}

export function LiveConsultant(props: LiveConsultantProps) {
    const { consultantText, context, onApplyResult, onClose, isGenerating = false } = props;
    const consultantMode: 'default' | 'accuracy_enhancement' | 'clarification_required' = props.consultantMode || 'default';
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRefactorComplete, setIsRefactorComplete] = useState(false);
    const [hasCommitted, setHasCommitted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Accuracy Mode State
    const [accuracyState, setAccuracyState] = useState<AccuracyState>({
        step: 0,
        issue: '',
        sensitivity: '',
        goal: '',
        detail: ''
    });

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

        // MODE 2: ACCURACY ENHANCEMENT (User-Triggered Optimization)
        if (consultantMode === 'accuracy_enhancement') {
            setMessages([{
                role: 'assistant',
                content: "I'd like to ask 3 quick questions. First: Which of these challenges do you encounter most often?"
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
    }, [messages, isLoading, accuracyState.step]);

    // TRANSACTIONAL EXIT: Auto-close after success
    useEffect(() => {
        if (isRefactorComplete) {
            const timer = setTimeout(() => {
                onClose();
            }, 500); // 500ms mandated delay
            return () => clearTimeout(timer);
        }
    }, [isRefactorComplete, onClose]);

    // --- ACCURACY LOGIC ---
    const handleAccuracyResponse = (value: string) => {
        const nextState = { ...accuracyState };
        let nextMessage = "";

        if (accuracyState.step === 0) {
            nextState.issue = value;
            nextState.step = 1;
            nextMessage = "Got it. How's your sensitivity lately? (Tolerance level)";
        } else if (accuracyState.step === 1) {
            nextState.sensitivity = value;
            nextState.step = 2;
            nextMessage = "Understood. Ideally, what are we aiming for right now?";
        } else if (accuracyState.step === 2) {
            nextState.goal = value;
            nextState.step = 3;
            nextMessage = "Last thing: Anything else specific that helps get this right? (Or just send to finish)";
        }

        setAccuracyState(nextState);
        setMessages(prev => [
            ...prev,
            { role: 'user', content: value },
            { role: 'assistant', content: nextMessage }
        ]);
    };

    const submitAccuracy = (finalDetail: string) => {
        const payload = {
            directionalIssue: accuracyState.issue,
            stabilityContext: accuracyState.sensitivity,
            targetGoal: accuracyState.goal,
            additionalDetail: finalDetail
        };

        // Final message
        setMessages(prev => [...prev, { role: 'user', content: finalDetail || "Detailed enough." }]);
        setMessages(prev => [...prev, { role: 'assistant', content: "Calibrating engine with strict constraints..." }]);

        setHasCommitted(true);
        setIsRefactorComplete(true);

        if (onApplyResult) {
            onApplyResult(payload);
        }
    };

    // --- CLARIFICATION LOGIC ---
    const submitClarification = (clarification: string) => {
        // Simple payload for clarification: Issue resolved by text
        const payload = {
            directionalIssue: 'Clarified', // Internal signal
            stabilityContext: 'None',
            targetGoal: 'None',
            additionalDetail: clarification
        };

        setMessages(prev => [...prev, { role: 'user', content: clarification }]);
        setMessages(prev => [...prev, { role: 'assistant', content: "Understood. Adjusting search..." }]);

        setHasCommitted(true);
        setIsRefactorComplete(true);

        if (onApplyResult) {
            onApplyResult(payload);
        }
    };

    const handleSendMessage = async () => {
        if (hasCommitted) return;
        if (isGenerating || isRefactorComplete || !inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // MODE: ACCURACY ENHANCEMENT
        if (consultantMode === 'accuracy_enhancement') {
            if (accuracyState.step === 3) {
                submitAccuracy(userMessage);
            }
            return;
        }

        // MODE: CLARIFICATION REQUIRED
        if (consultantMode === 'clarification_required') {
            submitClarification(userMessage);
            return;
        }

        // MODE: DEFAULT (Standard Chat Logic)
        const newUserMessage: Message = { role: 'user', content: `> ${userMessage}` };
        const updatedHistory = [...messages, newUserMessage];

        setMessages(updatedHistory);
        setIsLoading(true);

        try {
            const { callLLMChat, triggerRefactor } = await import('../lib/llmChat');

            // 1. Read-only check - PASS UPDATED HISTORY
            const response = await callLLMChat(
                updatedHistory.map(m => ({ role: m.role, content: m.content.replace('> ', '') })),
                { ...context, userInput: userMessage }
            );

            // 2. Intent Detection
            const refactorMatch = response.text.match(/\[\[REFACTOR:\s*(.*?)\]\]/);

            if (refactorMatch) {
                const query = refactorMatch[1];

                // 3. Trigger Engine with full context
                const result = await triggerRefactor(query, {
                    ...context,
                    mode: context?.activeEntityType === 'stack' ? 'stack-mutation' : 'blend-engine'
                });

                if (result.success) {
                    // SUCCESS STATE - Use Expert Rationale from Engine
                    const script = `StrainMath Operator System: ${result.analysis?.consultationScript || "Changes applied. Updating results..."}`;

                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: script
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
                className="w-full max-w-lg h-[60%] flex flex-col glass-card-neon-green shadow-2xl overflow-hidden border-[#00FFD120]"
            >
                {/* SYSTEM HEADER */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2 text-[#00FFD1]">
                        {consultantMode === 'accuracy_enhancement' ? <Brain size={14} /> : <Sparkles size={14} />}
                        <span className="text-[10px] font-bold tracking-widest uppercase">
                            {consultantMode === 'accuracy_enhancement' ? "Calibration Mode" : (consultantMode === 'clarification_required' ? "Clarification Required" : "StrainMath Assistant")}
                        </span>
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

                    {/* ACCURACY OPTIONS RENDERING */}
                    {consultantMode === 'accuracy_enhancement' && !hasCommitted && (
                        <div className="flex flex-col items-end gap-2 mt-2">
                            {accuracyState.step === 0 && (
                                <div className="flex flex-wrap justify-end gap-2">
                                    {["Too Weak", "Too Strong", "Anxiety", "Inconsistent"].map(opt => (
                                        <button key={opt} onClick={() => handleAccuracyResponse(opt)} className="px-3 py-1.5 rounded-full border border-[#00FFD1]/30 text-[#00FFD1] text-[10px] uppercase hover:bg-[#00FFD1]/10 transition-colors">
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {accuracyState.step === 1 && (
                                <div className="flex flex-wrap justify-end gap-2">
                                    {["Low (Sensitive)", "Normal", "High (Tank)"].map(opt => (
                                        <button key={opt} onClick={() => handleAccuracyResponse(opt)} className="px-3 py-1.5 rounded-full border border-[#00FFD1]/30 text-[#00FFD1] text-[10px] uppercase hover:bg-[#00FFD1]/10 transition-colors">
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {accuracyState.step === 2 && (
                                <div className="flex flex-wrap justify-end gap-2">
                                    {["Focus / Work", "Social / Fun", "Sleep / Rest", "Pain Relief"].map(opt => (
                                        <button key={opt} onClick={() => handleAccuracyResponse(opt)} className="px-3 py-1.5 rounded-full border border-[#00FFD1]/30 text-[#00FFD1] text-[10px] uppercase hover:bg-[#00FFD1]/10 transition-colors">
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

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
                                            // Optional: auto-send? Let's populate input for now.
                                        }}
                                        className="px-3 py-1.5 rounded-full border border-[#00FFD1]/30 text-[#00FFD1] text-[10px] uppercase hover:bg-[#00FFD1]/10 transition-colors"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

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
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-10 py-2 text-white text-xs focus:outline-none focus:border-[#00FFD1]/50 placeholder-white/20"
                                placeholder={consultantMode === 'accuracy_enhancement' && accuracyState.step < 3 ? "Select an option above..." : (isLoading ? "Processing..." : "Enter response...")}
                                disabled={isLoading || isRefactorComplete || (consultantMode === 'accuracy_enhancement' && accuracyState.step < 3)}
                                autoFocus
                            />
                            <button
                                onClick={handleMicClick}
                                disabled={isLoading || isRefactorComplete}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/10 text-white/30 hover:text-[#00FFD1]'}`}
                            >
                                <Mic size={14} />
                            </button>
                        </div>
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

