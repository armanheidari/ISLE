import React from 'react';
import { Info } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="text-center py-8">
      <Info className="h-12 w-12 text-gray-300 mx-auto mb-2" />
      <p className="text-gray-500">Click on a node to view its details</p>
    </div>
  );
}
