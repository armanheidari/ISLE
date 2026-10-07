import { SelectedNode, NodeType } from '@/types/sidePanel';

export const createNodeId = (type: NodeType, label: string): string => {
  return `${type}_${label}`;
};

export const createNodeFromString = (
  type: NodeType,
  label: string,
  degree: number = 0
): SelectedNode => ({
  id: createNodeId(type, label),
  label,
  degree,
  type,
  properties: {}
});

export const normalizePaperId = (paper: any): string => {
  return paper && paper.id ? `paper_${paper.id}` : `paper_${paper.title}`;
};

export const createPaperNode = (paper: any): SelectedNode => ({
  id: normalizePaperId(paper),
  label: paper.title,
  degree: paper.citations || 0,
  type: 'paper',
  properties: {}
});

export const handleKeyDown = (
  event: React.KeyboardEvent,
  callback: () => void
): void => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback();
  }
};

export const openWebSearch = (label: string, type: string): void => {
  const query = encodeURIComponent(`${label} ${type}`);
  const url = `https://www.google.com/search?q=${query}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const formatCitationCount = (count: number): string => {
  return `${count} citation${count !== 1 ? 's' : ''}`;
};

export const formatConnectionCount = (count: number): string => {
  return `${count} connection${count !== 1 ? 's' : ''}`;
};
