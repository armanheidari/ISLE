import { AnalysisResult, TopicDistributionData } from '@/types/analytics';
import { CHART_COLORS } from '@/constants/analytics';

/**
 * Transforms topic distribution data for chart visualization
 */
export const transformTopicDistributionData = (data: AnalysisResult): TopicDistributionData[] => {
  return Object.entries(data.topic_distribution)
    .map(([topic, count], index) => {
      const topicInfo = data.topics_over_time.find(t => t.topic_id.toString() === topic);
      return {
        name: topicInfo?.topic_label || `Topic ${topic}`,
        shortName: `Topic ${topic}`,
        value: count,
        percentage: ((count / data.basic_stats.num_papers) * 100),
        fill: CHART_COLORS[index % CHART_COLORS.length],
        topicId: topic
      };
    })
    .sort((a, b) => b.value - a.value);
};

/**
 * Transforms yearly trends data with zero-filling for missing years
 */
export const transformYearlyTrendsData = (data: AnalysisResult) => {
  const allYears = new Set<number>();
  data.topics_over_time.forEach(topic => {
    Object.keys(topic.yearly_counts).forEach(year => {
      allYears.add(parseInt(year));
    });
  });
  
  const minYear = Math.min(...allYears);
  const maxYear = Math.max(...allYears);

  for (let year = minYear; year <= maxYear; year++) {
    allYears.add(year);
  }
  
  const sortedYears = Array.from(allYears).sort((a, b) => a - b);

  return sortedYears.map(year => {
    const yearData: Record<string, any> = { year };
    
    data.topics_over_time.forEach(topic => {
      const yearKey = year.toString();
      const yearlyCountsObj = topic.yearly_counts as Record<string, number>;
      yearData[topic.topic_label] = yearlyCountsObj[yearKey] || 0;
    });
    
    return yearData;
  });
};

/**
 * Creates a node object for graph selection
 */
export const createNodeFromData = (
  id: string,
  label: string,
  degree: number,
  type: string,
  properties: Record<string, any> = {}
) => ({
  id,
  label,
  degree,
  type,
  properties
});

/**
 * Gets the appropriate ranking data based on rank type
 */
export const getRankingData = (
  data: AnalysisResult,
  rankBy: 'papers' | 'citations',
  category: 'authors' | 'countries' | 'institutions'
) => {
  const dataMap = {
    authors: {
      papers: data.top_authors_by_papers || [],
      citations: data.top_authors_by_citations || []
    },
    countries: {
      papers: data.top_countries_by_papers || [],
      citations: data.top_countries_by_citations || []
    },
    institutions: {
      papers: data.top_institutions_by_papers || [],
      citations: data.top_institutions_by_citations || []
    }
  };

  return dataMap[category][rankBy];
};

/**
 * Calculates the rank badge styling based on position
 */
export const getRankBadgeStyle = (index: number) => {
  if (index === 0) return 'bg-yellow-500';
  if (index === 1) return 'bg-gray-400';
  if (index === 2) return 'bg-amber-600';
  return 'bg-gray-300';
};
