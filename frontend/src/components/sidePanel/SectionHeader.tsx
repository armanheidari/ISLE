import React from 'react';

interface SectionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeader({ 
  children, 
  className = 'text-md font-semibold text-gray-800 border-b pb-2' 
}: SectionHeaderProps) {
  return (
    <h5 className={className}>
      {children}
    </h5>
  );
}
