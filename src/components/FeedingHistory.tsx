import React from 'react';
import { foodService } from '../services/foodService';
import { groupService } from '../services/gameServices';
import type { PigeonFeedHistory, PigeonGroup, Pigeon, FoodMix } from '../types/pigeon';

const FeedingHistory: React.FC = () => {
  const [groups, setGroups] = React.useState<PigeonGroup[]>([]);
  const [pigeons, setPigeons] = React.useState<Pigeon[]>([]);
  const [mixes, setMixes] = React.useState<FoodMix[]>([]);
  const [history, setHistory] = React.useState<PigeonFeedHistory[]>([]);
  const [selectedGroup, setSelectedGroup] = React.useState('');
  const [selectedPigeon, setSelectedPigeon] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  // TODO: Replace with real user ID from auth context
  const userId = 'me';

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      groupService.getGroupsForUser(userId),
      foodService.listFoodMixes(userId),
      // TODO: Integrate real pigeonService.getUserPigeons(userId) when available
      foodService.getPigeonFeedHistory('p1'), // TODO: Replace with all pigeons
    ])
      .then(([groups, mixes, history]) => {
        setGroups(groups);
        setMixes(mixes);
        // setPigeons(pigeons);
        setPigeons([
          { id: 'p1', name: 'Sky King', owner_id: '', gender: 'male', age_years: 1, age_months: 0, age_days: 0, status: 'active', speed: 0, endurance: 0, sky_iq: 0, aerodynamics: 0, vision: 0, wing_power: 0, flapacity: 0, vanity: 0, strength: 0, aggression: 0, landing: 0, loyalty: 0, health: 0, happiness: 0, fertility: 0, disease_resistance: 0, peak_speed: 0, peak_endurance: 0, peak_sky_iq: 0, peak_aerodynamics: 0, peak_vision: 0, peak_wing_power: 0, peak_flapacity: 0, peak_vanity: 0, peak_strength: 0, peak_aggression: 0, peak_landing: 0, peak_loyalty: 0, peak_health: 0, peak_happiness: 0, peak_fertility: 0, peak_disease_resistance: 0, eggs: 0, offspring: 0, breeding_quality: 0, adaptability: 0, recovery_rate: 0, laser_focus: 0, morale: 0, food: 0, peak_eggs: 0, peak_offspring: 0, peak_breeding_quality: 0, peak_adaptability: 0, peak_recovery_rate: 0, peak_laser_focus: 0, peak_morale: 0, peak_food: 0, races_won: 0, races_lost: 0, total_races: 0, best_time: null, total_distance: 0, offspring_produced: 0, successful_breedings: 0, picture_number: 1, created_at: '', updated_at: '' },
          { id: 'p2', name: 'Feather Queen', owner_id: '', gender: 'female', age_years: 1, age_months: 0, age_days: 0, status: 'active', speed: 0, endurance: 0, sky_iq: 0, aerodynamics: 0, vision: 0, wing_power: 0, flapacity: 0, vanity: 0, strength: 0, aggression: 0, landing: 0, loyalty: 0, health: 0, happiness: 0, fertility: 0, disease_resistance: 0, peak_speed: 0, peak_endurance: 0, peak_sky_iq: 0, peak_aerodynamics: 0, peak_vision: 0, peak_wing_power: 0, peak_flapacity: 0, peak_vanity: 0, peak_strength: 0, peak_aggression: 0, peak_landing: 0, peak_loyalty: 0, peak_health: 0, peak_happiness: 0, peak_fertility: 0, peak_disease_resistance: 0, eggs: 0, offspring: 0, breeding_quality: 0, adaptability: 0, recovery_rate: 0, laser_focus: 0, morale: 0, food: 0, peak_eggs: 0, peak_offspring: 0, peak_breeding_quality: 0, peak_adaptability: 0, peak_recovery_rate: 0, peak_laser_focus: 0, peak_morale: 0, peak_food: 0, races_won: 0, races_lost: 0, total_races: 0, best_time: null, total_distance: 0, offspring_produced: 0, successful_breedings: 0, picture_number: 2, created_at: '', updated_at: '' },
        ]);
        setHistory(Array.isArray(history) ? history : []);
        setSelectedPigeon('p1');
        setError(null);
      })
      .catch((e) => setError(e.message || 'Failed to load feeding history'))
      .finally(() => setLoading(false));
  }, [userId]);

  const filteredHistory = history.filter(h =>
    (!selectedGroup || h.group_id === selectedGroup) &&
    h.pigeon_id === selectedPigeon
  );

  if (loading) return <div>Loading feeding history...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h3>Feeding History</h3>
      <div style={{ marginBottom: 16 }}>
        <label>
          Group:
          <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
            <option value="">All</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </label>
        <label style={{ marginLeft: 16 }}>
          Pigeon:
          <select value={selectedPigeon} onChange={e => setSelectedPigeon(e.target.value)}>
            {pigeons.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Date/Time</th>
            <th>Food Mix</th>
            <th>Group</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.map(h => (
            <tr key={h.id} className={h.food_shortage ? 'bg-red-50' : ''}>
              <td>{new Date(h.applied_at).toLocaleString()}</td>
              <td>{mixes.find(m => m.id === h.food_mix_id)?.name || h.food_mix_id}</td>
              <td>{groups.find(g => g.id === h.group_id)?.name || h.group_id}</td>
              <td>
                {h.food_shortage ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    🚨 Food Shortage
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Fed
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* TODO: Add tests for FeedingHistory component */}
    </div>
  );
};

export default FeedingHistory; 