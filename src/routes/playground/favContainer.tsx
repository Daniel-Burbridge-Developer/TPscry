import { createFileRoute } from '@tanstack/react-router';
import BusCard from '~/components/BusCard';
import { useRouteStore } from '~/stores/routeStore';
import { useQueries } from '@tanstack/react-query';
import { routeByIdQuery } from '~/lib/queries/routes';
import { Route as RouteType } from '~/schemas/routeSchema';

export const Route = createFileRoute('/playground/favContainer')({
  component: FavContainer,
});

export function FavContainer() {
  // Get favourite route IDs from the store
  const favouriteRouteIds = useRouteStore((state) => state.favouriteRouteIds);

  // Fetch details for each favourite route in parallel
  const routeQueries = useQueries({
    queries: favouriteRouteIds.map((id) => ({
      ...routeByIdQuery(id),
      enabled: favouriteRouteIds.length > 0,
    })),
  });

  const isLoading = routeQueries.some((q) => q.isLoading);
  const routes = routeQueries
    .map((q) => q.data)
    .filter((r): r is RouteType => Boolean(r));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {isLoading && (
        <div className="col-span-full text-center">
          <p className="text-gray-500">Loading favourite routes...</p>
        </div>
      )}

      {routes.length === 0 && !isLoading && (
        <div className="col-span-full text-center">
          <p className="text-gray-500">No favourite routes added yet.</p>
        </div>
      )}

      {routes.map((route) => (
        <BusCard key={route.id} route={route} />
      ))}
    </div>
  );
}
