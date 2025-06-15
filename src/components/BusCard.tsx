import { Route } from '~/schemas/routeSchema';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useRouteTripsQuery } from '~/hooks/useRouteTripsQuery';
import TripCard from './TripCard';
import FavouriteToggle from './FavouriteToggle';

interface BusCardProps {
  route: Route;
}

const BusCard = ({ route }: BusCardProps) => {
  const { data: trips } = useRouteTripsQuery(route.id, {
    enabled: Boolean(route.id),
  });

  const routeName = route.shortName || route.longName || 'Unknown Route';

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{routeName}</span>
          <span className="flex items-center ml-2 space-x-2">
            <span className="text-xs text-muted-foreground">{route.id}</span>
            <FavouriteToggle routeId={route.id} className="ml-1" />
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trips && trips.length > 0 ? (
          <ul className="space-y-2">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} routeName={routeName} />
            ))}
          </ul>
        ) : (
          <span className="text-sm text-muted-foreground">
            No trips found for this route.
          </span>
        )}
      </CardContent>
    </Card>
  );
};

export default BusCard;
