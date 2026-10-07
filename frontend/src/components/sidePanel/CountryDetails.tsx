import React from 'react';
import { CountryDetails as CountryDetailsType, SelectedNode } from '@/types/sidePanel';
import { InlineChunkedList } from './InlineChunkedList';
import { ClickableTag } from './ClickableTag';
import { PaperList } from './PaperList';
import { StatisticsGrid } from './StatisticsGrid';
import { FieldLabel } from './FieldLabel';
import { SectionHeader } from './SectionHeader';
import { CHUNK_SIZE } from '@/constants/sidePanel';

interface CountryDetailsProps {
  countryDetails: CountryDetailsType;
  onNodeSelect?: (node: SelectedNode | null) => void;
}

export function CountryDetails({ countryDetails, onNodeSelect }: CountryDetailsProps) {
  const statistics = [
    { value: countryDetails.paper_count, label: 'Papers', color: 'papers' as const },
    { value: countryDetails.total_citations, label: 'Total Citations', color: 'citations' as const },
    { value: countryDetails.average_citations, label: 'Avg Citations', color: 'average' as const }
  ];

  return (
    <div className="space-y-4">
      <SectionHeader>Country Details</SectionHeader>
      
      <StatisticsGrid items={statistics} />

      {countryDetails.institutions && countryDetails.institutions.length > 0 && (
        <div>
          <FieldLabel>Top Institutions</FieldLabel>
          <div className="mt-1 space-y-1">
            <InlineChunkedList
              items={countryDetails.institutions}
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

      {countryDetails.authors && countryDetails.authors.length > 0 && (
        <div>
          <FieldLabel>Top Authors</FieldLabel>
          <div className="mt-1 space-y-1">
            <InlineChunkedList
              items={countryDetails.authors}
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

      {countryDetails.papers && countryDetails.papers.length > 0 && (
        <div>
          <FieldLabel>Top Papers</FieldLabel>
          <PaperList papers={countryDetails.papers} onNodeSelect={onNodeSelect} />
        </div>
      )}
    </div>
  );
}
