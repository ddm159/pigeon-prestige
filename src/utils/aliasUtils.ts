/**
 * Utility functions for handling pigeon aliases and forbidden word detection
 */

// List of forbidden words that should be replaced with CR7
const FORBIDDEN_WORDS = [
  'messi',
  'yamal', 
  'barcelona',
  'barca'
];

/**
 * Checks if a given alias contains any forbidden words (case insensitive)
 * @param alias - The alias to check
 * @returns true if the alias contains forbidden words, false otherwise
 */
export function containsForbiddenWords(alias: string): boolean {
  const lowerAlias = alias.toLowerCase();
  return FORBIDDEN_WORDS.some(word => lowerAlias.includes(word));
}

/**
 * Replaces any words containing forbidden words with "CR7"
 * @param alias - The alias to process
 * @returns The processed alias with words containing forbidden words replaced
 */
export function replaceForbiddenWords(alias: string): string {
  const processedAlias = alias;
  
  // Split the alias into words
  const words = processedAlias.split(/\s+/);
  
  const processedWords = words.map(word => {
    // Check if this word contains any forbidden word (case insensitive)
    const lowerWord = word.toLowerCase();
    const containsForbidden = FORBIDDEN_WORDS.some(forbidden => 
      lowerWord.includes(forbidden.toLowerCase())
    );
    
    // If the word contains a forbidden word, replace the entire word with CR7
    return containsForbidden ? 'CR7' : word;
  });
  
  return processedWords.join(' ');
}

/**
 * Validates and processes an alias input
 * @param alias - The raw alias input from user
 * @returns The processed alias (with forbidden words replaced) or null if empty
 */
export function processAlias(alias: string): string | null {
  if (!alias || alias.trim() === '') {
    return null;
  }
  
  const trimmedAlias = alias.trim();
  
  // Check if the alias contains forbidden words
  if (containsForbiddenWords(trimmedAlias)) {
    return replaceForbiddenWords(trimmedAlias);
  }
  
  return trimmedAlias;
}

/**
 * Gets the display name for a pigeon (alias if set, otherwise original name)
 * @param pigeon - The pigeon object
 * @returns The display name to show
 */
export function getPigeonDisplayName(pigeon: { name: string; alias?: string | null }): string {
  return pigeon.alias || pigeon.name;
} 