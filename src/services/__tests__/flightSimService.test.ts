import { calculatePigeonStandings, getPigeonFlightStateAtTime, calculatePigeonStatGains } from '../flightSimService';
import type { PigeonRaceScript, PigeonStats, RaceConfig } from '../../types/flightSim';

/**
 * Unit tests for event-driven standings calculation in calculatePigeonStandings.
 */
describe('calculatePigeonStandings (event-driven)', () => {
  const baseStats: Record<string, PigeonStats> = {
    '1': { speed: 1, focus: 1, aggression: 1, navigation: 1, skyIQ: 1, experience: 1, windResistance: 1, endurance: 1 },
  };
  const raceConfig: RaceConfig = {
    start: { lat: 0, lng: 0 },
    homeBases: [{ lat: 1, lng: 1 }],
    totalDistance: 1000,
    weatherZone: { type: 'wind', severity: 0.5, area: [{ lat: 0.5, lng: 0.5 }] },
  };

  it('pauses progress for strayed event', () => {
    const script: PigeonRaceScript = {
      pigeonId: '1',
      events: [{ type: 'strayed', t: 100, duration: 50 }],
      outcome: 'dnf',
    };
    // At t=200, should have paused for 50 units after t=100
    const standings = calculatePigeonStandings([script], baseStats, 200, raceConfig);
    // Should have only progressed for 150 units (100 before strayed, 50 after pause)
    expect(standings[0].distanceLeft).toBeCloseTo(1000 - 1 * 100 - 1 * 50);
  });

  it('adds extra distance for overshot event', () => {
    const script: PigeonRaceScript = {
      pigeonId: '1',
      events: [{ type: 'overshot', t: 100, distance: 200 }],
      outcome: 'dnf',
    };
    const standings = calculatePigeonStandings([script], baseStats, 200, raceConfig);
    // Should have travelled 200 units, but distance left is 1000 + 200 - 200
    expect(standings[0].distanceLeft).toBeCloseTo(1000);
  });

  it('stops progress at lost event', () => {
    const script: PigeonRaceScript = {
      pigeonId: '1',
      events: [{ type: 'lost', t: 100 }],
      outcome: 'lost',
    };
    const standings = calculatePigeonStandings([script], baseStats, 200, raceConfig);
    expect(standings[0].distanceLeft).toBeCloseTo(1000 - 1 * 100);
  });

  it('resumes progress after returned event', () => {
    const script: PigeonRaceScript = {
      pigeonId: '1',
      events: [
        { type: 'lost', t: 50 },
        { type: 'returned', t: 100 },
      ],
      outcome: 'dnf',
    };
    const standings = calculatePigeonStandings([script], baseStats, 200, raceConfig);
    // Should have progressed for 50 before lost, then 100 after returned
    expect(standings[0].distanceLeft).toBeCloseTo(1000 - 1 * 50 - 1 * 100);
  });

  it('stops progress at accident or death', () => {
    const script: PigeonRaceScript = {
      pigeonId: '1',
      events: [{ type: 'accident', t: 80 }],
      outcome: 'dead',
    };
    const standings = calculatePigeonStandings([script], baseStats, 200, raceConfig);
    expect(standings[0].distanceLeft).toBeCloseTo(1000 - 1 * 80);
    const script2: PigeonRaceScript = {
      pigeonId: '1',
      events: [{ type: 'death', t: 60 }],
      outcome: 'dead',
    };
    const standings2 = calculatePigeonStandings([script2], baseStats, 200, raceConfig);
    expect(standings2[0].distanceLeft).toBeCloseTo(1000 - 1 * 60);
  });

  it('handles multiple and overlapping events', () => {
    const script: PigeonRaceScript = {
      pigeonId: '1',
      events: [
        { type: 'strayed', t: 50, duration: 30 },
        { type: 'overshot', t: 100, distance: 100 },
        { type: 'lost', t: 120 },
      ],
      outcome: 'lost',
    };
    const standings = calculatePigeonStandings([script], baseStats, 200, raceConfig);
    // Progress: 50 before strayed, 30 after pause, 20 before lost = 100 units, plus overshot
    expect(standings[0].distanceLeft).toBeCloseTo(1010);
  });

  it('handles miracle finish event', () => {
    const script: PigeonRaceScript = {
      pigeonId: '1',
      events: [
        { type: 'miracle_finish', t: 900 },
      ],
      outcome: 'finished',
      finishTime: 950,
    };
    const baseStats: Record<string, PigeonStats> = {
      '1': { speed: 1, focus: 1, aggression: 1, navigation: 1, skyIQ: 1, experience: 1, windResistance: 1, endurance: 1 },
    };
    const raceConfig: RaceConfig = {
      start: { lat: 0, lng: 0 },
      homeBases: [{ lat: 1, lng: 1 }],
      totalDistance: 1000,
      weatherZone: { type: 'wind', severity: 0.5, area: [{ lat: 0.5, lng: 0.5 }] },
    };
    const standings = calculatePigeonStandings([script], baseStats, 950, raceConfig);
    expect(standings[0].state).toBe('finished');
    expect(standings[0].velocity).toBeCloseTo(1000 / 950);
  });

  it('handles overlapping strayed and overshot events', () => {
    const script: PigeonRaceScript = {
      pigeonId: '1',
      events: [
        { type: 'strayed', t: 100, duration: 100 },
        { type: 'overshot', t: 150, distance: 200 },
      ],
      outcome: 'dnf',
    };
    const baseStats: Record<string, PigeonStats> = {
      '1': { speed: 1, focus: 1, aggression: 1, navigation: 1, skyIQ: 1, experience: 1, windResistance: 1, endurance: 1 },
    };
    const raceConfig: RaceConfig = {
      start: { lat: 0, lng: 0 },
      homeBases: [{ lat: 1, lng: 1 }],
      totalDistance: 1000,
      weatherZone: { type: 'wind', severity: 0.5, area: [{ lat: 0.5, lng: 0.5 }] },
    };
    const standings = calculatePigeonStandings([script], baseStats, 300, raceConfig);
    // Should pause for 100 units after t=100, overshot at t=150
    expect(standings[0].distanceLeft).toBeGreaterThan(0);
    expect(standings[0].distanceLeft).toBeGreaterThan(1000 - 200);
  });
});

describe('getPigeonFlightStateAtTime', () => {
  const baseStats: PigeonStats = {
    speed: 1,
    focus: 1,
    aggression: 1,
    navigation: 1,
    skyIQ: 1,
    experience: 1,
    windResistance: 1,
    endurance: 1,
  };
  const defaultRaceConfig = { start: { lat: 0, lng: 0 }, homeBases: [{ lat: 1, lng: 1 }], totalDistance: 1000, weatherZone: { type: 'wind', severity: 0.5, area: [{ lat: 0.5, lng: 0.5 }] } };
  it('returns normal state for pigeon with no events', () => {
    const script: PigeonRaceScript = { pigeonId: '1', events: [], outcome: 'finished', finishTime: 1000 };
    const state = getPigeonFlightStateAtTime(script, baseStats, 100, defaultRaceConfig);
    expect(state.state).toBe('normal');
  });
  it('returns strayed state during strayed event', () => {
    const script: PigeonRaceScript = {
      pigeonId: '1',
      events: [{ type: 'strayed', t: 50, duration: 100 }],
      outcome: 'dnf',
    };
    const state = getPigeonFlightStateAtTime(script, baseStats, 60, defaultRaceConfig);
    expect(state.state).toBe('strayed');
  });
  it('returns lost state after lost event', () => {
    const script: PigeonRaceScript = {
      pigeonId: '1',
      events: [{ type: 'lost', t: 30 }],
      outcome: 'lost',
    };
    const state = getPigeonFlightStateAtTime(script, baseStats, 100, defaultRaceConfig);
    expect(state.state).toBe('lost');
    expect(state.position.lat).toBeNaN();
  });
  it('returns dead state after death event', () => {
    const script: PigeonRaceScript = {
      pigeonId: '1',
      events: [{ type: 'death', t: 20 }],
      outcome: 'dead',
    };
    const state = getPigeonFlightStateAtTime(script, baseStats, 100, defaultRaceConfig);
    expect(state.state).toBe('dead');
    expect(state.position.lat).toBeNaN();
  });
  it('returns overshot state after overshot event', () => {
    const script: PigeonRaceScript = {
      pigeonId: '1',
      events: [{ type: 'overshot', t: 40, distance: 100 }],
      outcome: 'dnf',
    };
    const state = getPigeonFlightStateAtTime(script, baseStats, 100, defaultRaceConfig);
    expect(state.state).toBe('overshot');
  });
  it('returns different positions for different home bases', () => {
    const script: PigeonRaceScript = {
      pigeonId: '1',
      events: [],
      outcome: 'dnf',
    };
    const raceConfig1 = { start: { lat: 0, lng: 0 }, homeBases: [{ lat: 10, lng: 10 }], totalDistance: 1000, weatherZone: { type: 'wind', severity: 0.5, area: [{ lat: 0.5, lng: 0.5 }] } };
    const raceConfig2 = { start: { lat: 0, lng: 0 }, homeBases: [{ lat: 20, lng: 20 }], totalDistance: 1000, weatherZone: { type: 'wind', severity: 0.5, area: [{ lat: 0.5, lng: 0.5 }] } };
    const state1 = getPigeonFlightStateAtTime(script, baseStats, 500, raceConfig1);
    const state2 = getPigeonFlightStateAtTime(script, baseStats, 500, raceConfig2);
    expect(state1.position.lat).not.toBeCloseTo(state2.position.lat);
    expect(state1.position.lng).not.toBeCloseTo(state2.position.lng);
  });
});

describe('getPigeonFlightStateAtTime (edge cases)', () => {
  const baseStats: PigeonStats = {
    speed: 1,
    focus: 0.5,
    aggression: 0.5,
    navigation: 0.5,
    skyIQ: 0.5,
    experience: 0.5,
    windResistance: 0.5,
    endurance: 0.5,
  };
  const defaultRaceConfig = { start: { lat: 0, lng: 0 }, homeBases: [{ lat: 1, lng: 1 }], totalDistance: 1000, weatherZone: { type: 'wind', severity: 0.5, area: [{ lat: 0.5, lng: 0.5 }] } };

  it('handles group join and leave events', () => {
    const script: PigeonRaceScript = {
      pigeonId: '1',
      events: [
        { type: 'joined_group', t: 100, groupId: 'g1' },
        { type: 'left_group', t: 200 },
      ],
      outcome: 'dnf',
    };
    const stateAt150 = getPigeonFlightStateAtTime(script, baseStats, 150, defaultRaceConfig);
    expect(stateAt150.groupId).toBe('g1');
    const stateAt250 = getPigeonFlightStateAtTime(script, baseStats, 250, defaultRaceConfig);
    expect(stateAt250.groupId).toBeUndefined();
  });

  it('applies stat-driven wobble to position', () => {
    const script: PigeonRaceScript = {
      pigeonId: '1',
      events: [],
      outcome: 'dnf',
    };
    const stateLowStats = getPigeonFlightStateAtTime(script, { ...baseStats, focus: 0.1, navigation: 0.1, skyIQ: 0.1 }, 500, defaultRaceConfig);
    const stateHighStats = getPigeonFlightStateAtTime(script, { ...baseStats, focus: 1, navigation: 1, skyIQ: 1 }, 500, defaultRaceConfig);
    // Should be different due to wobble
    expect(stateLowStats.position.lat).not.toBeCloseTo(stateHighStats.position.lat);
    expect(stateLowStats.position.lng).not.toBeCloseTo(stateHighStats.position.lng);
  });

  it('handles weather effect stub (no crash)', () => {
    const script: PigeonRaceScript = {
      pigeonId: '1',
      events: [],
      outcome: 'dnf',
    };
    // Should not throw even if weatherZone is present
    expect(() => getPigeonFlightStateAtTime(script, baseStats, 500, defaultRaceConfig)).not.toThrow();
  });
});

describe('calculatePigeonStatGains', () => {
  it('gives stat gain for finished pigeons', () => {
    const scripts: PigeonRaceScript[] = [
      { pigeonId: '1', events: [], outcome: 'finished', finishTime: 1000 },
      { pigeonId: '2', events: [], outcome: 'finished', finishTime: 1200 },
    ];
    const gains = calculatePigeonStatGains(scripts);
    expect(gains).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ pigeonId: '1', experience: expect.any(Number), racing: expect.any(Number) }),
        expect.objectContaining({ pigeonId: '2', experience: expect.any(Number), racing: expect.any(Number) }),
      ])
    );
  });

  it('gives no stat gain for dead pigeons', () => {
    const scripts: PigeonRaceScript[] = [
      { pigeonId: '3', events: [], outcome: 'dead' },
    ];
    const gains = calculatePigeonStatGains(scripts);
    expect(gains.find(g => g.pigeonId === '3')).toBeUndefined();
  });

  it('gives reduced stat gain for DNF or lost pigeons', () => {
    const scripts: PigeonRaceScript[] = [
      { pigeonId: '4', events: [], outcome: 'dnf' },
      { pigeonId: '5', events: [], outcome: 'lost' },
    ];
    const gains = calculatePigeonStatGains(scripts);
    expect(gains.find(g => g.pigeonId === '4')).toBeDefined();
    expect(gains.find(g => g.pigeonId === '5')).toBeDefined();
  });
}); 