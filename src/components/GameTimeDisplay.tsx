import React, { useEffect, useState } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { gameTimeService } from '../services/gameTimeService';

const GameTimeDisplay: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameTime = async () => {
      try {
        const [date, timeUntil, paused] = await Promise.all([
          gameTimeService.getCurrentGameDate(),
          gameTimeService.getTimeUntilNextUpdate(),
          gameTimeService.isGameTimePaused()
        ]);

        setCurrentDate(date);
        setTimeUntilNext(timeUntil);
        setIsPaused(paused);
      } catch (error) {
        console.error('Error fetching game time:', error);
        setCurrentDate('1900-01-01');
        setTimeUntilNext('Unknown');
      } finally {
        setLoading(false);
      }
    };

    fetchGameTime();

    // Update every minute
    const interval = setInterval(() => {
      gameTimeService.getTimeUntilNextUpdate().then(setTimeUntilNext);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Calendar className="h-4 w-4 animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  const formattedDate = gameTimeService.formatGameDate(currentDate);

  return (
    <div className="flex items-center space-x-4 text-sm">
      {/* Game Date */}
      <div className="flex items-center space-x-2 text-gray-700">
        <Calendar className="h-4 w-4" />
        <span className="font-medium">{formattedDate}</span>
      </div>

      {/* Time Until Next Update */}
      <div className="flex items-center space-x-2 text-gray-600">
        <Clock className="h-4 w-4" />
        <span>
          {isPaused ? (
            <span className="text-orange-600 font-medium">PAUSED</span>
          ) : (
            `Next: ${timeUntilNext}`
          )}
        </span>
      </div>
    </div>
  );
};

export default GameTimeDisplay; 