import { Input } from './ui/input';
import { useDebounce } from '~/hooks/useDebounce';
import { useSearchRoutesQuery } from '~/hooks/useSearchRoutesQuery';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const searchTermQueryKey = ['globalSearchTerm'];

export function FetchingSearchBar() {
  const queryClient = useQueryClient();
  const { data: searchTerm } = useQuery({
    queryKey: searchTermQueryKey,
    queryFn: () => '', // This query does not fetch, it's for client state
    initialData: '',
    staleTime: Infinity,
    gcTime: Infinity,
  });

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
        onChange={(e) =>
          queryClient.setQueryData(searchTermQueryKey, e.target.value)
        }
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
