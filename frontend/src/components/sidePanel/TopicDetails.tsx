import React from 'react';
import { TopicDetails as TopicDetailsType, SelectedNode } from '@/types/sidePanel';
import { InlineChunkedList } from './InlineChunkedList';
import { ClickableTag } from './ClickableTag';
import { PaperList } from './PaperList';
import { StatisticsGrid } from './StatisticsGrid';
import { FieldLabel } from './FieldLabel';
import { SectionHeader } from './SectionHeader';
import { CHUNK_SIZE } from '@/constants/sidePanel';

interface TopicDetailsProps {
  topicDetails: TopicDetailsType;
  onNodeSelect?: (node: SelectedNode | null) => void;
}

export function TopicDetails({ topicDetails, onNodeSelect }: TopicDetailsProps) {
  const statistics = [
    { value: topicDetails.paper_count, label: 'Papers', color: 'papers' as const },
    { value: topicDetails.connections_in_graph, label: 'Connections', color: 'average' as const }
  ];

  return (
    <div className="space-y-4">
      <SectionHeader>Topic Details</SectionHeader>

      <div>
        <FieldLabel>Topic Name</FieldLabel>
        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded mt-1">
          {topicDetails.name || topicDetails.topic_id}
        </p>
      </div>

      {topicDetails.keywords && topicDetails.keywords.length > 0 && (
        <div>
          <FieldLabel>Keywords</FieldLabel>
          <div className="mt-1">
            <InlineChunkedList
              items={topicDetails.keywords}
              chunkSize={CHUNK_SIZE}
              className="flex flex-wrap"
              renderItem={(keyword: string, idx: number) => (
                <ClickableTag
                  key={idx}
                  label={keyword}
                  type="keyword"
                  onNodeSelect={onNodeSelect}
                />
              )}
            />
          </div>
        </div>
      )}

      <StatisticsGrid items={statistics} columns={2} />

      {topicDetails.top_papers && topicDetails.top_papers.length > 0 && (
        <div>
          <FieldLabel>Top Papers</FieldLabel>
          <PaperList papers={topicDetails.top_papers} onNodeSelect={onNodeSelect} />
        </div>
      )}

      {topicDetails.connected_authors && topicDetails.connected_authors.length > 0 && (
        <div>
          <FieldLabel>Connected Authors</FieldLabel>
          <div className="mt-1">
            <InlineChunkedList
              items={topicDetails.connected_authors}
              chunkSize={CHUNK_SIZE}
              className="flex flex-wrap"
              renderItem={(author: string, idx: number) => (
                <ClickableTag
                  key={idx}
                  label={author}
                  type="author"
                  onNodeSelect={onNodeSelect}
                />
              )}
            />
          </div>
        </div>
      )}

      {topicDetails.connected_institutions && topicDetails.connected_institutions.length > 0 && (
        <div>
          <FieldLabel>Connected Institutions</FieldLabel>
          <div className="mt-1">
            <InlineChunkedList
              items={topicDetails.connected_institutions}
              chunkSize={CHUNK_SIZE}
              className="flex flex-wrap"
              renderItem={(institution: string, idx: number) => (
                <ClickableTag
                  key={idx}
                  label={institution}
                  type="institution"
                  onNodeSelect={onNodeSelect}
                />
              )}
            />
          </div>
        </div>
      )}

      {topicDetails.connected_countries && topicDetails.connected_countries.length > 0 && (
        <div>
          <FieldLabel>Connected Countries</FieldLabel>
          <div className="mt-1">
            <InlineChunkedList
              items={topicDetails.connected_countries}
              chunkSize={CHUNK_SIZE}
              className="flex flex-wrap"
              renderItem={(country: string, idx: number) => (
                <ClickableTag
                  key={idx}
                  label={country}
                  type="country"
                  onNodeSelect={onNodeSelect}
                />
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
