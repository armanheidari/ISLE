import React from 'react';
import { Paper, SelectedNode } from '@/types/sidePanel';
import { createPaperNode, handleKeyDown } from '@/utils/sidePanel';
import { MAX_PAPER_LIST_HEIGHT } from '@/constants/sidePanel';

interface PaperListProps {
  papers: Paper[];
  onNodeSelect?: (node: SelectedNode | null) => void;
  maxHeight?: string;
}

export function PaperList({ 
  papers, 
  onNodeSelect, 
  maxHeight = MAX_PAPER_LIST_HEIGHT 
}: PaperListProps) {
  if (!papers || papers.length === 0) return null;

  return (
    <div className="mt-1 space-y-2" style={{ maxHeight, overflowY: 'auto' }}>
      {papers.map((paper, index) => {
        const handleClick = () => onNodeSelect?.(createPaperNode(paper));
        
        return (
          <div
            key={index}
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(e) => handleKeyDown(e, handleClick)}
            className="bg-gray-50 p-2 rounded text-xs cursor-pointer hover:bg-gray-100"
          >
            <p className="font-medium text-gray-900">{paper.title}</p>
            <div className="flex justify-between mt-1 text-gray-500">
              <span>{paper.year || 'Unknown'}</span>
              <span>{paper.citations} citations</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
