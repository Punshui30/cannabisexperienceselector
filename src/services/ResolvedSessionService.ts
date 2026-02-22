import type { UIBlendRecommendation } from '../types/domain';

// Real session artifact - created when Engine Core V3 finalizes
export interface ResolvedSession {
  sessionId: string;
  type: 'checkout' | 'share';
  blends: UIBlendRecommendation[];
  createdAt: string;
  expiresAt?: string; // Optional expiration for checkout sessions
  vibeTrackUrl?: string; // Optional AI music track URL
}

// In-memory session storage (development/demo-ready)
class ResolvedSessionStore {
  private static readonly sessions = new Map<string, ResolvedSession>();

  static save(session: ResolvedSession): void {
    try {
      this.sessions.set(session.sessionId, session);
      console.log(`[ResolvedSession] Saved session: ${session.sessionId}`);
    } catch (error) {
      console.error('[ResolvedSession] Failed to save session:', error);
      throw new Error('Could not save session');
    }
  }

  static get(sessionId: string): ResolvedSession | null {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) return null;

      // Check expiration for checkout sessions
      if (session.expiresAt && new Date() > new Date(session.expiresAt)) {
        this.delete(sessionId);
        return null;
      }

      return session;
    } catch (error) {
      console.error('[ResolvedSession] Failed to retrieve session:', error);
      return null;
    }
  }

  static delete(sessionId: string): void {
    try {
      this.sessions.delete(sessionId);
      console.log(`[ResolvedSession] Deleted session: ${sessionId}`);
    } catch (error) {
      console.error('[ResolvedSession] Failed to delete session:', error);
    }
  }

  static generateSessionId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 for clarity
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Public API
export const ResolvedSessionService = {
  /**
   * Creates a real resolved session when Engine Core V3 finalizes
   */
  createSession: (blends: UIBlendRecommendation[], type: 'checkout' | 'share', vibeTrackUrl?: string): ResolvedSession => {
    const sessionId = ResolvedSessionStore.generateSessionId();

    const session: ResolvedSession = {
      sessionId,
      type,
      blends,
      vibeTrackUrl,
      createdAt: new Date().toISOString(),
      // Checkout sessions expire after 24 hours
      expiresAt: type === 'checkout' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined
    };

    ResolvedSessionStore.save(session);
    return session;
  },

  /**
   * Retrieves a resolved session by ID
   */
  getSession: (sessionId: string): ResolvedSession | null => {
    return ResolvedSessionStore.get(sessionId);
  }
};