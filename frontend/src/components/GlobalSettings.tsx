'use client';

import { useState, useEffect } from 'react';
import { Settings, X, Save, RotateCcw } from 'lucide-react';

export interface GlobalSettings {
  model: 'NMF' | 'BERT';
  maxRequestedPapers: number;
  maxNodesLimit: number;
  maxEdgesLimit: number;
}

interface GlobalSettingsProps {
  settings: GlobalSettings;
  onSettingsChange: (settings: GlobalSettings) => void;
  onSave: (settings: GlobalSettings) => void;
  onReset: () => void;
}

const DEFAULT_SETTINGS: GlobalSettings = {
  model: 'NMF',
  maxRequestedPapers: 1000,
  maxNodesLimit: 10000,
  maxEdgesLimit: 30000,
};

export default function GlobalSettings({
  settings,
  onSettingsChange,
  onSave,
  onReset
}: GlobalSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<GlobalSettings>(settings);
  const [originalSettings, setOriginalSettings] = useState<GlobalSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
    setOriginalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    if (hasChanges) {
      onSave(localSettings);
      setOriginalSettings(localSettings);
      setIsOpen(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    setOriginalSettings(DEFAULT_SETTINGS);
    onReset();
  };

  const handleChange = (key: keyof GlobalSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
  };

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(originalSettings);

  return (
    <>
      <button
        onClick={() => {
          setLocalSettings(settings);
          setOriginalSettings(settings);
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        title="Global Settings"
      >
        <Settings className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-gray-900">Global Settings</h2>
                {hasChanges && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                    Unsaved changes
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setLocalSettings(originalSettings);
                  setIsOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic Model
                </label>
                <select
                  value={localSettings.model}
                  onChange={(e) => handleChange('model', e.target.value as 'NMF' | 'BERT')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="NMF">NMF (Non-negative Matrix Factorization)</option>
                  <option value="BERT">BERT (BERTopic)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose the topic modeling algorithm for analysis
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Requested Papers
                </label>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  step="100"
                  value={localSettings.maxRequestedPapers}
                  onChange={(e) => handleChange('maxRequestedPapers', parseInt(e.target.value) || 1000)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of papers to analyze (100-10,000)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Nodes Limit
                </label>
                <input
                  type="number"
                  min="100"
                  max="50000"
                  step="100"
                  value={localSettings.maxNodesLimit}
                  onChange={(e) => handleChange('maxNodesLimit', parseInt(e.target.value) || 10000)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum nodes in network visualization (100-50,000)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Edges Limit
                </label>
                <input
                  type="number"
                  min="100"
                  max="100000"
                  step="100"
                  value={localSettings.maxEdgesLimit}
                  onChange={(e) => handleChange('maxEdgesLimit', parseInt(e.target.value) || 30000)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum edges in network visualization (100-100,000)
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setLocalSettings(originalSettings);
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    hasChanges
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
