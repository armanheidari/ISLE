import React from 'react';
import { SelectedNode, NodeType } from '@/types/sidePanel';
import { createNodeFromString, handleKeyDown } from '@/utils/sidePanel';

interface ClickableTagProps {
  label: string;
  type: NodeType;
  className?: string;
  onNodeSelect?: (node: SelectedNode | null) => void;
}

export function ClickableTag({ 
  label, 
  type, 
  className = '', 
  onNodeSelect 
}: ClickableTagProps) {
  const handleClick = () => {
    onNodeSelect?.(createNodeFromString(type, label));
  };

  const getTagStyle = (type: NodeType) => {
    const baseStyle = {
      fontSize: '0.75rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      marginRight: '0.25rem',
      marginBottom: '0.25rem',
      cursor: 'pointer',
      display: 'inline-block'
    };

    const typeStyles: Record<NodeType, { backgroundColor: string; color: string; borderColor: string }> = {
      author: { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#dcfce7' },
      institution: { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fee2e2' },
      country: { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#dbeafe' },
      keyword: { backgroundColor: '#fce7f3', color: '#be185d', borderColor: '#fce7f3' },
      paper: { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#dbeafe' },
      topic: { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#f3f4f6' }
    };

    return { ...baseStyle, ...typeStyles[type] };
  };

  const tagStyle = getTagStyle(type);

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => handleKeyDown(e, handleClick)}
      className={`hover:underline hover:decoration-2 hover:underline-offset-2 transition-all duration-200 ${className}`}
      style={tagStyle}
    >
      {label}
    </span>
  );
}
