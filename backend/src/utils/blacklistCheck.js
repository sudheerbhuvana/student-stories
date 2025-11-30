import Blacklist from '../models/Blacklist.js';

export const containsBlacklistedWords = async (text) => {
    if (!text) return false;

    // Get all blacklisted words
    const blacklist = await Blacklist.find({});
    const blacklistedWords = blacklist.map(item => item.word.toLowerCase());

    if (blacklistedWords.length === 0) return false;

    const lowerText = text.toLowerCase();

    // Check if any blacklisted word is present in the text
    // We use word boundary check or simple inclusion depending on strictness
    // For now, let's do simple inclusion but maybe ensure it's not part of another word if desired?
    // User said "contains", so let's stick to simple inclusion for now, or maybe word boundary is safer to avoid Scunthorpe problem.
    // Let's try to match whole words to be safe, or just check inclusion if the user wants strict filtering.
    // Given "refuse to accept", let's be strict.

    for (const word of blacklistedWords) {
        // Check for exact word match or word boundary match
        // \bword\b
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(lowerText)) {
            return true;
        }
    }

    return false;
};
