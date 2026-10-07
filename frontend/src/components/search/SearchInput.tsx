import { Search } from 'lucide-react';
import { SEARCH_CONSTANTS, SEARCH_PLACEHOLDERS } from '@/constants/search';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled: boolean;
}

export const SearchInput = ({ value, onChange, onKeyPress, disabled }: SearchInputProps) => {
  return (
    <div className="flex-1 relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder={SEARCH_PLACEHOLDERS.QUERY}
        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 placeholder-gray-500 bg-white"
        disabled={disabled}
      />
    </div>
  );
};
