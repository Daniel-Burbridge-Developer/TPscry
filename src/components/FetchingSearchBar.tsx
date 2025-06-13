import { Input } from './ui/input';
import { useDebounce } from '~/hooks/useDebounce';
import { useSearchRoutesQuery } from '~/hooks/useSearchRoutesQuery';
import { useSearchStore } from '~/stores/searchStore';

export function FetchingSearchBar() {
  const searchTerm = useSearchStore((state) => state.searchTerms.routes);
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data: routes, isLoading } = useSearchRoutesQuery(
    debouncedSearchTerm,
    {
      enabled: Boolean(debouncedSearchTerm),
    },
  );

  return (
    <div className="w-full max-w-md">
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm('routes', e.target.value)}
        placeholder="Search..."
      />
      {debouncedSearchTerm && (
        <p className="mt-2 text-sm text-gray-500">
          Searching for: {debouncedSearchTerm}
        </p>
      )}
      {isLoading && <p className="mt-2 text-sm text-gray-500">Loading...</p>}
      {routes && (
        <div className="mt-2">
          <p className="text-sm text-gray-500">Found {routes.length} routes:</p>
          <ul className="list-disc pl-5">
            {routes.map((route) => (
              <li key={route.id}>{route.shortName || route.longName}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
