import React from 'react';
import { useRaceReplayData } from '../hooks/useRaceReplayData';
import RaceReplayPage from '../components/RaceReplayPage';

interface RaceReplayContainerProps {
  raceId: string;
  userId: string;
}

/**
 * Top-level container for the race replay system.
 * Fetches all data, handles loading/error, and renders RaceReplayPage.
 */
const RaceReplayContainer: React.FC<RaceReplayContainerProps> = ({ raceId, userId }) => {
  const { pigeons, userPigeonIds, weatherZones, raceDuration, isLoading, error } = useRaceReplayData(raceId, userId);

  if (isLoading) {
    return <div role="status" aria-live="polite">Loading race replay...</div>;
  }
  if (error) {
    return <div role="alert" style={{ color: 'red' }}>Error: {error}</div>;
  }
  if (!pigeons.length) {
    return <div>No race data available for this race.</div>;
  }

  return (
    <RaceReplayPage
      pigeons={pigeons}
      userPigeonIds={userPigeonIds}
      weatherZones={weatherZones}
      raceDuration={raceDuration}
    />
  );
};

export default RaceReplayContainer; 