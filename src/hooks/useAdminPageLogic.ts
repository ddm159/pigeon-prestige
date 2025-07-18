import { useState, useEffect } from 'react';
import { gameSettingsService } from '../services/gameSettings';
import type { GameSetting, User } from '../types/pigeon';

export function useAdminPageLogic(gameUser: User | null) {
  const [gameSettings, setGameSettings] = useState<GameSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [penaltyCount, setPenaltyCount] = useState<number | null>(null);

  useEffect(() => {
    loadGameSettings();
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

  return {
    gameSettings,
    setGameSettings,
    loading,
    updating,
    penaltyCount,
    loadGameSettings,
    updateSetting,
    applyPigeonCapPenalties,
    handleSettingChange,
    handleSaveSetting,
    gameUser,
  };
} 