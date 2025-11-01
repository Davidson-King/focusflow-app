/**
 * Generates a v4 UUID.
 * Provides a fallback for browsers that don't support `crypto.randomUUID()`.
 * The fallback is not cryptographically secure but is sufficient for generating unique IDs.
 */
export const generateUUID = (): string => {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Basic fallback for older browsers.
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
