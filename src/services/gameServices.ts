import { supabase } from './supabase';
import type { PigeonGroup, Pigeon } from '../types/pigeon';

// Race Services
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

// Breeding Services
export const breedingService = {
  // Get user's breeding pairs
  async getUserBreedingPairs(userId: string) {
    const { data, error } = await supabase
      .from('breeding_pairs')
      .select(`
        *,
        male_pigeon:pigeons!breeding_pairs_male_pigeon_id_fkey (*),
        female_pigeon:pigeons!breeding_pairs_female_pigeon_id_fkey (*)
      `)
      .eq('owner_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Create a breeding pair
  async createBreedingPair(malePigeonId: string, femalePigeonId: string, userId: string) {
    // Verify both pigeons belong to the user
    const { data: pigeons } = await supabase
      .from('pigeons')
      .select('id, gender')
      .in('id', [malePigeonId, femalePigeonId])
      .eq('owner_id', userId);

    if (!pigeons || pigeons.length !== 2) {
      throw new Error('Both pigeons must belong to you');
    }

    const malePigeon = pigeons.find(p => p.id === malePigeonId);
    const femalePigeon = pigeons.find(p => p.id === femalePigeonId);

    if (!malePigeon || !femalePigeon) {
      throw new Error('Invalid pigeon selection');
    }

    if (malePigeon.gender !== 'male' || femalePigeon.gender !== 'female') {
      throw new Error('Must select one male and one female pigeon');
    }

    const { data, error } = await supabase
      .from('breeding_pairs')
      .insert({
        male_pigeon_id: malePigeonId,
        female_pigeon_id: femalePigeonId,
        owner_id: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Simulate breeding results
  async simulateBreeding(breedingPairId: string) {
    const { data: pair } = await supabase
      .from('breeding_pairs')
      .select(`
        *,
        male_pigeon:pigeons!breeding_pairs_male_pigeon_id_fkey (*),
        female_pigeon:pigeons!breeding_pairs_female_pigeon_id_fkey (*)
      `)
      .eq('id', breedingPairId)
      .single();

    if (!pair || !pair.male_pigeon || !pair.female_pigeon) {
      throw new Error('Breeding pair not found');
    }

    const male = pair.male_pigeon;
    const female = pair.female_pigeon;

    // Calculate breeding success chance
    const successChance = (
      male.fertility * 0.3 +
      female.fertility * 0.3 +
      male.breeding_quality * 0.2 +
      female.breeding_quality * 0.2
    ) / 100;

    const isSuccessful = Math.random() < successChance;

    if (isSuccessful) {
      // Generate offspring stats (inherited from parents)
      const offspringStats = this.calculateOffspringStats(male, female);
      
      // Create offspring pigeon
      const { data: offspring } = await supabase
        .from('pigeons')
        .insert({
          owner_id: pair.owner_id,
          name: this.generateOffspringName(male.name, female.name),
          gender: Math.random() > 0.5 ? 'male' : 'female',
          ...offspringStats
        })
        .select()
        .single();

      // Update breeding pair
      await supabase
        .from('breeding_pairs')
        .update({
          offspring_produced: pair.offspring_produced + 1,
          successful_breedings: pair.successful_breedings + 1
        })
        .eq('id', breedingPairId);

      return { success: true, offspring };
    } else {
      // Update breeding pair
      await supabase
        .from('breeding_pairs')
        .update({
          successful_breedings: pair.successful_breedings
        })
        .eq('id', breedingPairId);

      return { success: false, offspring: null };
    }
  },

  // Calculate offspring stats based on parents
  calculateOffspringStats(male: Pigeon, female: Pigeon) {
    const stats: Record<string, number> = {};
    
    // For each stat, inherit from parents with some variation
    const statNames = [
      'speed', 'endurance', 'sky_iq', 'aerodynamics', 'vision',
      'wing_power', 'flapacity', 'vanity', 'strength', 'aggression',
      'landing', 'loyalty', 'health', 'happiness', 'fertility', 'disease_resistance'
    ];

    statNames.forEach(stat => {
      const maleStat = male[stat as keyof Pigeon] as number;
      const femaleStat = female[stat as keyof Pigeon] as number;
      
      // 60% chance to inherit from better parent, 40% from worse parent
      const betterParent = maleStat > femaleStat ? maleStat : femaleStat;
      const worseParent = maleStat > femaleStat ? femaleStat : maleStat;
      
      const inheritedStat = Math.random() < 0.6 ? betterParent : worseParent;
      
      // Add some random variation (±10%)
      const variation = 0.9 + Math.random() * 0.2;
      stats[stat] = Math.max(1, Math.min(100, Math.floor(inheritedStat * variation)));
    });

    return stats;
  },

  // Generate offspring name
  generateOffspringName(maleName: string, femaleName: string): string {
    const maleParts = maleName.split(' ');
    const femaleParts = femaleName.split(' ');
    
    // Combine parts of both names
    const firstName = Math.random() > 0.5 ? maleParts[0] : femaleParts[0];
    const lastName = Math.random() > 0.5 ? maleParts[maleParts.length - 1] : femaleParts[femaleParts.length - 1];
    
    return `${firstName} ${lastName}`;
  }
};

// Market Services
export const marketService = {
  // Get all active market listings
  async getMarketListings() {
    const { data, error } = await supabase
      .from('market_listings')
      .select(`
        *,
        pigeons (*),
        seller:users!market_listings_seller_id_fkey (username)
      `)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // List a pigeon for sale
  async listPigeonForSale(pigeonId: string, price: number, userId: string) {
    // Verify pigeon belongs to user
    const { data: pigeon } = await supabase
      .from('pigeons')
      .select('id')
      .eq('id', pigeonId)
      .eq('owner_id', userId)
      .single();

    if (!pigeon) {
      throw new Error('Pigeon not found or does not belong to you');
    }

    const { data, error } = await supabase
      .from('market_listings')
      .insert({
        pigeon_id: pigeonId,
        seller_id: userId,
        price
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Purchase a pigeon from market
  async purchasePigeon(listingId: string, buyerId: string) {
    // Get listing details
    const { data: listing } = await supabase
      .from('market_listings')
      .select(`
        *,
        pigeons (*)
      `)
      .eq('id', listingId)
      .eq('status', 'active')
      .single();

    if (!listing) {
      throw new Error('Listing not found or no longer active');
    }

    if (listing.seller_id === buyerId) {
      throw new Error('Cannot purchase your own pigeon');
    }

    // Check buyer has enough balance
    const { data: buyer } = await supabase
      .from('users')
      .select('balance')
      .eq('id', buyerId)
      .single();

    if (!buyer || buyer.balance < listing.price) {
      throw new Error('Insufficient balance');
    }

    // Transfer pigeon ownership
    await supabase
      .from('pigeons')
      .update({ owner_id: buyerId })
      .eq('id', listing.pigeon_id);

    // Transfer money
    await supabase
      .from('users')
      .update({ balance: buyer.balance - listing.price })
      .eq('id', buyerId);

    await supabase
      .from('users')
      .update({ 
        balance: supabase.rpc('increment', { 
          row: { id: listing.seller_id }, 
          amount: listing.price 
        })
      })
      .eq('id', listing.seller_id);

    // Update listing status
    await supabase
      .from('market_listings')
      .update({ status: 'sold' })
      .eq('id', listingId);

    // Add transactions
    await supabase
      .from('transactions')
      .insert([
        {
          user_id: buyerId,
          type: 'market_purchase',
          amount: -listing.price,
          description: `Purchased pigeon: ${listing.pigeons?.name}`,
          related_id: listing.pigeon_id
        },
        {
          user_id: listing.seller_id,
          type: 'market_sale',
          amount: listing.price,
          description: `Sold pigeon: ${listing.pigeons?.name}`,
          related_id: listing.pigeon_id
        }
      ]);

    return { success: true, pigeon: listing.pigeons };
  }
}; 

export const groupService = {
  // Create a new group
  async createGroup(ownerId: string, name: string, description?: string): Promise<PigeonGroup> {
    const { data, error } = await supabase
      .from('pigeon_groups')
      .insert({ owner_id: ownerId, name, description })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update group name/description
  async updateGroup(groupId: string, name: string, description?: string): Promise<PigeonGroup> {
    const { data, error } = await supabase
      .from('pigeon_groups')
      .update({ name, description, updated_at: new Date().toISOString() })
      .eq('id', groupId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete a group
  async deleteGroup(groupId: string): Promise<void> {
    const { error } = await supabase
      .from('pigeon_groups')
      .delete()
      .eq('id', groupId);
    if (error) throw error;
  },

  // Get all groups for a user
  async getGroupsForUser(ownerId: string): Promise<PigeonGroup[]> {
    const { data, error } = await supabase
      .from('pigeon_groups')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // Add a pigeon to a group
  async addPigeonToGroup(groupId: string, pigeonId: string): Promise<void> {
    const { error } = await supabase
      .from('pigeon_group_members')
      .insert({ group_id: groupId, pigeon_id: pigeonId });
    if (error) throw error;
  },

  // Remove a pigeon from a group
  async removePigeonFromGroup(groupId: string, pigeonId: string): Promise<void> {
    const { error } = await supabase
      .from('pigeon_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('pigeon_id', pigeonId);
    if (error) throw error;
  },

  // Get all pigeons in a group (with pigeon data)
  async getPigeonsInGroup(groupId: string): Promise<Pigeon[]> {
    const { data, error } = await supabase
      .from('pigeon_group_members')
      .select('pigeon_id, pigeons(*)')
      .eq('group_id', groupId);
    if (error) throw error;
    // data is array of { pigeon_id, pigeons: { ...pigeon fields } }
    return (data || []).flatMap((row: { pigeons: Pigeon[] }) => row.pigeons);
  },
}; 