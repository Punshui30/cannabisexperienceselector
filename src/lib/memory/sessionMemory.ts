import { IntentSpec, DecisionReceipt } from '../../types/domain';

/**
 * SESSION MEMORY STORE
 * 
 * Ephemeral storage for the current AI session.
 * Lives in localStorage but cleared on app reload or session reset.
 */

const STORAGE_KEY = 'cas_ai_session_memory';

export interface SessionMemory {
    lastIntentSpec?: IntentSpec;
    lastEngineReceipt?: DecisionReceipt;
    recentQueries: string[];
    userPreferences: {
        preferredVibe?: string;
        avoidStrains: string[];
    };
}

const DEFAULT_MEMORY: SessionMemory = {
    recentQueries: [],
    userPreferences: {
        avoidStrains: []
    }
};

export const SessionMemoryStore = {
    get(): SessionMemory {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : DEFAULT_MEMORY;
        } catch {
            return DEFAULT_MEMORY;
        }
    },

    set(memory: Partial<SessionMemory>) {
        const current = this.get();
        const updated = { ...current, ...memory };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },

    addQuery(query: string) {
        const current = this.get();
        const updated = [query, ...current.recentQueries].slice(0, 10);
        this.set({ recentQueries: updated });
    },

    clear() {
        localStorage.removeItem(STORAGE_KEY);
    }
};
