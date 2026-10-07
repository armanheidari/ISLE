'use client';

import React from 'react';
import { NetworkLegendProps } from '@/types/knowledgeGraph';
import { NODE_COLOR_PALETTE, NODE_TYPE_LABELS } from '@/constants/knowledgeGraph';

export default function NetworkLegend({ activeLegendItems, onToggle, activeTab }: NetworkLegendProps) {
  if (activeTab !== 'complete') return null;

  const nodeTypes = ['paper', 'author', 'institution', 'location', 'topic'] as const;

  return (
    <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-gray-200 p-3">
      <div className="space-y-1">
        {nodeTypes.map((nodeType) => {
          const isActive = activeLegendItems.includes(nodeType);
          const color = NODE_COLOR_PALETTE[nodeType as keyof typeof NODE_COLOR_PALETTE] || NODE_COLOR_PALETTE.default;
          const label = NODE_TYPE_LABELS[nodeType as keyof typeof NODE_TYPE_LABELS] || nodeType;
          
          return (
            <button
              key={nodeType}
              onClick={() => onToggle(nodeType)}
              className={`flex items-center space-x-2 transition-opacity ${
                isActive ? 'opacity-100' : 'opacity-30'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ 
                  backgroundColor: isActive ? color : '#d1d5db' 
                }}
              />
              <span className="text-xs text-gray-700">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
