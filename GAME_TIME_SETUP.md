# Game Time System Setup Guide

## Overview
The game time system allows the game world to progress automatically with scheduled updates at 00:00, 06:00, 12:00, and 18:00 Belgium time (GMT+2). Each update advances the game by one day.

## Database Setup

1. **Run the migration:**
   ```sql
   -- Execute the game-time-system.sql file in your Supabase SQL Editor
   ```

2. **Verify the setup:**
   ```sql
   -- Check current game date
   SELECT get_current_game_date();
   
   -- Check game time state
   SELECT * FROM game_time_state ORDER BY created_at DESC LIMIT 1;
   ```

## Scheduled Updates Implementation

### Option 1: Supabase Edge Functions (Recommended)

1. **Create an Edge Function:**
   ```bash
   supabase functions new game-time-update
   ```

2. **Edge Function Code** (`supabase/functions/game-time-update/index.ts`):
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   }

   serve(async (req) => {
     if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: corsHeaders })
     }

     try {
       const supabaseClient = createClient(
         Deno.env.get('SUPABASE_URL') ?? '',
         Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
       )

       // Check if it's time for an update
       const { data: state } = await supabaseClient
         .from('game_time_state')
         .select('next_update_time, is_paused')
         .order('created_at', { ascending: false })
         .limit(1)
         .single()

       if (!state || state.is_paused) {
         return new Response(JSON.stringify({ message: 'Game time is paused or no state found' }), {
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
           status: 200,
         })
       }

       const now = new Date()
       const nextUpdate = new Date(state.next_update_time)

       if (now >= nextUpdate) {
         // Advance game time
         const { error } = await supabaseClient.rpc('advance_game_time')
         
         if (error) {
           throw error
         }

         return new Response(JSON.stringify({ message: 'Game time advanced successfully' }), {
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
           status: 200,
         })
       } else {
         return new Response(JSON.stringify({ message: 'Not time for update yet' }), {
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
           status: 200,
         })
       }
     } catch (error) {
       return new Response(JSON.stringify({ error: error.message }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 500,
       })
     }
   })
   ```

3. **Deploy the function:**
   ```bash
   supabase functions deploy game-time-update
   ```

4. **Set up cron job** (using a service like cron-job.org):
   - URL: `https://your-project.supabase.co/functions/v1/game-time-update`
   - Schedule: Every 6 hours (00:00, 06:00, 12:00, 18:00 Belgium time)
   - Headers: `Authorization: Bearer your-anon-key`

### Option 2: External Cron Service

Use a service like cron-job.org, GitHub Actions, or AWS EventBridge:

1. **Create a webhook endpoint** that calls the `advance_game_time()` function
2. **Schedule it to run** at 00:00, 06:00, 12:00, and 18:00 Belgium time

### Option 3: Manual Updates (Development)

For development/testing, you can manually trigger updates from the admin panel.

## Features

### 1. **Automatic Game Day Progression**
- Game advances by 1 day every 6 hours
- Triggers feeding updates for all pigeons
- Applies pigeon cap penalties
- Logs all time advancements

### 2. **Game Date Display**
- Shows current game date in header
- Displays time until next update
- Shows pause status

### 3. **Admin Controls**
- Manual time advancement
- Pause/resume game time
- View recent time log
- Monitor update count

### 4. **Time Settings**
- Configurable update times
- Timezone settings
- Auto-update toggle

## Testing

1. **Manual Advancement:**
   - Go to Admin page
   - Click "Advance 1 Day"
   - Check that game date updates

2. **Pause/Resume:**
   - Click "Pause Time" in admin
   - Verify header shows "PAUSED"
   - Click "Resume Time" to continue

3. **Scheduled Updates:**
   - Set up cron job
   - Monitor game time log
   - Verify automatic progression

## Troubleshooting

### Game time not advancing:
1. Check if game is paused
2. Verify cron job is running
3. Check Supabase function logs
4. Ensure RLS policies allow function execution

### Date display issues:
1. Check browser timezone
2. Verify date formatting
3. Check network connectivity

### Admin controls not working:
1. Verify admin privileges
2. Check function permissions
3. Review error logs

## Future Enhancements

1. **Seasonal Events:** Different game mechanics based on game date
2. **Time Acceleration:** Allow faster/slower time progression
3. **Historical Logs:** Detailed history of all game events
4. **Time-based Quests:** Events that occur on specific dates
5. **Weather System:** Weather changes based on game date 