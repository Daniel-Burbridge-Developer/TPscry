import { Input } from './ui/input';
import { useSearchRoutesQuery } from '~/hooks/useSearchRoutesQuery';
import { useSearchStore } from '~/stores/searchStore';

export function FetchingSearchBar() {
  const searchTerm = useSearchStore((state) => state.searchTerms.routes);
  const debouncedSearchTerm = useSearchStore(
    (state) => state.debouncedSearchTerms.routes,
  );
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);
  const recentSearches = useSearchStore(
    (state) => state.recentSearchTerms.routes,
  );

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

      {recentSearches.length > 0 && (
        <div className=" m-2">
          <p className="text-xs text-muted-foreground mb-1">Recent searches</p>
          <div className="flex flex-wrap flex-row-reverse gap-2 w-fit">
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                className="px-2 py-1 rounded bg-gray-100 text-sm hover:bg-gray-200 transition-colors"
                onClick={() => setSearchTerm('routes', term)}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
