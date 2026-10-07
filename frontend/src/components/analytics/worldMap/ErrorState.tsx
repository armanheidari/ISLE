import React from 'react';
import { Globe } from 'lucide-react';

interface ErrorStateProps {
  title: string;
  message: string;
  showRefreshButton?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  showRefreshButton = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center text-gray-500">
        <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p>{message}</p>
        {showRefreshButton && (
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </button>
        )}
      </div>
    </div>
  );
};
