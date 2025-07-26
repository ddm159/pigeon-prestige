import type { PigeonRaceScript, PigeonStats, RaceConfig, PigeonFlightState, PigeonStanding, PigeonStatGain, LatLng } from '../types/flightSim';

/**
 * Calculates the flight state (position, group, state) of a pigeon at a given time.
 * Applies stat-driven path, group/solo logic, event effects, and weather effects.
 * 
 * Speed System:
 * - Base speeds are realistic (27.8-44.4 m/s = 100-160 km/h for racing pigeons)
 * - demoSpeedFactor is ONLY for testing/visualization (default: 1)
 * - In real races, demoSpeedFactor should always be 1
 * - For testing, demoSpeedFactor can be increased to see movement faster
 * 
 * @param pigeonScript - The event script and outcome for the pigeon
 * @param stats - The pigeon's stats (speed should be 27.8-44.4 m/s = 100-160 km/h)
 * @param t - Current race time (seconds since race start)
 * @param raceConfig - The race configuration (start, homeBases, weatherZone, etc.)
 * @param demoSpeedFactor - Speed multiplier for testing (use 1 for real races)
 * @returns The pigeon's current flight state for visualization
 */
// Haversine formula to calculate distance in meters between two lat/lng points
function haversineDistance(a: LatLng, b: LatLng): number {
  // Validate input coordinates
  if (!a || !b || isNaN(a.lat) || isNaN(a.lng) || isNaN(b.lat) || isNaN(b.lng)) {
    console.error('Invalid coordinates in haversineDistance:', { a, b });
    return 0;
  }
  
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const aVal = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  const result = R * c;
  
  // Validate result
  if (isNaN(result)) {
    console.error('NaN result in haversineDistance:', { a, b, result });
    return 0;
  }
  
  return result;
}

export function getPigeonFlightStateAtTime(
  pigeonScript: PigeonRaceScript & { homeBaseIndex?: number },
  stats: PigeonStats,
  t: number,
  raceConfig: RaceConfig,
  demoSpeedFactor: number = 1
): PigeonFlightState {
  const start: LatLng = raceConfig.start;
  const homeBaseIdx = pigeonScript.homeBaseIndex ?? 0;
  const home: LatLng = raceConfig.homeBases[homeBaseIdx] || raceConfig.homeBases[0];

  // Debug: Log input values
  if (typeof window !== 'undefined' && window.console && t % 30 < 1) {
    console.log(`Debug - Pigeon ${pigeonScript.pigeonId}:`, {
      t,
      start,
      home,
      homeBaseIdx,
      stats: { raceStart: stats.raceStart, leadership: stats.leadership, speed: stats.speed }
    });
  }

  // Loitering phase: pigeons fly in circles around start for 30 seconds
  const loiterDuration = 30; // 30 seconds of loitering
  if (t < loiterDuration) {
    // Calculate circular motion around start point - make it more visible
    const circleRadius = 0.01; // Larger radius for visible circular motion
    const circleSpeed = 0.5; // Faster circular motion
    const angle = t * circleSpeed;
    const wobble = Math.sin(t * 0.8) * 0.002; // More visible wobble
    
    const position = {
      lat: start.lat + circleRadius * Math.cos(angle) + wobble,
      lng: start.lng + circleRadius * Math.sin(angle) + wobble * 0.5
    };
    
    // Debug: Log loitering position
    if (typeof window !== 'undefined' && window.console && t % 5 < 1) {
      console.log(`Loitering - Pigeon ${pigeonScript.pigeonId} t=${t.toFixed(1)}s position=(${position.lat.toFixed(6)}, ${position.lng.toFixed(6)})`);
    }
    
    return {
      position,
      groupId: 'loitering',
      state: 'normal'
    };
  }

  // After loitering, pigeons start racing to their home bases
  const flightTime = t - loiterDuration;
  
  // Simplified race start logic - all pigeons start racing after loitering
  // Leadership affects group formation, not start time
  const leadership = stats.leadership ?? 50;
  
  // All pigeons start racing immediately after loitering
  const actualFlightTime = flightTime; // No additional delay
  
  // Calculate distance and progress
  const totalDistance = haversineDistance(start, home);
  const baseSpeed = (stats.speed || 35) * demoSpeedFactor; // Default to 35 m/s if no speed
  const distanceTravelled = baseSpeed * actualFlightTime;
  const progress = Math.min(1, distanceTravelled / totalDistance);
  
  // Debug: Check for NaN in distance calculation
  if (isNaN(totalDistance)) {
    console.error(`NaN in totalDistance for pigeon ${pigeonScript.pigeonId}:`, { start, home, totalDistance });
    return { position: start, groupId: 'start', state: 'normal' };
  }

  // Debug: Log distance values to understand why progress is 0
  if (typeof window !== 'undefined' && window.console && t % 10 < 1) {
    console.log(`Racing - Pigeon ${pigeonScript.pigeonId} t=${t.toFixed(1)}s flightTime=${flightTime.toFixed(1)} actualFlightTime=${actualFlightTime.toFixed(1)} baseSpeed=${baseSpeed.toFixed(2)} distanceTravelled=${distanceTravelled.toFixed(2)} totalDistance=${totalDistance.toFixed(2)} progress=${progress.toFixed(3)}`);
  }

  // Group formation based on leadership and proximity
  const homeBaseGroup = `home${homeBaseIdx}`;
  let groupId: string;
  
  if (leadership > 70) {
    groupId = `${homeBaseGroup}_leaders`;
  } else if (leadership > 50) {
    groupId = `${homeBaseGroup}_main`;
  } else {
    groupId = `${homeBaseGroup}_followers`;
  }

  // Calculate position with group effects
  const baseLat = start.lat + (home.lat - start.lat) * progress;
  const baseLng = start.lng + (home.lng - start.lng) * progress;
  
  // Add group and individual wobbles for realistic flight
  const groupSeed = groupId.length;
  const groupOffset = (groupSeed % 3) * 0.001; // Smaller offset
  const groupWobble = Math.sin(actualFlightTime * 0.2) * 0.002; // Slower wobble
  const individualSeed = parseInt(pigeonScript.pigeonId) % 100;
  const individualWobble = Math.sin(actualFlightTime * 0.3 + individualSeed) * 0.001;
  const individualOffset = (individualSeed - 50) * 0.00005; // Smaller offset
  
  let lat = baseLat + groupOffset + groupWobble + individualWobble + individualOffset;
  let lng = baseLng + groupOffset * 0.5 + groupWobble * 0.3 + individualWobble * 0.5 + individualOffset * 0.3;
  
  // Check for NaN in final position
  if (isNaN(lat) || isNaN(lng)) {
    console.error(`NaN in final position for pigeon ${pigeonScript.pigeonId}:`, { baseLat, baseLng, lat, lng });
    lat = baseLat;
    lng = baseLng;
  }

  // Determine state based on progress
  let state: PigeonFlightState['state'] = 'normal';
  if (progress >= 1) {
    state = 'finished';
  }

  // Debug output
  if (typeof window !== 'undefined' && window.console && t % 20 < 1) {
    console.log(`Final - Pigeon ${pigeonScript.pigeonId} t=${t.toFixed(1)}s groupId=${groupId} progress=${progress.toFixed(3)} position=(${lat.toFixed(6)}, ${lng.toFixed(6)}) baseSpeed=${baseSpeed.toFixed(2)} actualFlightTime=${actualFlightTime.toFixed(2)} distanceTravelled=${distanceTravelled.toFixed(2)} totalDistance=${totalDistance.toFixed(2)}`);
  }

  return {
    position: { lat, lng },
    groupId,
    state
  };
}

/**
 * Calculates live standings for all pigeons in a race.
 * Uses event-driven simulation to compute velocity, distance left, speed, and state for each pigeon.
 * @param raceScripts - All pigeon race scripts
 * @param stats - All pigeon stats (by pigeonId)
 * @param t - Current race time (seconds since race start)
 * @param raceConfig - Race configuration (start, home, distance, weather)
 * @returns Array of PigeonStanding sorted by velocity
 */
export function calculatePigeonStandings(
  raceScripts: PigeonRaceScript[],
  stats: Record<string, PigeonStats>,
  t: number,
  raceConfig: RaceConfig
): PigeonStanding[] {
  const { totalDistance } = raceConfig;
  return raceScripts.map((script) => {
    const pigeonStats = stats[script.pigeonId];
    // 1. If finished, use finishTime for velocity, 0 distance left
    if (script.outcome === 'finished' && script.finishTime !== undefined) {
      const velocity = totalDistance / script.finishTime;
      return {
        pigeonId: script.pigeonId,
        pigeonName: script.pigeonId, // Replace with real name if available
        ownerName: script.pigeonId, // Replace with real owner if available
        velocity,
        distanceLeft: 0,
        speed: velocity,
        state: script.outcome,
      };
    }
    // 2. If dead/lost, calculate distance up to event
    // 3. Otherwise, simulate progress up to t
    // Use similar interval-building logic as in getPigeonFlightStateAtTime
    const baseSpeed = pigeonStats ? pigeonStats.speed : 1;
    let distanceTravelled = 0;
    let pauseCount = 0;
    let isLost = false;
    let isDead = false;
    let nextPauseCount = 0;
    let nextIsLost = false;
    let nextIsDead = false;
    const events = (script.events || []).slice().sort((a, b) => a.t - b.t);
    type StrayedEndEvent = { type: 'strayed_end'; t: number };
    const syntheticEvents: StrayedEndEvent[] = [];
    for (const e of events) {
      if (e.type === 'strayed') {
        syntheticEvents.push({ type: 'strayed_end', t: e.t + (e as { duration: number }).duration });
      }
    }
    const allEvents = [...events, ...syntheticEvents].sort((a, b) => a.t - b.t);
    const allTimesArr: number[] = [0, t];
    for (const e of events) allTimesArr.push(e.t);
    for (const e of syntheticEvents) allTimesArr.push(e.t);
    const allTimes = Array.from(new Set(allTimesArr)).sort((a, b) => a - b);
    const eventsByTime: Record<number, (typeof events[number] | StrayedEndEvent)[]> = {};
    for (const e of allEvents) {
      if (!eventsByTime[e.t]) eventsByTime[e.t] = [];
      eventsByTime[e.t].push(e);
    }
    const eventPriority = {
      'strayed_end': 1,
      'returned': 2,
      'lost': 3,
      'accident': 3,
      'death': 3,
      'strayed': 4,
      'overshot': 5,
    } as const;
    let currentTotalDistance = totalDistance;
    for (let i = 0; i < allTimes.length - 1; i++) {
      const intervalStart = allTimes[i];
      const intervalEnd = allTimes[i + 1];
      const isActive = pauseCount === 0 && !isLost && !isDead;
      if (isActive && intervalEnd > intervalStart) {
        distanceTravelled += baseSpeed * (intervalEnd - intervalStart);
      }
      nextPauseCount = pauseCount;
      nextIsLost = isLost;
      nextIsDead = isDead;
      const eventsAtEnd = (eventsByTime[intervalEnd] || []).slice();
      eventsAtEnd.sort((a, b) => (eventPriority[a.type as keyof typeof eventPriority] ?? 99) - (eventPriority[b.type as keyof typeof eventPriority] ?? 99));
      for (const event of eventsAtEnd) {
        if (event.type === 'strayed_end') {
          nextPauseCount = Math.max(0, nextPauseCount - 1);
        } else if (event.type === 'returned') {
          nextIsLost = false;
        } else if (event.type === 'lost' || event.type === 'accident' || event.type === 'death') {
          if (event.type === 'lost') nextIsLost = true;
          if (event.type === 'accident' || event.type === 'death') nextIsDead = true;
        } else if (event.type === 'strayed') {
          nextPauseCount++;
        } else if (event.type === 'overshot') {
          if ('distance' in event && typeof event.distance === 'number') {
            currentTotalDistance += event.distance;
          }
        }
      }
      pauseCount = nextPauseCount;
      isLost = nextIsLost;
      isDead = nextIsDead;
    }
    distanceTravelled = Math.min(distanceTravelled, currentTotalDistance); // Cap distance
    const distanceLeft = Math.max(currentTotalDistance - distanceTravelled, 0);
    const velocity = t > 0 ? distanceTravelled / t : 0;
    const speed = baseSpeed;
    return {
      pigeonId: script.pigeonId,
      pigeonName: script.pigeonId, // Replace with real name if available
      ownerName: script.pigeonId, // Replace with real owner if available
      velocity,
      distanceLeft,
      speed,
      state: script.outcome,
    };
  }).sort((a, b) => b.velocity - a.velocity);
}

/**
 * Calculates stat gains for pigeons after a race.
 * Awards experience and racing stat for finished pigeons, reduced gain for dnf/lost/returned, and no gain for dead/injured.
 * @param raceScripts - All pigeon race scripts
 * @returns Array of stat gains for each eligible pigeon
 */
export function calculatePigeonStatGains(
  raceScripts: PigeonRaceScript[]
): PigeonStatGain[] {
  // Stat gain values (could be parameterized by race type in future)
  const FINISH_GAIN = 0.12; // e.g., regional
  const PARTICIPATION_GAIN = 0.04; // for dnf/lost/returned

  return raceScripts
    .filter((script) => script.outcome !== 'dead' && script.outcome !== 'injured')
    .map((script) => {
      let experience = 0;
      let racing = 0;
      if (script.outcome === 'finished') {
        experience = FINISH_GAIN;
        racing = FINISH_GAIN;
      } else if (script.outcome === 'dnf' || script.outcome === 'lost' || script.outcome === 'returned') {
        experience = PARTICIPATION_GAIN;
        racing = PARTICIPATION_GAIN;
      }
      return {
        pigeonId: script.pigeonId,
        experience,
        racing,
      };
    })
    .filter((gain) => gain.experience > 0 || gain.racing > 0);
} 