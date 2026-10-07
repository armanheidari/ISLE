import React from 'react';
import { InstitutionDetails as InstitutionDetailsType, SelectedNode } from '@/types/sidePanel';
import { InlineChunkedList } from './InlineChunkedList';
import { ClickableTag } from './ClickableTag';
import { PaperList } from './PaperList';
import { StatisticsGrid } from './StatisticsGrid';
import { FieldLabel } from './FieldLabel';
import { SectionHeader } from './SectionHeader';
import { CHUNK_SIZE } from '@/constants/sidePanel';

interface InstitutionDetailsProps {
  institutionDetails: InstitutionDetailsType;
  onNodeSelect?: (node: SelectedNode | null) => void;
}

export function InstitutionDetails({ institutionDetails, onNodeSelect }: InstitutionDetailsProps) {
  const statistics = [
    { value: institutionDetails.paper_count, label: 'Papers', color: 'papers' as const },
    { value: institutionDetails.total_citations, label: 'Total Citations', color: 'citations' as const },
    { value: institutionDetails.average_citations, label: 'Avg Citations', color: 'average' as const }
  ];

  return (
    <div className="space-y-4">
      <SectionHeader>Institution Details</SectionHeader>
      
      <StatisticsGrid items={statistics} />

      {institutionDetails.countries && institutionDetails.countries.length > 0 && (
        <div>
          <FieldLabel>Countries</FieldLabel>
          <div className="mt-1 space-y-1">
            <InlineChunkedList
              items={institutionDetails.countries}
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

      {institutionDetails.authors && institutionDetails.authors.length > 0 && (
        <div>
          <FieldLabel>Top Authors</FieldLabel>
          <div className="mt-1 space-y-1">
            <InlineChunkedList
              items={institutionDetails.authors}
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

      {institutionDetails.papers && institutionDetails.papers.length > 0 && (
        <div>
          <FieldLabel>Top Papers</FieldLabel>
          <PaperList papers={institutionDetails.papers} onNodeSelect={onNodeSelect} />
        </div>
      )}
    </div>
  );
}
