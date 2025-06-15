import { Stop } from '~/schemas/stopSchema';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Star, MapPin } from 'lucide-react';
import { useStopStore } from '~/stores/stopStore';
import { cn } from '~/lib/utils';
import type { MouseEvent } from 'react';

interface StopCardProps {
  stop: Stop;
}

const StopCard = ({ stop }: StopCardProps) => {
  const favouriteStopIds = useStopStore((s) => s.favouriteStopIds);
  const addFavouriteStopId = useStopStore((s) => s.addFavouriteStopId);
  const removeFavouriteStopId = useStopStore((s) => s.removeFavouriteStopId);

  const stopIdStr = String(stop.id);
  const isFavourited = favouriteStopIds.includes(stopIdStr);

  const toggleFavourite = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (isFavourited) {
      removeFavouriteStopId(stopIdStr);
    } else {
      addFavouriteStopId(stopIdStr);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{stop.name}</span>
          <span className="flex items-center ml-2 space-x-2">
            <span className="text-xs text-muted-foreground">{stop.id}</span>
            <button
              type="button"
              aria-label={
                isFavourited ? 'Remove from favourites' : 'Add to favourites'
              }
              onClick={toggleFavourite}
              className={cn('transition-colors')}
              tabIndex={0}
            >
              <Star
                size={18}
                className={`transition-colors ${isFavourited ? 'fill-yellow-400 text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`}
                fill={isFavourited ? '#facc15' : 'none'}
                strokeWidth={1.5}
              />
            </button>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground space-y-1">
          {stop.supportedModes && stop.supportedModes.length > 0 && (
            <span>Supported: {stop.supportedModes.join(', ')}</span>
          )}
          <span className="inline-flex items-center gap-1 text-xs">
            <MapPin className="w-3 h-3" /> {stop.lat}, {stop.lon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StopCard;
