import React from 'react';
import { AuthorDetails as AuthorDetailsType, SelectedNode } from '@/types/sidePanel';
import { InlineChunkedList } from './InlineChunkedList';
import { ClickableTag } from './ClickableTag';
import { PaperList } from './PaperList';
import { StatisticsGrid } from './StatisticsGrid';
import { FieldLabel } from './FieldLabel';
import { SectionHeader } from './SectionHeader';
import { CHUNK_SIZE } from '@/constants/sidePanel';

interface AuthorDetailsProps {
  authorDetails: AuthorDetailsType;
  onNodeSelect?: (node: SelectedNode | null) => void;
}

export function AuthorDetails({ authorDetails, onNodeSelect }: AuthorDetailsProps) {
  const statistics = [
    { value: authorDetails.paper_count, label: 'Papers', color: 'papers' as const },
    { value: authorDetails.total_citations, label: 'Total Citations', color: 'citations' as const },
    { value: authorDetails.average_citations, label: 'Avg Citations', color: 'average' as const }
  ];

  return (
    <div className="space-y-4">
      <SectionHeader>Author Details</SectionHeader>
      
      <StatisticsGrid items={statistics} />

      {authorDetails.countries && authorDetails.countries.length > 0 && (
        <div>
          <FieldLabel>Countries</FieldLabel>
          <div className="mt-1 space-y-1">
            <InlineChunkedList
              items={authorDetails.countries}
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

      {authorDetails.institutions && authorDetails.institutions.length > 0 && (
        <div>
          <FieldLabel>Institutions</FieldLabel>
          <div className="mt-1 space-y-1">
            <InlineChunkedList
              items={authorDetails.institutions}
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

      {authorDetails.papers && authorDetails.papers.length > 0 && (
        <div>
          <FieldLabel>Top Papers</FieldLabel>
          <PaperList papers={authorDetails.papers} onNodeSelect={onNodeSelect} />
        </div>
      )}
    </div>
  );
}
