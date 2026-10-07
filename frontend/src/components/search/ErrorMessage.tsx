import { X } from 'lucide-react';
import { SEARCH_CONSTANTS, SEARCH_LABELS } from '@/constants/search';

interface ErrorMessageProps {
  error: string;
  onRetry: () => void;
  onDismiss: () => void;
}

export const ErrorMessage = ({ error, onRetry, onDismiss }: ErrorMessageProps) => {
  const isTimeoutError = error.includes('timeout') || error.includes('Network error');

  return (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="mb-2">{error}</p>
          {isTimeoutError && (
            <p className="text-sm text-red-600">
              {SEARCH_CONSTANTS.TIMEOUT_TIP}
            </p>
          )}
        </div>
        <button
          onClick={onRetry}
          className="ml-3 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          {SEARCH_LABELS.TRY_AGAIN}
        </button>
        <button
          onClick={onDismiss}
          className="ml-2 text-red-600 hover:text-red-800 transition-colors"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
