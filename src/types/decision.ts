export type DecisionIntent =
    | 'generate_blend'          // Standard engine run
    | 'refine_blend'            // Modification of existing
    | 'explain_concept'         // Educational, no engine change
    | 'answer_question'         // General QA
    | 'handle_greeting'         // Hello/Hi
    | 'handle_error'            // Confusion/Unclear
    | 'unknown';

export type ResponseMode =
    | 'action_then_explain'     // Do something, then talk about it
    | 'narrative_only'          // Just talk
    | 'silent_action';          // Do something, no commentary (rare)

export interface Decision {
    intent: DecisionIntent;
    requires_engine_mutation: boolean;
    requires_user_confirmation: boolean;
    target_entities?: string[]; // e.g., ["Blue Dream", "Sleep"]
    response_mode: ResponseMode;
    confidence: 'high' | 'medium' | 'low';
    reasoning: string;          // Internal chain-of-thought for the decision
}
