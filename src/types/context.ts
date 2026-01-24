// Global Assistant Context Types

export interface InvocationContext {
  route: string;                    // Current URL path
  viewType: 'dashboard' | 'stack-card' | 'stack-detail' | 'blend-card' | 'blend-detail' | 'resolution' | 'results' | 'checkout' | 'share' | 'library' | 'admin' | 'remote-access' | 'live-feed' | 'input' | 'presets' | 'resolving' | 'error';
  activeEntityType: 'stack' | 'blend' | 'cultivar' | 'preset' | null;
  activeEntityId: string | null;
  mode: 'browse' | 'edit' | 'protocol' | 'live_assist' | 'create';
  screen: string;                   // Legacy compatibility
  recommendation?: any;            // Legacy compatibility
  userInput?: string;              // Legacy compatibility
  cardType?: 'primary' | 'secondary' | 'contextual'; // Legacy compatibility
}

export interface ContextBoundFlags {
  contextBound: boolean;
  mutationScope: 'global' | 'entity_scoped';
  allowDiscovery: boolean;
  intentMode: 'context_bound' | 'discovery' | 'general';
  stackMode?: boolean;
  activeStackId?: string;
}

/**
 * GLOBAL ASSISTANT CONTEXT GUARD — AUTHORITATIVE
 *
 * Determines if assistant should operate in context-bound mode
 */
export function createContextBoundFlags(invocationContext: InvocationContext, userInput: string): ContextBoundFlags {
  const flags: ContextBoundFlags = {
    contextBound: false,
    mutationScope: 'global',
    allowDiscovery: true,
    intentMode: 'general'
  };

  // Context exists - force entity-scoped behavior
  if (invocationContext?.activeEntityType && invocationContext?.activeEntityId) {
    // Only override if user hasn't explicitly opted out
    if (!userExplicitlyOptedOut(userInput)) {
      flags.contextBound = true;
      flags.mutationScope = 'entity_scoped';
      flags.allowDiscovery = false;
      flags.intentMode = 'context_bound';

      // Stack-specific behavior
      if (invocationContext.activeEntityType === 'stack') {
        flags.stackMode = true;
        flags.activeStackId = invocationContext.activeEntityId;
      }
    }
  }

  return flags;
}

/**
 * Check if user explicitly opted out of context binding
 */
export function userExplicitlyOptedOut(text: string): boolean {
  return /(new|separate|ignore this|don't change|do not change|from scratch|create new|new blend|new stack)/i.test(text);
}