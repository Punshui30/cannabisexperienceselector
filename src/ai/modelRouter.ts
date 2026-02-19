import { AI_CONFIG } from './config';

/**
 * MODEL ROUTER
 * 
 * Routes AI requests to specialized models based on task role.
 * Role-to-Model mapping is deploy-time configurable via env vars.
 */

export type ModelRole = 'reasoning' | 'writing' | 'vision';

export interface RouteRequest {
    role: ModelRole;
    messages: any[];
    options?: {
        temperature?: number;
        maxTokens?: number;
        timeout?: number;
    };
}

export interface RouteResponse {
    text: string;
    modelUsed: string;
    stopReason?: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
    };
}

/**
 * Main router entry point
 */
export async function routeAIRequest(req: RouteRequest): Promise<RouteResponse> {
    const { role, messages, options } = req;

    // 1. Select primary model based on role
    const primaryModel = getModelForRole(role);

    try {
        console.log(`[ROUTER] Routing '${role}' task to primary: ${primaryModel}`);
        return await callModel(primaryModel, messages, options);
    } catch (error: any) {
        console.warn(`[ROUTER] Primary model (${primaryModel}) failed for role '${role}'. Triggering fallback...`, error);

        // 2. Trigger fallback if primary fails
        const fallbackModel = AI_CONFIG.models.fallback;
        try {
            return await callModel(fallbackModel, messages, options);
        } catch (fallbackError: any) {
            console.error(`[ROUTER] Critical: All models failed for role '${role}'.`, fallbackError);
            throw fallbackError;
        }
    }
}

/**
 * Maps task role to configured model name
 */
function getModelForRole(role: ModelRole): string {
    switch (role) {
        case 'reasoning': return AI_CONFIG.models.reasoning;
        case 'writing': return AI_CONFIG.models.writing;
        case 'vision': return AI_CONFIG.models.vision;
        default: return AI_CONFIG.models.writing;
    }
}

/**
 * Low-level API call to backend /api/llm
 */
async function callModel(model: string, messages: any[], options?: any): Promise<RouteResponse> {
    const controller = new AbortController();
    const timeout = options?.timeout || 30000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch('/api/llm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                model,
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens ?? 1000,
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || `Upstream API failure: ${response.status}`);
        }

        const data = await response.json();
        return {
            text: data.choices?.[0]?.message?.content || '',
            modelUsed: model,
            usage: data.usage
        };

    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error(`Model request timed out after ${timeout}ms`);
        }
        throw error;
    }
}
