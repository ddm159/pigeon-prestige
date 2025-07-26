import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PigeonRaceScript, PigeonStats, RaceConfig, LatLng, WeatherZone } from '../types/flightSim';

/**
 * A pigeon with its home base, start position, stats, and optional path.
 */
export type Pigeon = {
  id: number;
  home: LatLng;
  start: LatLng;
  stats: {
    speed: number;
    focus: number;
    windResistance: number;
    instinct: number;
    experience: number;
    health: number;
  };
  seed: number;
  color: string;
  path?: LatLng[];
  playerIndex?: number; // for home base highlighting
};

/**
 * A home base with name, coordinates, color, and optional user flag.
 */
export type HomeBase = {
  name: string;
  coords: LatLng;
  color: string;
  isUser?: boolean;
};

interface LeafletRaceMapProps {
  raceScripts: PigeonRaceScript[];
  stats: Record<string, PigeonStats>;
  raceConfig: RaceConfig;
  raceStartTime: number;
  durationMs: number;
  homeBases: HomeBase[];
  raceStart: LatLng;
  getPigeonFlightStateAtTime: (
    script: PigeonRaceScript,
    stats: PigeonStats,
    t: number,
    raceConfig: RaceConfig,
    demoSpeedFactor: number
  ) => { position: LatLng; state: string };
  weatherZones: WeatherZone[];
  demoSpeedFactor: number;
}

/**
 * LeafletRaceMap displays a racing simulation on a Leaflet map, animating pigeons and weather zones.
 * Now also shows home bases and the race start point.
 */
const LeafletRaceMap: React.FC<LeafletRaceMapProps> = ({
  raceScripts,
  stats,
  raceConfig,
  raceStartTime,
  durationMs,
  homeBases,
  raceStart,
  getPigeonFlightStateAtTime,
  weatherZones,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Record<string, L.CircleMarker>>({});

  useEffect(() => {
    const map = L.map(mapRef.current!).setView([48.5, 6.8], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Draw weather zones
    weatherZones.forEach((zone: WeatherZone) => {
      const polygon = L.polygon(zone.area, {
        color: zone.type === 'storm' ? 'blue' : 'cyan',
        opacity: 0.5,
        fillOpacity: 0.3
      });
      polygon.addTo(map);
    });

    // Draw home bases
    homeBases.forEach((base) => {
      const marker = L.circleMarker(base.coords, {
        radius: base.isUser ? 12 : 8,
        color: base.isUser ? '#FFD700' : base.color,
        fillColor: base.isUser ? '#FFD700' : base.color,
        fillOpacity: 0.9,
        weight: base.isUser ? 4 : 2,
        opacity: 1,
      }).addTo(map);
      marker.bindTooltip(base.name, { permanent: false, direction: 'top' });
    });

    // Draw race start point
    const startMarker = L.marker(raceStart, {
      icon: L.divIcon({
        className: '',
        html: '<div style="background:#222;color:#fff;padding:2px 6px;border-radius:6px;font-weight:bold;border:2px solid #fff;">START</div>',
        iconSize: [48, 24],
        iconAnchor: [24, 12],
      })
    }).addTo(map);
    startMarker.bindTooltip('Race Start (Limoges)', { permanent: false, direction: 'top' });
    // DEBUG: Add a fallback marker at the race start
    L.circleMarker(raceStart, { radius: 10, color: 'red', fillColor: 'red', fillOpacity: 0.5 }).addTo(map).bindTooltip('DEBUG: Start', { permanent: false, direction: 'bottom' });

    // Create markers for each pigeon
    raceScripts.forEach((script) => {
      const pigeonStats = stats[script.pigeonId];
      if (!pigeonStats) return;
      const extScript = script as typeof script & { markerColor?: string; homeBaseIndex?: number };
      const { position } = getPigeonFlightStateAtTime(
        extScript,
        pigeonStats,
        0,
        raceConfig,
        1 // demoSpeedFactor
      );
      const color = extScript.markerColor || '#333';
      const marker = L.circleMarker([position.lat, position.lng], {
        radius: 4,
        color,
        fillColor: color,
        fillOpacity: 1
      }).addTo(map);
      markerRefs.current[script.pigeonId] = marker;
    });

    let animationFrame: number;
    function animate() {
      const now = Date.now();
      const t = Math.max(0, Math.min(durationMs, now - raceStartTime)) / 1000; // seconds
      raceScripts.forEach((script) => {
        const pigeonStats = stats[script.pigeonId];
        if (!pigeonStats) return;
        const extScript = script as typeof script & { markerColor?: string; homeBaseIndex?: number };
        const { position, state } = getPigeonFlightStateAtTime(
          extScript,
          pigeonStats,
          t,
          raceConfig,
          1 // demoSpeedFactor
        );
        
        const marker = markerRefs.current[script.pigeonId];
        if (marker) {
          // Debug: Check for NaN before setting position
          if (isNaN(position.lat) || isNaN(position.lng)) {
            console.error(`NaN position for pigeon ${script.pigeonId}:`, position);
            return;
          }
          
          marker.setLatLng([position.lat, position.lng]);
          // Use the owner's color for normal/finished
          const color = extScript.markerColor || '#333';
          if (state === 'lost') {
            marker.setStyle({ color: 'gray', fillColor: 'gray' });
          } else if (state === 'strayed') {
            marker.setStyle({ color: 'orange', fillColor: 'orange' });
          } else if (state === 'finished') {
            marker.setStyle({ color: color, fillColor: color });
          } else if (state === 'dead') {
            marker.setStyle({ color: 'black', fillColor: 'black' });
          } else {
            marker.setStyle({ color: color, fillColor: color });
          }
        }
      });
      animationFrame = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      map.remove();
    };
  }, [raceScripts, stats, raceConfig, raceStartTime, durationMs, homeBases, raceStart, getPigeonFlightStateAtTime, weatherZones]);

  return <div ref={mapRef} className="w-full h-full rounded-xl border border-gray-300" style={{ height: '700px' }} />;
};

export default LeafletRaceMap;

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