'use client';

import React, { useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { AnalyticsDashboardProps } from '@/types/analytics';
import { useAnalyticsDashboard } from '@/hooks/useAnalyticsDashboard';
import { TAB_CONFIG } from '@/constants/analytics';
import {
  TabButton,
  StatsSection,
  TopicDistributionChart,
  MostCitedPapers,
  TrendsChart,
  WordCloudsSection,
  RankingsSection,
  WorldMap,
  RankBySelector
} from './analytics';
import { ErrorBoundary } from './analytics/ErrorBoundary';
import { LoadingSpinner } from './analytics/LoadingSpinner';

export default function AnalyticsDashboard({ data, onNodeSelect }: AnalyticsDashboardProps) {
  const {
    activeTab,
    rankBy,
    visibleTopics,
    activeTopicIndex,
    topicDistributionData,
    yearlyTrendsData,
    initializeVisibleTopics,
    toggleTopic,
    toggleAllTopics,
    handleTabChange,
    handleRankByChange,
    handleTopicHover,
  } = useAnalyticsDashboard(data);

  useEffect(() => {
    initializeVisibleTopics();
  }, [initializeVisibleTopics]);

  if (!data || !data.basic_stats) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <LoadingSpinner size="lg" text="Loading analytics data..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        </div>
        
        <div className="flex space-x-2" role="tablist">
          {Object.entries(TAB_CONFIG).map(([key, config]) => (
            <TabButton 
              key={key}
              id={config.id} 
              label={config.label} 
              active={activeTab === key} 
              onClick={() => handleTabChange(key as any)} 
            />
          ))}
        </div>
      </div>

      <StatsSection data={data} />

      {activeTab === 'rankings' && (
        <RankBySelector 
          rankBy={rankBy} 
          onRankByChange={handleRankByChange} 
        />
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Topic Distribution</h3>
              <span className="text-sm text-gray-500">{topicDistributionData.length} topics</span>
            </div>
            
            <TopicDistributionChart
              data={topicDistributionData}
              totalPapers={data.basic_stats.num_papers}
              activeTopicIndex={activeTopicIndex}
              onTopicHover={handleTopicHover}
              onNodeSelect={onNodeSelect}
            />
          </div>

          <MostCitedPapers data={data} onNodeSelect={onNodeSelect} />
        </div>
      )}

      {activeTab === 'trends' && (
        <TrendsChart
          data={data}
          yearlyTrendsData={yearlyTrendsData}
          visibleTopics={visibleTopics}
          onToggleTopic={toggleTopic}
          onToggleAllTopics={toggleAllTopics}
        />
      )}
      
      {activeTab === 'wordclouds' && (
        <WordCloudsSection data={data} />
      )}
      
      {activeTab === 'rankings' && (
        <RankingsSection 
          data={data} 
          rankBy={rankBy} 
          onNodeSelect={onNodeSelect} 
        />
      )}
      
      {activeTab === 'map' && (
        <WorldMap 
          data={data} 
          onCountrySelect={onNodeSelect ? (country: string) => {
            const countryNameToIsoMap: Record<string, string> = {
              'United States of America': 'US',
              'China': 'CN',
              'Germany': 'DE',
              'United Kingdom': 'GB',
              'Italy': 'IT',
              'France': 'FR',
              'Japan': 'JP',
              'Canada': 'CA',
              'Australia': 'AU',
              'Spain': 'ES',
              'Russia': 'RU',
              'India': 'IN',
              'Brazil': 'BR',
              'Mexico': 'MX',
              'South Korea': 'KR',
              'Iran': 'IR',
              'Singapore': 'SG',
              'Hong Kong': 'HK',
              'Austria': 'AT',
              'Switzerland': 'CH',
              'Netherlands': 'NL',
              'Poland': 'PL',
              'Israel': 'IL',
              'Belgium': 'BE',
              'Sweden': 'SE',
              'Denmark': 'DK',
              'Finland': 'FI',
              'Czech Republic': 'CZ',
              'Hungary': 'HU',
              'Norway': 'NO',
              'Thailand': 'TH',
              'Vietnam': 'VN',
              'Indonesia': 'ID',
              'Malaysia': 'MY',
              'Philippines': 'PH',
              'Egypt': 'EG',
              'South Africa': 'ZA',
              'Nigeria': 'NG',
              'Kenya': 'KE',
              'Argentina': 'AR',
              'Chile': 'CL',
              'New Zealand': 'NZ',
              'Pakistan': 'PK',
              'Bangladesh': 'BD',
              'Saudi Arabia': 'SA',
              'United Arab Emirates': 'AE',
              'Turkey': 'TR',
              'Greece': 'GR',
              'Romania': 'RO',
              'Bulgaria': 'BG',
              'Portugal': 'PT',
              'Ireland': 'IE',
              'Iceland': 'IS',
              'Lithuania': 'LT',
              'Latvia': 'LV',
              'Estonia': 'EE',
              'Cyprus': 'CY',
              'Malta': 'MT',
              'Slovenia': 'SI',
              'Croatia': 'HR',
              'Bosnia and Herzegovina': 'BA',
              'Montenegro': 'ME',
              'Albania': 'AL',
              'Macedonia': 'MK',
              'Serbia': 'RS',
              'Ukraine': 'UA',
              'Moldova': 'MD',
              'Armenia': 'AM',
              'Georgia': 'GE',
              'Azerbaijan': 'AZ',
              'Turkmenistan': 'TM',
              'Kazakhstan': 'KZ',
              'Uzbekistan': 'UZ',
              'Kyrgyzstan': 'KG',
              'Tajikistan': 'TJ',
              'Syria': 'SY',
              'Yemen': 'YE',
              'Oman': 'OM',
              'Qatar': 'QA',
              'Bahrain': 'BH',
              'Kuwait': 'KW'
            };
            
            const isoCode = countryNameToIsoMap[country] || country;
            
            const countryNode = {
              id: `country_${isoCode}`,
              label: country,
              degree: 0,
              type: 'country',
              properties: {}
            };
            onNodeSelect(countryNode);
          } : undefined}
        />
      )}
    </div>
    </ErrorBoundary>
  );
}