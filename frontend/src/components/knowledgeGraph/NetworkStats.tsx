'use client';

import React from 'react';
import { NetworkStatsProps } from '@/types/knowledgeGraph';

export default function NetworkStats({ filteredData, networkData, activeTab }: NetworkStatsProps) {
  if (!filteredData) return null;

  const avgDegree = filteredData.edges?.length && filteredData.nodes?.length 
    ? (filteredData.edges.length / filteredData.nodes.length * 2).toFixed(1)
    : '0';

  return (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center border border-blue-200">
        <div className="text-2xl font-bold text-blue-700">{filteredData.nodes?.length || 0}</div>
        <div className="text-sm text-blue-600 font-medium">Nodes</div>
        <div className="text-xs text-blue-500 mt-1">
          ({networkData?.nodes?.length || 0} total)
        </div>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center border border-green-200">
        <div className="text-2xl font-bold text-green-700">{filteredData.edges?.length || 0}</div>
        <div className="text-sm text-green-600 font-medium">Connections</div>
        <div className="text-xs text-green-500 mt-1">
          ({networkData?.edges?.length || 0} total)
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center border border-purple-200">
        <div className="text-2xl font-bold text-purple-700">{avgDegree}</div>
        <div className="text-sm text-purple-600 font-medium">Avg Degree</div>
      </div>
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg text-center border border-orange-200">
        <div className="text-2xl font-bold text-orange-700 capitalize">{activeTab.replace('_', ' ')}</div>
        <div className="text-sm text-orange-600 font-medium">Network Type</div>
      </div>
    </div>
  );
}
