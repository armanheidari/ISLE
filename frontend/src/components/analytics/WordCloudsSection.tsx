import React from 'react';
import { AnalysisResult } from '@/types/analytics';
import WordCloudVisualization from '../WordCloudVisualization';

interface WordCloudsSectionProps {
  data: AnalysisResult;
}

export const WordCloudsSection: React.FC<WordCloudsSectionProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Topic Word Clouds</h3>
        <span className="text-sm text-gray-500">{data.topic_wordclouds.length} topics</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.topic_wordclouds.map((topic, index) => (
          <div 
            key={topic.topic_id} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center justify-between">
              <span className="truncate min-w-0 flex-1 mr-2">{topic.topic_label}</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex-shrink-0">
                Topic {topic.topic_id}
              </span>
            </h4>
            <WordCloudVisualization words={topic.words} />
          </div>
        ))}
      </div>
    </div>
  );
};
