import React, { useState, useRef, useEffect } from 'react';
import { useCompetition } from '../hooks/useCompetition';
import { CompetitionHeader } from '../components/competition/CompetitionHeader';
import { ErrorDisplay } from '../components/competition/ErrorDisplay';
import { DivisionSelector } from '../components/competition/DivisionSelector';
import { SeasonSelector } from '../components/competition/SeasonSelector';
import { CompetitionStats } from '../components/competition/CompetitionStats';
import { SeasonStandings } from '../components/competition/SeasonStandings';
import { UpcomingRaces } from '../components/competition/UpcomingRaces';
import type { DivisionType, RaceCategory } from '../types/competition';

/**
 * Competition Page - Main competition hub
 * Displays divisions, seasons, upcoming races, and competition overview
 */
export const CompetitionPage: React.FC = () => {
  const {
    // State
    divisions,
    seasons,
    activeSeason,
    seasonStandings,
    upcomingRaces,
    competitionStats,
    
    // Loading states
    loading,
    loadingDivisions,
    loadingSeasons,
    loadingStandings,
    loadingRaces,
    
    // Error state
    error,
    
    // Functions
    loadSeasonStandings,
    loadCompetitionStats,
    clearError
  } = useCompetition();

  // Local state for UI interactions
  const [selectedDivision, setSelectedDivision] = useState<DivisionType | 'all'>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedRaceCategory, setSelectedRaceCategory] = useState<RaceCategory | 'all'>('all');

  // Store function references to avoid dependency issues
  const functionsRef = useRef({ loadSeasonStandings, loadCompetitionStats });
  functionsRef.current = { loadSeasonStandings, loadCompetitionStats };

  // Auto-load data when selections change
  useEffect(() => {
    if (activeSeason?.id) {
      setSelectedSeason(activeSeason.id);
      functionsRef.current.loadSeasonStandings(activeSeason.id);
      functionsRef.current.loadCompetitionStats(activeSeason.id);
    }
  }, [activeSeason, selectedDivision]);

  // Note: Division stats loading removed for now - can be re-added when needed

  // Handle division selection
  const handleDivisionChange = (division: DivisionType | 'all') => {
    setSelectedDivision(division);
  };

  // Handle season selection
  const handleSeasonChange = (seasonId: string) => {
    setSelectedSeason(seasonId);
    loadSeasonStandings(seasonId);
    loadCompetitionStats(seasonId);
  };

  // Handle race category filter
  const handleRaceCategoryChange = (category: RaceCategory | 'all') => {
    setSelectedRaceCategory(category);
  };

  // Note: Race category filtering can be implemented when needed

    // Get division name by code
  const getDivisionName = (divisionCode: DivisionType | 'all') => {
    if (divisionCode === 'all') return 'All Divisions';
    const division = divisions.find(d => d.division_code === divisionCode);
    return division?.name || divisionCode;
  };

  // Get season name by ID
  const getSeasonName = (seasonId: string) => {
    const season = seasons.find(s => s.id === seasonId);
    return season?.name || 'Unknown Season';
  };

  if (loading && !divisions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading Competition...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CompetitionHeader />
      <ErrorDisplay error={error} onClear={clearError} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Divisions & Seasons */}
          <div className="lg:col-span-1 space-y-6">
            <DivisionSelector
              divisions={divisions}
              selectedDivision={selectedDivision}
              loading={loadingDivisions}
              onDivisionChange={handleDivisionChange}
            />
            <SeasonSelector
              seasons={seasons}
              selectedSeason={selectedSeason}
              loading={loadingSeasons}
              onSeasonChange={handleSeasonChange}
            />
            <CompetitionStats stats={competitionStats} />
          </div>

          {/* Right Column - Standings & Races */}
          <div className="lg:col-span-2 space-y-6">
            <SeasonStandings
              standings={seasonStandings}
              loading={loadingStandings}
              selectedSeason={selectedSeason}
              selectedDivision={selectedDivision}
              seasonName={getSeasonName(selectedSeason)}
              divisionName={getDivisionName(selectedDivision)}
            />
            <UpcomingRaces
              races={upcomingRaces}
              loading={loadingRaces}
              selectedRaceCategory={selectedRaceCategory}
              onRaceCategoryChange={handleRaceCategoryChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 