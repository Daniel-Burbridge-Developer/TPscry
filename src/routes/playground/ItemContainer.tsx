import { createFileRoute } from '@tanstack/react-router';
import { useSearchRoutesQuery } from '~/hooks/useSearchRoutesQuery';
import { useDebounce } from '~/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';

const searchTermQueryKey = ['globalSearchTerm'];

export const Route = createFileRoute('/playground/ItemContainer')({
  component: ItemContainer,
});

export function ItemContainer() {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {isLoading && (
        <div className="col-span-full text-center">
          <p className="text-gray-500">Loading routes...</p>
        </div>
      )}

      {routes?.map((route) => (
        <div
          key={route.id}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {route.shortName || 'N/A'}
            </h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {route.longName || 'No description'}
            </span>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-600">Route ID: {route.id}</p>
          </div>
        </div>
      ))}

      {!isLoading && debouncedSearchTerm && routes?.length === 0 && (
        <div className="col-span-full text-center">
          <p className="text-gray-500">No routes found</p>
        </div>
      )}
    </div>
  );
}
