// Utility for pigeon image handling
import type { Pigeon } from '../types/pigeon';

/**
 * Returns the correct pigeon image path based on age and picture_number.
 * If under 3 months, returns the baby image.
 * Otherwise, returns the numbered image (1-100).
 * Males use images 1-50, females use images 51-100.
 */
export function getPigeonPicture(pigeon: Pigeon): string {
  if (pigeon.age_months < 3 && pigeon.age_years === 0) {
    return '/assets/pigeons/baby.png';
  }
  // Use the picture_number field from the pigeon
  return `/assets/pigeons/${pigeon.picture_number}.png`;
} 