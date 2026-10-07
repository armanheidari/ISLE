import React from 'react';
import { PaperDetails as PaperDetailsType, SelectedNode } from '@/types/sidePanel';
import { InlineChunkedList } from './InlineChunkedList';
import { ClickableTag } from './ClickableTag';
import { FieldLabel } from './FieldLabel';
import { SectionHeader } from './SectionHeader';
import { CHUNK_SIZE } from '@/constants/sidePanel';

interface PaperDetailsProps {
  paperDetails: PaperDetailsType;
  onNodeSelect?: (node: SelectedNode | null) => void;
}

export function PaperDetails({ paperDetails, onNodeSelect }: PaperDetailsProps) {
  return (
    <div className="space-y-4">
      <SectionHeader>Paper Information</SectionHeader>
      
      <div>
        <FieldLabel>Title</FieldLabel>
        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded mt-1 leading-relaxed">
          {paperDetails.title}
        </p>
        
        {paperDetails.abstaction && (
          <div className="mt-2">
            <FieldLabel>Abstract</FieldLabel>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded mt-1 leading-relaxed">
              {paperDetails.abstaction}
            </p>
          </div>
        )}
      </div>

      <div>
        <FieldLabel>Citation Count</FieldLabel>
        <p className="text-sm font-semibold text-blue-600 mt-1">
          {paperDetails.citation_count}
        </p>
      </div>

      {paperDetails.authors && paperDetails.authors.length > 0 && (
        <div>
          <FieldLabel>Authors</FieldLabel>
          <div className="mt-1 space-y-1">
            <InlineChunkedList
              items={paperDetails.authors}
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

      {paperDetails.institutions && paperDetails.institutions.length > 0 && (
        <div>
          <FieldLabel>Institution</FieldLabel>
          <div className="mt-1 space-y-1">
            <InlineChunkedList
              items={paperDetails.institutions}
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

      {paperDetails.countries && paperDetails.countries.length > 0 && (
        <div>
          <FieldLabel>Country</FieldLabel>
          <div className="mt-1 space-y-1">
            <InlineChunkedList
              items={paperDetails.countries}
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

      <div>
        <FieldLabel>Publication Year</FieldLabel>
        <p className="text-sm font-semibold text-gray-900 mt-1">
          {paperDetails.publication_year || 'Unknown'}
        </p>
      </div>
    </div>
  );
}
