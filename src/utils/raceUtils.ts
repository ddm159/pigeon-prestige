import type { PigeonRaceResult } from '../types/race';

/**
 * Calculates the distance a pigeon has covered at minute t, given its race result and events.
 * @param t - Minutes since race start
 * @param pigeon - The PigeonRaceResult object
 * @returns Distance in km
 */
export function getDistanceAtMinute(
  t: number,
  pigeon: PigeonRaceResult
): number {
  if (pigeon.didNotFinish || pigeon.duration === null) return 0;
  let speed = pigeon.baseSpeed;
  for (const event of pigeon.events) {
    if (t >= event.t) {
      if (event.effect === 'boost' || event.effect === 'recovery') speed *= event.mod;
      if (event.effect === 'slowdown') speed *= event.mod;
      if (event.effect === 'lost') return 0;
    }
  }
  return Math.min((t / 60) * speed, pigeon.distanceKm);
} 