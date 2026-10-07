import React, { memo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { TopicDistributionData, SelectedNode } from '@/types/analytics';
import { CHART_CONFIG } from '@/constants/analytics';

interface TopicDistributionChartProps {
  data: TopicDistributionData[];
  totalPapers: number;
  activeTopicIndex: number | null;
  onTopicHover: (index: number | null) => void;
  onNodeSelect: (node: SelectedNode | null) => void;
}

export const TopicDistributionChart: React.FC<TopicDistributionChartProps> = memo(({
  data,
  totalPapers,
  activeTopicIndex,
  onTopicHover,
  onNodeSelect
}) => {
  const handleTopicClick = (entry: TopicDistributionData) => {
    onNodeSelect({
      id: `topic_${entry.topicId}`,
      label: entry.name,
      degree: entry.value,
      type: 'topic',
      properties: {}
    });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Papers: <span className="font-medium">{data.value.toLocaleString()}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{data.percentage.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="relative">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={CHART_CONFIG.pieChart.innerRadius}
              outerRadius={CHART_CONFIG.pieChart.outerRadius}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={(_, index) => onTopicHover(index)}
              onMouseLeave={() => onTopicHover(null)}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  stroke={activeTopicIndex === index ? "#374151" : "transparent"}
                  strokeWidth={activeTopicIndex === index ? CHART_CONFIG.pieChart.strokeWidth : 0}
                  style={{
                    filter: activeTopicIndex !== null && activeTopicIndex !== index ? 'opacity(0.6)' : 'opacity(1)',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={CustomTooltip} />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {totalPapers.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Papers</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Topics Breakdown</h4>
        <div className="max-h-[370px] overflow-y-auto pr-2">
          {data.map((entry, index) => (
            <div
              key={entry.topicId}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer w-full max-w-full ${
                activeTopicIndex === index 
                  ? 'bg-blue-50 border border-blue-200 transform scale-[1.02]' 
                  : 'hover:bg-gray-50'
              }`}
              onMouseEnter={() => onTopicHover(index)}
              onMouseLeave={() => onTopicHover(null)}
              onClick={() => handleTopicClick(entry)}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.fill }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[250px]" title={entry.name}>
                    {entry.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[250px]">{entry.shortName}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-sm font-semibold text-gray-900">
                  {entry.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {entry.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
