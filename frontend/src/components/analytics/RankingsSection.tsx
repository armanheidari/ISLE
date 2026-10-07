import React from 'react';
import { AnalysisResult, SelectedNode, RankByType } from '@/types/analytics';
import { getRankingData, createNodeFromData } from '@/utils/analyticsDataTransformers';
import { RankingIcon } from './RankingIcon';

interface RankingsSectionProps {
  data: AnalysisResult;
  rankBy: RankByType;
  onNodeSelect: (node: SelectedNode | null) => void;
}

interface RankingListProps {
  title: string;
  items: Array<{ name: string; count: number }>;
  hoverColorClass: string;
  countColor: string;
  onItemClick: (item: { name: string; count: number }) => void;
}

const RankingList: React.FC<RankingListProps> = ({ 
  title, 
  items, 
  hoverColorClass, 
  countColor, 
  onItemClick 
}) => (
  <div className="bg-gray-50 rounded-lg p-4 h-full flex flex-col">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="space-y-2 flex-1">
      {items.slice(0, 10).map((item, index) => (
        <div 
          key={index} 
          className={`flex justify-between items-center py-2 px-2 rounded-md ${hoverColorClass} cursor-pointer transition-colors duration-200 min-h-[2rem]`}
          onClick={() => onItemClick(item)}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <RankingIcon rank={index + 1} size="sm" />
            <span className="text-sm text-gray-900 truncate" title={item.name}>{item.name}</span>
          </div>
          <span className={`text-sm font-medium ${countColor} flex-shrink-0 ml-2`}>{item.count}</span>
        </div>
      ))}
    </div>
  </div>
);

export const RankingsSection: React.FC<RankingsSectionProps> = ({ 
  data, 
  rankBy, 
  onNodeSelect 
}) => {
  const handleAuthorClick = (author: { name: string; count: number }) => {
    onNodeSelect(createNodeFromData(
      `author_${author.name}`,
      author.name,
      author.count,
      'author'
    ));
  };

  const handleCountryClick = (country: { name: string; count: number }) => {
    onNodeSelect(createNodeFromData(
      `country_${country.name}`,
      country.name,
      country.count,
      'country'
    ));
  };

  const handleInstitutionClick = (institution: { name: string; count: number }) => {
    onNodeSelect(createNodeFromData(
      `institution_${institution.name}`,
      institution.name,
      institution.count,
      'institution'
    ));
  };

  const authors = getRankingData(data, rankBy, 'authors');
  const countries = getRankingData(data, rankBy, 'countries');
  const institutions = getRankingData(data, rankBy, 'institutions');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      <RankingList
        title="Top Authors"
        items={authors}
        hoverColorClass="hover:bg-blue-100"
        countColor="text-blue-600"
        onItemClick={handleAuthorClick}
      />
      <RankingList
        title="Top Countries"
        items={countries}
        hoverColorClass="hover:bg-green-100"
        countColor="text-green-600"
        onItemClick={handleCountryClick}
      />
      <RankingList
        title="Top Institutions"
        items={institutions}
        hoverColorClass="hover:bg-purple-100"
        countColor="text-purple-600"
        onItemClick={handleInstitutionClick}
      />
    </div>
  );
};
