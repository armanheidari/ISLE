import React from 'react';
import { ExternalLink } from 'lucide-react';
import { SelectedNode, NodeType } from '@/types/sidePanel';
import { NODE_TYPE_CONFIGS } from '@/constants/sidePanel';
import { formatConnectionCount, openWebSearch } from '@/utils/sidePanel';

interface NodeHeaderProps {
  selectedNode: SelectedNode;
}

export function NodeHeader({ selectedNode }: NodeHeaderProps) {
  const nodeConfig = NODE_TYPE_CONFIGS[selectedNode.type as NodeType] || NODE_TYPE_CONFIGS.topic;
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${nodeConfig.bgColor} ${nodeConfig.color}`}>
          {nodeConfig.label}
        </span>
        <span className="text-sm text-gray-500">
          {formatConnectionCount(selectedNode.degree)}
        </span>
      </div>
      
      <h4 className="text-lg font-medium text-gray-900 leading-tight flex items-center gap-2">
        <button
          aria-label={`Search ${selectedNode.label} on the web`}
          onClick={() => openWebSearch(selectedNode.label, selectedNode.type)}
          className="text-left hover:underline focus:outline-none"
        >
          {selectedNode.label}
        </button>
        <ExternalLink className="h-4 w-4 text-gray-400" />
      </h4>
    </div>
  );
}
