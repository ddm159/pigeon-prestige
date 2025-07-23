import React from "react";
import { useEligiblePigeonsForRace } from "../hooks/useEligiblePigeonsForRace";

interface SubscribeToRaceModalProps {
  userId: string;
  raceId: string;
  onSubscribe: (pigeonId: string) => void;
  onClose: () => void;
}

/**
 * Modal for subscribing a pigeon to a race.
 * Shows eligible pigeons as selectable, ineligible as disabled.
 */
const SubscribeToRaceModal: React.FC<SubscribeToRaceModalProps> = ({
  userId,
  raceId,
  onSubscribe,
  onClose,
}) => {
  const { eligiblePigeons, ineligiblePigeons, isLoading, error } =
    useEligiblePigeonsForRace(userId, raceId);

  if (isLoading) return <div>Loading pigeons...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="subscribe-modal-title">
      <h2 id="subscribe-modal-title">Subscribe a Pigeon to Race</h2>
      <button onClick={onClose} aria-label="Close modal">Close</button>
      <h3>Eligible Pigeons</h3>
      {eligiblePigeons.length === 0 && (
        <div>No eligible pigeons available for this race.</div>
      )}
      <ul>
        {eligiblePigeons.map((pigeon) => (
          <li key={pigeon.id}>
            <button
              onClick={() => onSubscribe(pigeon.id)}
              aria-label={`Subscribe ${pigeon.name} to race`}
            >
              {pigeon.name}
            </button>
          </li>
        ))}
      </ul>
      {ineligiblePigeons.length > 0 && (
        <>
          <h3>Ineligible Pigeons</h3>
          <ul>
            {ineligiblePigeons.map((pigeon) => (
              <li key={pigeon.id}>
                <button disabled title="Already racing today!" aria-disabled="true">
                  {pigeon.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default SubscribeToRaceModal; 