import { Input } from './ui/input';
import { useSearchRoutesQuery } from '~/hooks/useSearchRoutesQuery';
import { useSearchStore } from '~/stores/searchStore';

export function FetchingSearchBar() {
  const searchTerm = useSearchStore((state) => state.searchTerms.routes);
  const debouncedSearchTerm = useSearchStore(
    (state) => state.debouncedSearchTerms.routes,
  );
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);

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
    </div>
  );
}
