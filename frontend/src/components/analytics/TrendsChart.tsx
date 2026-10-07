import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { AnalysisResult } from '@/types/analytics';
import { CHART_COLORS, CHART_CONFIG } from '@/constants/analytics';

interface TrendsChartProps {
  data: AnalysisResult;
  yearlyTrendsData: any[];
  visibleTopics: Set<string>;
  onToggleTopic: (topicLabel: string) => void;
  onToggleAllTopics: () => void;
}

export const TrendsChart: React.FC<TrendsChartProps> = ({
  data,
  yearlyTrendsData,
  visibleTopics,
  onToggleTopic,
  onToggleAllTopics
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload) {
      return (
        <div 
          className="bg-white p-3 rounded-lg shadow-lg border border-gray-200"
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <p className="font-medium text-gray-900">Year: {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-600">
              <span 
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Topics Over Time</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {visibleTopics.size} of {data.topics_over_time.length} topics shown
            </span>
            <button
              onClick={onToggleAllTopics}
              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors"
            >
              {visibleTopics.size === data.topics_over_time.length ? 'Hide All' : 'Show All'}
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Select Topics to Display:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {data.topics_over_time.map((topic, index) => (
              <label
                key={topic.topic_id}
                className="flex items-center space-x-2 p-2 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors w-full max-w-full"
              >
                <input
                  type="checkbox"
                  checked={visibleTopics.has(topic.topic_label)}
                  onChange={() => onToggleTopic(topic.topic_label)}
                  className="rounded text-blue-600 focus:ring-blue-500 flex-shrink-0"
                />
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-gray-900 truncate min-w-0 max-w-[250px]" title={topic.topic_label}>
                    {topic.topic_label}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={yearlyTrendsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="year" 
              stroke="#6b7280"
              fontSize={12}
              ticks={yearlyTrendsData.map(d => d.year)}
              tickFormatter={(value) => value.toString()}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={50}
              label={{ value: 'Year', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold', fill: '#374151' } }}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              label={{ value: 'Number of Papers', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold', fill: '#374151' } }}
            />
            <Tooltip content={CustomTooltip} />
            {data.topics_over_time
              .filter(topic => visibleTopics.has(topic.topic_label))
              .map((topic, index) => (
                <Line 
                  key={topic.topic_id}
                  type="monotone" 
                  dataKey={topic.topic_label} 
                  stroke={CHART_COLORS[data.topics_over_time.findIndex(t => t.topic_id === topic.topic_id) % CHART_COLORS.length]}
                  strokeWidth={CHART_CONFIG.lineChart.strokeWidth}
                  dot={{ r: CHART_CONFIG.lineChart.dotRadius }}
                  activeDot={{ r: CHART_CONFIG.lineChart.activeDotRadius }}
                  connectNulls={false}
                />
              ))
            }
          </LineChart>
        </ResponsiveContainer>
        
        {visibleTopics.size === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No topics selected. Please select topics to display in the chart above.</p>
          </div>
        )}
      </div>
    </div>
  );
};
