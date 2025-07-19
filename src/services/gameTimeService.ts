import { supabase } from './supabase';

export interface GameTimeState {
  current_game_date: string;
  last_update_time: string;
  next_update_time: string;
  update_count: number;
  is_paused: boolean;
}

export interface GameTimeSettings {
  game_start_date: string;
  update_times: string;
  time_zone: string;
  auto_updates_enabled: boolean;
  update_interval_hours: number;
}

export interface GameTimeLog {
  id: string;
  game_date: string;
  update_time: string;
  update_type: 'scheduled' | 'manual' | 'admin';
  description: string;
  created_at: string;
}

export const gameTimeService = {
  /**
   * Get the current game date
   */
  async getCurrentGameDate(): Promise<string> {
    const { data, error } = await supabase.rpc('get_current_game_date');
    
    if (error) {
      console.error('Error getting current game date:', error);
      return '1900-01-01';
    }
    
    return data || '1900-01-01';
  },

  /**
   * Get the current game time state
   */
  async getGameTimeState(): Promise<GameTimeState | null> {
    const { data, error } = await supabase
      .from('game_time_state')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error getting game time state:', error);
      return null;
    }

    return data;
  },

  /**
   * Get game time settings
   */
  async getGameTimeSettings(): Promise<GameTimeSettings> {
    const { data, error } = await supabase
      .from('game_time_settings')
      .select('setting_key, setting_value');

    if (error) {
      console.error('Error getting game time settings:', error);
          return {
      game_start_date: '1900-01-01',
      update_times: '00:00,06:00,12:00,18:00',
      time_zone: 'Europe/Brussels',
      auto_updates_enabled: true,
      update_interval_hours: 6
    };
    }

    const settings: GameTimeSettings = {
      game_start_date: '1900-01-01',
      update_times: '00:00,06:00,12:00,18:00',
      time_zone: 'UTC',
      auto_updates_enabled: true,
      update_interval_hours: 6
    };

    data?.forEach(setting => {
      switch (setting.setting_key) {
        case 'game_start_date':
          settings.game_start_date = setting.setting_value;
          break;
        case 'update_times':
          settings.update_times = setting.setting_value;
          break;
        case 'time_zone':
          settings.time_zone = setting.setting_value;
          break;
        case 'auto_updates_enabled':
          settings.auto_updates_enabled = setting.setting_value === 'true';
          break;
        case 'update_interval_hours':
          settings.update_interval_hours = parseInt(setting.setting_value, 10);
          break;
      }
    });

    return settings;
  },

  /**
   * Manually advance game time (admin only)
   */
  async advanceGameTime(): Promise<void> {
    const { error } = await supabase.rpc('manual_advance_game_time');
    
    if (error) {
      console.error('Error advancing game time:', error);
      throw error;
    }
  },

  /**
   * Get recent game time log entries
   */
  async getGameTimeLog(limit: number = 10): Promise<GameTimeLog[]> {
    const { data, error } = await supabase
      .from('game_time_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting game time log:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Format game date for display
   */
  formatGameDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-BE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Europe/Brussels'
    });
  },

  /**
   * Get time until next update
   */
  async getTimeUntilNextUpdate(): Promise<string> {
    const state = await this.getGameTimeState();
    if (!state) return 'Unknown';

    const nextUpdate = new Date(state.next_update_time);
    const now = new Date();
    
    // Convert to Belgium timezone for display
    const belgiumTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Brussels' }));
    const nextUpdateBelgium = new Date(nextUpdate.toLocaleString('en-US', { timeZone: 'Europe/Brussels' }));
    
    const diff = nextUpdateBelgium.getTime() - belgiumTime.getTime();

    if (diff <= 0) return 'Nu';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}u ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  },

  /**
   * Check if game time is paused
   */
  async isGameTimePaused(): Promise<boolean> {
    const state = await this.getGameTimeState();
    return state?.is_paused || false;
  },

  /**
   * Pause/unpause game time (admin only)
   */
  async setGameTimePaused(paused: boolean): Promise<void> {
    const { error } = await supabase
      .from('game_time_state')
      .update({ is_paused: paused })
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error setting game time paused state:', error);
      throw error;
    }
  }
}; 