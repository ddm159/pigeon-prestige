import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get current state
  const { data: state, error } = await supabase
    .from("game_time_state")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !state) {
    return new Response("Failed to get game time state", { status: 500 });
  }

  // Advance by one day
  const newDate = new Date(state.current_game_date);
  newDate.setDate(newDate.getDate() + 1);

  // Update state
  await supabase
    .from("game_time_state")
    .update({
      current_game_date: newDate.toISOString().split("T")[0],
      last_update_time: new Date().toISOString(),
      next_update_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      update_count: state.update_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", state.id);

  // Log the update
  await supabase.from("game_time_log").insert({
    game_date: newDate.toISOString().split("T")[0],
    update_time: new Date().toISOString(),
    update_type: "scheduled",
    description: "Automatic game time advancement",
  });

  return new Response("Game time advanced", { status: 200 });
});