import { SEARCH_CONSTANTS, SEARCH_PLACEHOLDERS } from '@/constants/search';

interface YearRangeFilterProps {
  value: [number, number] | undefined;
  onChange: (value: [number, number] | undefined) => void;
}

export const YearRangeFilter = ({ value, onChange }: YearRangeFilterProps) => {
  const handleStartYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = e.target.value ? parseInt(e.target.value) : undefined;
    const current = value;
    onChange(start !== undefined ? [start, current?.[1] || SEARCH_CONSTANTS.MAX_YEAR] : undefined);
  };

  const handleEndYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const end = e.target.value ? parseInt(e.target.value) : undefined;
    const current = value;
    onChange(end !== undefined ? [current?.[0] || SEARCH_CONSTANTS.MIN_YEAR, end] : undefined);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Year Range
      </label>
      <div className="flex space-x-2">
        <input
          type="number"
          placeholder={SEARCH_PLACEHOLDERS.YEAR_FROM}
          min={SEARCH_CONSTANTS.MIN_YEAR}
          max={SEARCH_CONSTANTS.MAX_YEAR}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
          onChange={handleStartYearChange}
          defaultValue={value?.[0] || ''}
        />
        <input
          type="number"
          placeholder={SEARCH_PLACEHOLDERS.YEAR_TO}
          min={SEARCH_CONSTANTS.MIN_YEAR}
          max={SEARCH_CONSTANTS.MAX_YEAR}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
          onChange={handleEndYearChange}
          defaultValue={value?.[1] || ''}
        />
      </div>
    </div>
  );
};
