import React from 'react';

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
      <p className="text-sm text-red-700">{error}</p>
    </div>
  );
}
