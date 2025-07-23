import React, { useState, useRef, useEffect } from 'react';
import type { PigeonRaceResult } from '../types/race';
import RaceCanvas from './RaceCanvas';
import RaceLeaderboard from './RaceLeaderboard';

interface WeatherZone {
  kmStart: number;
  kmEnd: number;
  type: string;
  emoji: string;
}

interface RaceReplayPageProps {
  pigeons: PigeonRaceResult[];
  userPigeonIds: string[];
  weatherZones: WeatherZone[];
  raceDuration: number; // in minutes
}

/**
 * Parent page for race replay, integrating canvas, leaderboard, and controls.
 */
const RaceReplayPage: React.FC<RaceReplayPageProps> = ({
  pigeons,
  userPigeonIds,
  weatherZones,
  raceDuration,
}) => {
  const [currentTime, setCurrentTime] = useState(0); // minutes
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'smooth' | 'stepwise'>('smooth');
  const [view, setView] = useState<'canvas' | 'leaderboard'>('canvas');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = mode === 'stepwise' ? prev + 2 : prev + 0.1;
          if (next >= raceDuration) {
            setIsPlaying(false);
            return raceDuration;
          }
          return next;
        });
      }, mode === 'stepwise' ? 500 : 16); // 2-min step every 0.5s, smooth ~60fps
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, mode, raceDuration]);

  // Scrub bar handler
  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
    setIsPlaying(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 8 }}>
        <button onClick={() => setView('canvas')} aria-pressed={view === 'canvas'}>Race View</button>
        <button onClick={() => setView('leaderboard')} aria-pressed={view === 'leaderboard'}>Leaderboard</button>
        <button onClick={() => setIsPlaying((p) => !p)} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <input
          type="range"
          min={0}
          max={raceDuration}
          step={mode === 'stepwise' ? 2 : 0.1}
          value={currentTime}
          onChange={handleScrub}
          aria-label="Scrub race time"
          style={{ flex: 1 }}
        />
        <span>{currentTime.toFixed(1)} min</span>
        <label style={{ marginLeft: 16 }}>
          <input
            type="checkbox"
            checked={mode === 'smooth'}
            onChange={() => setMode((m) => (m === 'smooth' ? 'stepwise' : 'smooth'))}
          />
          Smooth
        </label>
      </div>
      {view === 'canvas' ? (
        <RaceCanvas
          pigeons={pigeons}
          currentTime={currentTime}
          userPigeonIds={userPigeonIds}
          weatherZones={weatherZones}
        />
      ) : (
        <RaceLeaderboard
          pigeons={pigeons}
          currentTime={currentTime}
          userPigeonIds={userPigeonIds}
        />
      )}
    </div>
  );
};

export default RaceReplayPage; 