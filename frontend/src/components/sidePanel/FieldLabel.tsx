import React from 'react';

interface FieldLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function FieldLabel({ 
  children, 
  className = 'text-sm font-medium text-gray-500 uppercase tracking-wider' 
}: FieldLabelProps) {
  return (
    <label className={className}>
      {children}
    </label>
  );
}
