import { useState, useEffect } from 'react';
import { gameSettingsService } from '../services/gameSettings';
import { gameTimeService } from '../services/gameTimeService';
import type { GameSetting, User } from '../types/pigeon';
import type { GameTimeState, GameTimeLog } from '../services/gameTimeService';

export function useAdminPageLogic(gameUser: User | null) {
  const [gameSettings, setGameSettings] = useState<GameSetting[]>([]);
  const [gameTimeState, setGameTimeState] = useState<GameTimeState | null>(null);
  const [gameTimeLog, setGameTimeLog] = useState<GameTimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [penaltyCount, setPenaltyCount] = useState<number | null>(null);

  useEffect(() => {
    loadGameSettings();
    loadGameTimeData();
  }, []);

  const loadGameSettings = async () => {
    try {
      const settings = await gameSettingsService.getGameSettings();
      setGameSettings(settings);
    } catch (error) {
      console.error('Error loading game settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGameTimeData = async () => {
    try {
      const [state, log] = await Promise.all([
        gameTimeService.getGameTimeState(),
        gameTimeService.getGameTimeLog(5)
      ]);
      setGameTimeState(state);
      setGameTimeLog(log);
    } catch (error) {
      console.error('Error loading game time data:', error);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    setUpdating(true);
    try {
      await gameSettingsService.updateGameSetting(key, value);
      await loadGameSettings(); // Reload settings
    } catch (error) {
      console.error('Error updating setting:', error);
    } finally {
      setUpdating(false);
    }
  };

  const applyPigeonCapPenalties = async () => {
    setUpdating(true);
    try {
      const count = await gameSettingsService.applyPigeonCapPenaltiesForAllUsers();
      setPenaltyCount(count);
      setTimeout(() => setPenaltyCount(null), 5000); // Clear after 5 seconds
    } catch (error) {
      console.error('Error applying penalties:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    const updatedSettings = gameSettings.map(setting =>
      setting.setting_key === key ? { ...setting, setting_value: value } : setting
    );
    setGameSettings(updatedSettings);
  };

  const handleSaveSetting = async (key: string) => {
    const setting = gameSettings.find(s => s.setting_key === key);
    if (setting) {
      await updateSetting(key, setting.setting_value);
    }
  };

  const advanceGameTime = async () => {
    setUpdating(true);
    try {
      await gameTimeService.advanceGameTime();
      await loadGameTimeData();
    } catch (error) {
      console.error('Error advancing game time:', error);
    } finally {
      setUpdating(false);
    }
  };

  const toggleGameTimePause = async () => {
    if (!gameTimeState) return;
    
    setUpdating(true);
    try {
      await gameTimeService.setGameTimePaused(!gameTimeState.is_paused);
      await loadGameTimeData();
    } catch (error) {
      console.error('Error toggling game time pause:', error);
    } finally {
      setUpdating(false);
    }
  };

  return {
    gameSettings,
    setGameSettings,
    gameTimeState,
    gameTimeLog,
    loading,
    updating,
    penaltyCount,
    loadGameSettings,
    loadGameTimeData,
    updateSetting,
    applyPigeonCapPenalties,
    advanceGameTime,
    toggleGameTimePause,
    handleSettingChange,
    handleSaveSetting,
    gameUser,
  };
} 