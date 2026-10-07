import React from 'react';
import { Award } from 'lucide-react';
import { AnalysisResult, SelectedNode } from '@/types/analytics';
import { RankingIcon } from './RankingIcon';

interface MostCitedPapersProps {
  data: AnalysisResult;
  onNodeSelect: (node: SelectedNode | null) => void;
}

export const MostCitedPapers: React.FC<MostCitedPapersProps> = ({ data, onNodeSelect }) => {
  const handlePaperClick = (paper: any, index: number) => {
    onNodeSelect({
      id: paper.id ? paper.id : `paper_${paper.name}`,
      label: paper.name,
      degree: paper.count,
      type: 'paper',
      properties: {}
    });
  };

  return (
    <div className="xl:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Most Cited Papers</h3>
        <Award className="w-5 h-5 text-yellow-500" />
      </div>
      <div className="flex-1 overflow-y-auto max-h-[400px] pr-2">
        <div className="space-y-3">
          {data.most_cited_papers.map((paper, index) => (
            <div 
              key={index} 
              className="group p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
              onClick={() => handlePaperClick(paper, index)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <RankingIcon rank={index + 1} size="md" />
                    <span className="text-xs text-gray-500 font-medium">#{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                    {paper.name}
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    {paper.authors && paper.authors.length > 0 && (
                      <p className="truncate">
                        {paper.authors.length > 2 
                          ? `${paper.authors.slice(0, 2).join(', ')} et al.`
                          : paper.authors.join(', ')
                        }
                      </p>
                    )}
                    {paper.year && (
                      <p className="text-xs text-gray-400">
                        {paper.year}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 ml-3 text-right">
                  <div className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    <span className="text-sm font-bold">{paper.count}</span>
                    <span className="text-xs">cites</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
