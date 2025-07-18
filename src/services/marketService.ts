import { supabase } from './supabase';

/**
 * Market Services
 */
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