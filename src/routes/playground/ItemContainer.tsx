import { createFileRoute } from '@tanstack/react-router';
import BusCard from '~/components/BusCard';
import { useSearchRoutesQuery } from '~/hooks/useSearchRoutesQuery';
import { useSearchStore } from '~/stores/searchStore';

export const Route = createFileRoute('/playground/ItemContainer')({
  component: ItemContainer,
});

export function ItemContainer() {
  const debouncedSearchTerm = useSearchStore(
    (state) => state.debouncedSearchTerms.routes,
  );
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

      {routes?.map((route) => <BusCard key={route.id} route={route} />)}
    </div>
  );
}
