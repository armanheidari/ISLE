import { useMemo } from 'react';
import { DetailedNodeInfo, SelectedNode } from '@/types/sidePanel';

interface UseNodeDetailsProps {
  selectedNode: SelectedNode | null;
  detailedNodeInfo: DetailedNodeInfo | null;
}

export function useNodeDetails({ selectedNode, detailedNodeInfo }: UseNodeDetailsProps) {
  const nodeDetails = useMemo(() => {
    if (!detailedNodeInfo) return null;

    const { paper_details, author_details, institution_details, country_details, topic_details } = detailedNodeInfo;

    if (paper_details) return { type: 'paper' as const, details: paper_details };
    if (author_details) return { type: 'author' as const, details: author_details };
    if (institution_details) return { type: 'institution' as const, details: institution_details };
    if (country_details) return { type: 'country' as const, details: country_details };
    if (topic_details) return { type: 'topic' as const, details: topic_details };

    return null;
  }, [detailedNodeInfo]);

  const isLoading = detailedNodeInfo?.loading || false;
  const error = detailedNodeInfo?.error || null;

  return {
    nodeDetails,
    isLoading,
    error,
    hasSelectedNode: !!selectedNode
  };
}
