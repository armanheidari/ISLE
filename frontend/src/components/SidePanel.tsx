'use client';
import React from 'react';
import { X } from 'lucide-react';
import { SidePanelProps } from '@/types/sidePanel';
import { useNodeDetails } from '@/hooks/useNodeDetails';
import {
  NodeHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  PaperDetails,
  AuthorDetails,
  InstitutionDetails,
  CountryDetails,
  TopicDetails,
  ErrorBoundary
} from './sidePanel/index';

export default function SidePanel({
  isOpen,
  selectedNode,
  detailedNodeInfo,
  onClose,
  onNodeSelect,
}: SidePanelProps) {
  const { nodeDetails, isLoading, error, hasSelectedNode } = useNodeDetails({
    selectedNode,
    detailedNodeInfo,
  });

  if (!isOpen) return null;

  const renderNodeDetails = () => {
    if (!nodeDetails) return null;

    const { type, details } = nodeDetails;

    switch (type) {
      case 'paper':
        return <PaperDetails paperDetails={details} onNodeSelect={onNodeSelect} />;
      case 'author':
        return <AuthorDetails authorDetails={details} onNodeSelect={onNodeSelect} />;
      case 'institution':
        return <InstitutionDetails institutionDetails={details} onNodeSelect={onNodeSelect} />;
      case 'country':
        return <CountryDetails countryDetails={details} onNodeSelect={onNodeSelect} />;
      case 'topic':
        return <TopicDetails topicDetails={details} onNodeSelect={onNodeSelect} />;
      default:
        return null;
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white border-l border-gray-200 shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-900">Node Information</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      
      <div className="p-4">
          {hasSelectedNode ? (
          <div className="space-y-6">
              <NodeHeader selectedNode={selectedNode!} />

              {isLoading && <LoadingState />}
              {error && <ErrorState error={error} />}
              {!isLoading && !error && (
                <ErrorBoundary>
                  {renderNodeDetails()}
                </ErrorBoundary>
            )}
          </div>
        ) : (
            <EmptyState />
        )}
        </div>
      </div>
    </>
  );
}