import { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { useDebounce } from '~/hooks/useDebounce';

export function FetchingSearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // This effect will only run when the debounced value changes
  // (i.e., after the user stops typing for 300ms)
  useEffect(() => {
    if (debouncedSearchTerm) {
      // Here you would typically make an API call or filter data
      console.log('Searching for:', debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <div className="w-full max-w-md">
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      {debouncedSearchTerm && (
        <p className="mt-2 text-sm text-gray-500">
          Searching for: {debouncedSearchTerm}
        </p>
      )}
    </div>
  );
}
