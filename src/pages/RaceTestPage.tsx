import React, { useState, useMemo, useEffect } from 'react';
import LeafletRaceMap from '../components/LeafletRaceMap';
import { RaceStandingsTable } from '../components/RaceStandingsTable';
import type { PigeonStanding, PigeonRaceScript, PigeonStats, RaceConfig } from '../types/flightSim';
import { calculatePigeonStandings, getPigeonFlightStateAtTime } from '../services/flightSimService';

// ---- Types ----
type LatLng = [number, number];

type WeatherZone = {
  type: 'storm' | 'wind';
  area: LatLng[];
  effect: {
    speedFactor?: number;
    strayChance?: number;
    severity?: number;
    direction?: number;
    strength?: number;
  };
};

// ---- Mock Data ----
const LIMOGES: LatLng = [45.8336, 1.2611];
const HOME_BASES: { name: string; coords: { lat: number; lng: number }; color: string; isUser?: boolean }[] = [
  { name: 'Mendonk', coords: { lat: 51.105, lng: 3.765 }, color: '#e63946', isUser: true },
  { name: 'Wachtebeke', coords: { lat: 51.150, lng: 3.850 }, color: '#457b9d' },
  { name: 'Sint-Kruis-Winkel', coords: { lat: 51.100, lng: 3.800 }, color: '#2a9d8f' },
];

// Generate 200 pigeon IDs for stress testing
const PIGEON_IDS = Array.from({ length: 200 }, (_, i) => `pigeon_${i + 1}`);

// Debug: Log the number of pigeons generated
console.log(`STRESS TEST: Generated ${PIGEON_IDS.length} pigeons for racing simulation`);

const HOME_BASE_COLORS = ['#e63946', '#457b9d', '#2a9d8f'];

// Mock race scripts for all 200 pigeons
const MOCK_RACE_SCRIPTS: (PigeonRaceScript & { markerColor?: string; homeBaseIndex?: number })[] = PIGEON_IDS.map((id, idx) => ({
  pigeonId: id,
  events: [],
  outcome: 'finished',
  markerColor: HOME_BASE_COLORS[idx % 3],
  homeBaseIndex: idx % 3,
  // Add significant position variation to make all pigeons visible
  initialPosition: {
    lat: 45.8336 + (idx % 20) * 0.01 + Math.sin(idx * 0.1) * 0.005, // Much larger variation
    lng: 1.2611 + (idx % 20) * 0.01 + Math.cos(idx * 0.1) * 0.005   // Much larger variation
  }
}));

// Generate random stats for each pigeon (1-100 range for most stats)
const generateRandomStats = (pigeonId: number): PigeonStats => ({
  // Core Stats (1-100 range)
  speed: Math.floor(Math.random() * 30) + 15, // 15-44 m/s (54-158 km/h) for realistic racing
  focus: Math.floor(Math.random() * 100) + 1,
  aggression: Math.floor(Math.random() * 100) + 1,
  navigation: Math.floor(Math.random() * 100) + 1,
  skyIQ: Math.floor(Math.random() * 100) + 1,
  experience: Math.floor(Math.random() * 100) + 1,
  windResistance: Math.floor(Math.random() * 100) + 1,
  endurance: Math.floor(Math.random() * 100) + 1,
  leadership: Math.floor(Math.random() * 100) + 1,
  raceStart: Math.floor(Math.random() * 100) + 1,
});

const MOCK_STATS: Record<string, PigeonStats> = {};
PIGEON_IDS.forEach((id) => {
  MOCK_STATS[id] = generateRandomStats(parseInt(id));
});

console.log(`STRESS TEST: Generated ${PIGEON_IDS.length} pigeons with random core stats (1-100 range) for racing simulation`);

// Log sample stats for verification
const samplePigeonId = PIGEON_IDS[0];
const sampleStats = MOCK_STATS[samplePigeonId];
console.log(`Sample pigeon ${samplePigeonId} stats:`, {
  speed: `${sampleStats.speed} m/s`,
  focus: sampleStats.focus,
  aggression: sampleStats.aggression,
  navigation: sampleStats.navigation,
  skyIQ: sampleStats.skyIQ,
  experience: sampleStats.experience,
  windResistance: sampleStats.windResistance,
  endurance: sampleStats.endurance,
  leadership: sampleStats.leadership,
  raceStart: sampleStats.raceStart,
});

const MOCK_RACE_CONFIG: RaceConfig = {
  start: { lat: 45.8336, lng: 1.2611 },
  homeBases: [
    { lat: 51.105, lng: 3.765 }, // Mendonk
    { lat: 51.150, lng: 3.850 }, // Wachtebeke
    { lat: 51.100, lng: 3.800 }, // Sint-Kruis-Winkel
  ],
  totalDistance: 100000, // meters
  weatherZone: { type: 'wind', severity: 0.5, area: [{ lat: 48.0, lng: 5.0 }] },
};

/**
 * Mock mapping of pigeonId to real pigeon name and owner name.
 * TODO: Replace with real data from the game.
 */
const PIGEON_META: Record<string, { name: string; owner: string }> = Object.fromEntries(
  PIGEON_IDS.map((id, idx) => [
    id,
    {
      name: `Pigeon ${idx + 1}`,
      owner: `Owner ${Math.floor(idx / 10) + 1}` // 10 pigeons per owner
    }
  ])
);

// Create irregular foggy zone shape (more realistic than ellipse)
const foggyZonePoints = [
  { lat: 46.5, lng: 1.8 },
  { lat: 46.6, lng: 1.9 },
  { lat: 46.7, lng: 2.0 },
  { lat: 46.8, lng: 2.1 },
  { lat: 46.9, lng: 2.2 },
  { lat: 47.0, lng: 2.3 },
  { lat: 47.1, lng: 2.4 },
  { lat: 47.2, lng: 2.5 },
  { lat: 47.1, lng: 2.6 },
  { lat: 47.0, lng: 2.7 },
  { lat: 46.9, lng: 2.8 },
  { lat: 46.8, lng: 2.9 },
  { lat: 46.7, lng: 3.0 },
  { lat: 46.6, lng: 2.9 },
  { lat: 46.5, lng: 2.8 },
  { lat: 46.4, lng: 2.7 },
  { lat: 46.3, lng: 2.6 },
  { lat: 46.2, lng: 2.5 },
  { lat: 46.1, lng: 2.4 },
  { lat: 46.0, lng: 2.3 },
  { lat: 45.9, lng: 2.2 },
  { lat: 45.8, lng: 2.1 },
  { lat: 45.7, lng: 2.0 },
  { lat: 45.8, lng: 1.9 },
  { lat: 45.9, lng: 1.8 },
  { lat: 46.0, lng: 1.7 },
  { lat: 46.1, lng: 1.8 },
  { lat: 46.2, lng: 1.9 },
  { lat: 46.3, lng: 2.0 },
  { lat: 46.4, lng: 2.1 },
  { lat: 46.5, lng: 1.8 }, // Close the shape
];

const MOCK_WEATHER_ZONES: { type: string; severity: number; area: { lat: number; lng: number }[] }[] = [
  {
    type: 'foggy',
    severity: 0.60, // Changed from 0.23 to 0.60 for testing
    area: foggyZonePoints,
  },
  {
    type: 'stormy',
    severity: 0.80, // Added stormy zone for testing
    area: [
      // Irregular storm shape - more realistic than rectangle
      { lat: 46.8, lng: 1.0 }, // Le Blanc area
      { lat: 46.9, lng: 1.2 },
      { lat: 47.0, lng: 1.5 },
      { lat: 47.1, lng: 1.8 },
      { lat: 47.0, lng: 2.1 },
      { lat: 46.9, lng: 2.3 },
      { lat: 46.8, lng: 2.5 }, // Saint-Amand-Montrond area
      { lat: 46.7, lng: 2.4 },
      { lat: 46.6, lng: 2.2 },
      { lat: 46.5, lng: 2.0 },
      { lat: 46.4, lng: 1.8 },
      { lat: 46.3, lng: 1.6 },
      { lat: 46.2, lng: 1.4 },
      { lat: 46.1, lng: 1.2 },
      { lat: 46.0, lng: 1.0 },
      { lat: 46.1, lng: 0.8 },
      { lat: 46.2, lng: 0.9 },
      { lat: 46.3, lng: 1.1 },
      { lat: 46.4, lng: 1.3 },
      { lat: 46.5, lng: 1.5 },
      { lat: 46.6, lng: 1.7 },
      { lat: 46.7, lng: 1.9 },
      { lat: 46.8, lng: 1.0 }, // Close the shape
    ],
  },
];

const BASE_PIGEON_SPEED = 35; // meters/sec, realistic racing pigeon speed (100-160 km/h)

// ---- Page Component ----
const RaceTestPage: React.FC = () => {
  const [raceStartTime, setRaceStartTime] = useState<number | null>(null);
  const [view, setView] = useState<'race' | 'standings'>('race');
  const [demoSpeedFactor, setDemoSpeedFactor] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [raceDurationMs, setRaceDurationMs] = useState(30000); // Initial value

  // Dynamically calculate race duration based on max distance and speed factor
  useEffect(() => {
    const maxDistance = Math.max(
      ...MOCK_RACE_CONFIG.homeBases.map(home =>
        haversineDistance(MOCK_RACE_CONFIG.start, home)
      )
    );
    // Use realistic speed for duration calculation, but apply demoSpeedFactor for visualization
    const duration = (maxDistance / (BASE_PIGEON_SPEED * demoSpeedFactor)) * 1000;
    setRaceDurationMs(Math.ceil(duration));
  }, [demoSpeedFactor]);

  const handleStartRace = () => {
    setRaceStartTime(Date.now());
  };

  const handlePauseContinue = () => {
    setIsPaused(!isPaused);
  };

  /**
   * Compute live standings using the simulation service and merge in real pigeon names/owners.
   * TODO: Replace mocks with real raceScripts, stats, and raceConfig.
   */
  const liveStandings: PigeonStanding[] = useMemo(() => {
    if (!raceStartTime) return [];
    const t = Date.now() - raceStartTime;
    const rawStandings = calculatePigeonStandings(MOCK_RACE_SCRIPTS, MOCK_STATS, t, MOCK_RACE_CONFIG);
    return rawStandings.map(s => ({
      ...s,
      pigeonName: PIGEON_META[s.pigeonId]?.name ?? s.pigeonId,
      ownerName: PIGEON_META[s.pigeonId]?.owner ?? s.pigeonId,
    }));
  }, [raceStartTime]);

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-2">Pigeon Racing Test Page</h1>
      <p className="mb-2">Test the racing simulation with weather effects. Drag, zoom, and start the race!</p>
      <div className="mb-4 space-y-4">
          <div className="flex gap-4 items-center">
            <button
              onClick={handleStartRace}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Start Race
            </button>
            <button
              onClick={handlePauseContinue}
              className={`px-4 py-2 rounded ${
                isPaused 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              {isPaused ? 'Continue' : 'Pause'}
            </button>
          </div>
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 w-40"
          onClick={() => setView(view === 'race' ? 'standings' : 'race')}
        >
          {view === 'race' ? 'Show Standings' : 'Show Race'}
        </button>
      </div>
      {/* Speed slider for demo */}
      <div className="mb-4">
        <label htmlFor="speed-slider" className="block text-sm font-medium text-gray-700 mb-1">
          Demo Speed Factor: {demoSpeedFactor}x
        </label>
        <input
          id="speed-slider"
          type="range"
          min={1}
          max={1000}
          step={1}
          value={demoSpeedFactor}
          onChange={e => setDemoSpeedFactor(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="mb-2">
        <span className="font-semibold">Legend:</span>
        <ul className="ml-4">
          {HOME_BASES.map((base) => (
            <li key={base.name} style={{ color: base.color, fontWeight: base.isUser ? 'bold' : undefined }}>
              &#9679; {base.name} ({base.isUser ? 'Your Home Base' : 'Player'}) — ~67 pigeons
            </li>
          ))}
          <li style={{ color: '#FFD700', fontWeight: 'bold' }}>&#9679; Highlighted: Your Home Base</li>
          <li style={{ color: 'blue' }}>&#9632; Storm Zone</li>
          <li style={{ color: 'cyan' }}>&#9632; Wind Zone</li>
        </ul>
      </div>
      <div style={{ height: 700 }}>
        {view === 'race' ? (
          <LeafletRaceMap
            raceScripts={MOCK_RACE_SCRIPTS}
            stats={MOCK_STATS}
            weatherZones={MOCK_WEATHER_ZONES}
            raceConfig={MOCK_RACE_CONFIG}
            raceStartTime={raceStartTime || 0}
            demoSpeedFactor={demoSpeedFactor}
            isPaused={isPaused}
            durationMs={raceDurationMs}
            homeBases={HOME_BASES}
            raceStart={MOCK_RACE_CONFIG.start}
            getPigeonFlightStateAtTime={getPigeonFlightStateAtTime}
          />
        ) : (
          <RaceStandingsTable standings={liveStandings} />
        )}
      </div>
    </div>
  );
};

export default RaceTestPage;

function haversineDistance(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const aVal = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
} 