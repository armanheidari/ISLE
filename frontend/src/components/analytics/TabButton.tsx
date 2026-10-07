import React from 'react';
import { TabButtonProps } from '@/types/analytics';

export const TabButton: React.FC<TabButtonProps> = ({ id, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      active 
        ? 'bg-blue-600 text-white' 
        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
    }`}
    aria-pressed={active}
    aria-controls={`tab-panel-${id}`}
    role="tab"
  >
    {label}
  </button>
);
