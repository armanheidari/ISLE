import { useState, useCallback, useMemo } from 'react';
import { AnalysisResult, TabType, RankByType } from '@/types/analytics';
import { transformTopicDistributionData, transformYearlyTrendsData } from '@/utils/analyticsDataTransformers';
import { DEFAULT_VISIBLE_TOPICS_COUNT } from '@/constants/analytics';

export const useAnalyticsDashboard = (data: AnalysisResult) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [rankBy, setRankBy] = useState<RankByType>('papers');
  const [visibleTopics, setVisibleTopics] = useState<Set<string>>(new Set());
  const [activeTopicIndex, setActiveTopicIndex] = useState<number | null>(null);

  const topicDistributionData = useMemo(
    () => transformTopicDistributionData(data),
    [data.topic_distribution, data.topics_over_time, data.basic_stats.num_papers]
  );

  const yearlyTrendsData = useMemo(
    () => transformYearlyTrendsData(data),
    [data.topics_over_time]
  );

  const initializeVisibleTopics = useCallback(() => {
    if (visibleTopics.size === 0 && data.topics_over_time.length > 0) {
      const initialTopics = new Set(
        data.topics_over_time
          .slice(0, DEFAULT_VISIBLE_TOPICS_COUNT)
          .map(topic => topic.topic_label)
      );
      setVisibleTopics(initialTopics);
    }
  }, [visibleTopics.size, data.topics_over_time]);

  const toggleTopic = useCallback((topicLabel: string) => {
    setVisibleTopics(prev => {
      const newVisibleTopics = new Set(prev);
      if (newVisibleTopics.has(topicLabel)) {
        newVisibleTopics.delete(topicLabel);
      } else {
        newVisibleTopics.add(topicLabel);
      }
      return newVisibleTopics;
    });
  }, []);

  const toggleAllTopics = useCallback(() => {
    setVisibleTopics(prev => {
      if (prev.size === data.topics_over_time.length) {
        return new Set();
      } else {
        return new Set(data.topics_over_time.map(topic => topic.topic_label));
      }
    });
  }, [data.topics_over_time.length, data.topics_over_time]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleRankByChange = useCallback((rankType: RankByType) => {
    setRankBy(rankType);
  }, []);

  const handleTopicHover = useCallback((index: number | null) => {
    setActiveTopicIndex(index);
  }, []);

  return {
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
    handleTopicHover
  };
};
