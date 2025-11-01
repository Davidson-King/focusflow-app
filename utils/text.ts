// utils/text.ts

/**
 * Strips HTML tags from a string and counts the words.
 * @param htmlString The string containing HTML.
 * @returns The number of words.
 */
export const countWords = (htmlString: string): number => {
    if (!htmlString) return 0;
    // Strip HTML tags and entities, then count words.
    const text = htmlString.replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/g, ' ');
    const trimmedText = text.trim();
    if (!trimmedText) return 0;
    // Split by any sequence of whitespace characters.
    return trimmedText.split(/\s+/).length;
};
