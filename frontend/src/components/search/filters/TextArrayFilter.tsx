import { SEARCH_PLACEHOLDERS } from '@/constants/search';

interface TextArrayFilterProps {
  label: string;
  placeholder: string;
  value: string[] | undefined;
  onChange: (value: string[] | undefined) => void;
}

export const TextArrayFilter = ({ label, placeholder, value, onChange }: TextArrayFilterProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue) {
      const arrayValue = inputValue.split(',').map(s => s.trim()).filter(s => s.length > 0);
      onChange(arrayValue.length > 0 ? arrayValue : undefined);
    } else {
      onChange(undefined);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
        onChange={handleChange}
        defaultValue={value?.join(', ') || ''}
      />
    </div>
  );
};
