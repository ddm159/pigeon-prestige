import { supabase } from './supabase';

/**
 * Race Services
 */
export const raceService = {
  // Get all upcoming races
  async getUpcomingRaces() {
    const { data, error } = await supabase
      .from('races')
      .select('*')
      .eq('status', 'upcoming')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // Get race details with participants
  async getRaceDetails(raceId: string) {
    const { data, error } = await supabase
      .from('races')
      .select(`
        *,
        race_participants (
          *,
          pigeons (*),
          users (username)
        )
      `)
      .eq('id', raceId)
      .single();
    if (error) throw error;
    return data;
  },

  // Join a race
  async joinRace(raceId: string, pigeonId: string, userId: string) {
    // First check if user has enough balance
    const { data: user } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();
    const { data: race } = await supabase
      .from('races')
      .select('entry_fee')
      .eq('id', raceId)
      .single();
    if (!user || !race) throw new Error('User or race not found');
    if (user.balance < race.entry_fee) throw new Error('Insufficient balance');
    // Deduct entry fee
    await supabase
      .from('users')
      .update({ balance: user.balance - race.entry_fee })
      .eq('id', userId);
    // Add transaction record
    await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'race_entry',
        amount: -race.entry_fee,
        description: `Race entry fee`,
        related_id: raceId
      });
    // Join the race
    const { data, error } = await supabase
      .from('race_participants')
      .insert({
        race_id: raceId,
        pigeon_id: pigeonId,
        user_id: userId
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Simulate race results
  async simulateRace(raceId: string) {
    // Get all participants
    const { data: participants } = await supabase
      .from('race_participants')
      .select(`
        *,
        pigeons (*)
      `)
      .eq('race_id', raceId);
    if (!participants) return;
    // Calculate finish times based on pigeon stats
    const results = participants.map(participant => {
      const pigeon = participant.pigeons;
      if (!pigeon) return participant;
      // Calculate performance based on stats
      const performance = (
        pigeon.speed * 0.3 +
        pigeon.endurance * 0.2 +
        pigeon.sky_iq * 0.15 +
        pigeon.aerodynamics * 0.15 +
        pigeon.wing_power * 0.1 +
        pigeon.flapacity * 0.1
      ) / 100;
      // Add some randomness
      const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      const finishTime = (100 / performance) * randomFactor;
      return {
        ...participant,
        finish_time: parseFloat(finishTime.toFixed(2)),
        finish_position: 0 // Will be set after sorting
      };
    });
    // Sort by finish time and assign positions
    results.sort((a, b) => (a.finish_time || 0) - (b.finish_time || 0));
    results.forEach((result, index) => {
      result.finish_position = index + 1;
    });
    // Update participants with results
    for (const result of results) {
      await supabase
        .from('race_participants')
        .update({
          finish_time: result.finish_time,
          finish_position: result.finish_position
        })
        .eq('id', result.id);
    }
    // Award prizes to top 3
    const { data: race } = await supabase
      .from('races')
      .select('prize_pool')
      .eq('id', raceId)
      .single();
    if (race) {
      const prizes = [race.prize_pool * 0.5, race.prize_pool * 0.3, race.prize_pool * 0.2];
      for (let i = 0; i < Math.min(3, results.length); i++) {
        const participant = results[i];
        const prize = Math.floor(prizes[i]);
        // Award prize
        await supabase
          .from('users')
          .update({ 
            balance: supabase.rpc('increment', { 
              row: { id: participant.user_id }, 
              amount: prize 
            })
          })
          .eq('id', participant.user_id);
        // Update participant with prize
        await supabase
          .from('race_participants')
          .update({ prize_won: prize })
          .eq('id', participant.id);
        // Add transaction
        await supabase
          .from('transactions')
          .insert({
            user_id: participant.user_id,
            type: 'race_win',
            amount: prize,
            description: `Race prize - ${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : 'rd'} place`,
            related_id: raceId
          });
      }
    }
    // Update race status
    await supabase
      .from('races')
      .update({ status: 'completed' })
      .eq('id', raceId);
    return results;
  }
}; 