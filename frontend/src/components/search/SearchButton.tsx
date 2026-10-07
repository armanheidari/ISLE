import { SEARCH_LABELS } from '@/constants/search';

interface SearchButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export const SearchButton = ({ onClick, disabled, isLoading }: SearchButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      {isLoading ? SEARCH_LABELS.SEARCHING : SEARCH_LABELS.SEARCH}
    </button>
  );
};
