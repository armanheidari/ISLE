'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GlobalSettings } from '@/components/GlobalSettings';

interface SettingsContextType {
  settings: GlobalSettings;
  updateSettings: (newSettings: GlobalSettings) => void;
  resetSettings: () => void;
  saveSettings: (newSettings: GlobalSettings) => void;
}

const DEFAULT_SETTINGS: GlobalSettings = {
  model: 'NMF',
  maxRequestedPapers: 1000,
  maxNodesLimit: 10000,
  maxEdgesLimit: 30000,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const savedSettings = localStorage.getItem('isle-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.warn('Failed to parse saved settings, using defaults');
      }
    }
  }, []);

  const updateSettings = (newSettings: GlobalSettings) => {
    setSettings(newSettings);
  };

  const saveSettings = (newSettings: GlobalSettings) => {
    setSettings(newSettings);
    localStorage.setItem('isle-settings', JSON.stringify(newSettings));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('isle-settings');
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        saveSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
