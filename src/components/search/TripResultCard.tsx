import { Trip } from "~/schemas/tripSchema";

interface TripResultCardProps {
  trip: Trip;
  // this should be a callback to update the total live trips
  isLive: (tripId: string) => boolean;
}

const TripResultCard = ({ trip, isLive }: TripResultCardProps) => {
  return (
    <div className="flex items-center justify-between rounded-lg p-2 dark:bg-gray-900">
      <span className="font-medium">{trip.id}</span>
    </div>
  );
};

export default TripResultCard;
