import React, { useRef, useEffect } from 'react';
import type { PigeonRaceResult } from '../types/race';
import { getDistanceAtMinute } from '../utils/raceUtils';

interface WeatherZone {
  kmStart: number;
  kmEnd: number;
  type: string;
  emoji: string;
}

interface RaceCanvasProps {
  pigeons: PigeonRaceResult[];
  currentTime: number; // Minutes since race start
  userPigeonIds: string[];
  weatherZones: WeatherZone[];
}

/**
 * Canvas component for visualizing the pigeon race.
 * Renders only top 100 + user's pigeons for performance.
 * Supports smooth (interpolated) and stepwise (2-min update) modes.
 */
const RaceCanvas: React.FC<RaceCanvasProps> = ({
  pigeons,
  currentTime,
  userPigeonIds,
  weatherZones,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Only show top 100 + user's pigeons
  const visiblePigeons = React.useMemo(() => {
    const sorted = [...pigeons].sort(
      (a, b) => getDistanceAtMinute(currentTime, b) - getDistanceAtMinute(currentTime, a)
    );
    const top100 = sorted.slice(0, 100);
    const userPigeons = pigeons.filter((p) => userPigeonIds.includes(p.pigeonId));
    // Avoid duplicates
    const all = [...top100, ...userPigeons.filter(p => !top100.some(tp => tp.pigeonId === p.pigeonId))];
    return all;
  }, [pigeons, currentTime, userPigeonIds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw weather zones
    weatherZones.forEach((zone) => {
      const xStart = (zone.kmStart / 1000) * canvas.width;
      const xEnd = (zone.kmEnd / 1000) * canvas.width;
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#888';
      ctx.fillRect(xStart, 0, xEnd - xStart, canvas.height);
      ctx.globalAlpha = 1;
      ctx.font = '24px sans-serif';
      ctx.fillText(zone.emoji, (xStart + xEnd) / 2, 30);
      ctx.restore();
    });
    // Draw pigeons
    visiblePigeons.forEach((pigeon, i) => {
      const distance = getDistanceAtMinute(currentTime, pigeon);
      // Map distance to x (assuming race is 1000km for scaling; adjust as needed)
      const x = (distance / 1000) * canvas.width;
      const y = 60 + (i % 20) * 10; // Stack visually
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, userPigeonIds.includes(pigeon.pigeonId) ? 6 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = userPigeonIds.includes(pigeon.pigeonId) ? '#0074D9' : '#888';
      ctx.fill();
      ctx.strokeStyle = '#222';
      ctx.stroke();
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#222';
      ctx.fillText(pigeon.stats.name, x + 8, y + 3);
      ctx.restore();
    });
  }, [visiblePigeons, currentTime, weatherZones, userPigeonIds]);

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={300}
      aria-label="Pigeon Race Map"
      tabIndex={0}
      style={{ border: '1px solid #ccc', width: '100%', maxWidth: 1200 }}
    />
  );
};

export default RaceCanvas; 