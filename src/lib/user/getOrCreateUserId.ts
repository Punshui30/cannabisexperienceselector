import { v4 as uuidv4 } from 'uuid';

export const USER_ID_KEY = 'sm_user_id';

/**
 * Returns a consistent anonymous UUID for the current browser, generating and storing
 * one if it doesn't already exist.
 */
export function getOrCreateUserId(): string {
    if (typeof window === 'undefined') {
        // Fallback for SSR
        return 'ssr-anonymous-user';
    }

    let userId = localStorage.getItem(USER_ID_KEY);

    if (!userId) {
        userId = uuidv4();
        localStorage.setItem(USER_ID_KEY, userId);
    }

    return userId as string;
}
