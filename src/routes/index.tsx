import { createFileRoute } from '@tanstack/react-router';
import { ChevronDown, Clock, Heart, RouteIcon, Search } from 'lucide-react';
import { FetchingSearchBar } from '~/components/FetchingSearchBar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import { useSearchStore } from '~/stores/searchStore';
import { useSearchRoutesQuery } from '~/hooks/useSearchRoutesQuery';
import { useSearchStopsQuery } from '~/hooks/useSearchStopsQuery';
import BusCard from '~/components/BusCard';
import StopCard from '~/components/StopCard';
import type { Stop } from '~/schemas/stopSchema';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Heading />
      <SearchBar />
      <SearchResults />
      <RecentSearches />
      <Favouites />
    </div>
  );
}

const Heading = () => {
  return (
    <div>
      <h1>TP SCRY</h1>
      <p>Tracking Transperth in real-time</p>
    </div>
  );
};

const SearchBar = () => {
  return <FetchingSearchBar />;
};

const SearchResults = () => {
  return (
    <div>
      <div>
        <h1 className="flex items-center gap-2">
          <Search className="w-6 h-6" />
          Search Results
        </h1>
      </div>
      <div>
        <h1 className="flex items-center gap-2">
          <RouteIcon className="w-6 h-6" />
          Routes
        </h1>
        <Collapsible>
          {/* Routes Section */}
          <CollapsibleTrigger>
            <div className="flex items-center gap-2">
              <ChevronDown className="w-6 h-6" />
              <span>Routes</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <RoutesResults />
          </CollapsibleContent>

          {/* Stops Section */}
          <CollapsibleTrigger>
            <div className="flex items-center gap-2">
              <ChevronDown className="w-6 h-6" />
              <span>Stops</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <StopsResults />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

const RecentSearches = () => {
  const recentSearches = useSearchStore(
    (state) => state.recentSearchTerms.routes,
  );
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);

  return (
    <div>
      <h1 className="flex items-center gap-2">
        <Clock className="w-6 h-6" />
        Recent Searches
      </h1>
      <div>
        {recentSearches.length <= 0 ? (
          <p>No recent searches</p>
        ) : (
          <div className="flex flex-wrap flex-row-reverse gap-2 w-fit">
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                className="px-2 py-1 rounded bg-gray-100 text-sm hover:bg-gray-200 transition-colors"
                onClick={() => {
                  setSearchTerm('routes', term);
                  setSearchTerm('stops', term);
                }}
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Favouites = () => {
  return (
    <div>
      <h1 className="flex items-center gap-2">
        <Heart className="w-6 h-6" />
        Favourites
      </h1>
    </div>
  );
};

// New component to render Route search results
const RoutesResults = () => {
  const debouncedSearchTerm = useSearchStore(
    (state) => state.debouncedSearchTerms.routes,
  );

  const {
    data: routes,
    isLoading,
    isError,
  } = useSearchRoutesQuery(debouncedSearchTerm, {
    enabled: Boolean(debouncedSearchTerm),
  });

  if (!debouncedSearchTerm) {
    return (
      <p className="text-sm text-muted-foreground px-4">
        Type a search term to find routes.
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground px-4">Loading routes…</p>
    );
  }

  if (isError || !routes || routes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground px-4">No routes found.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {routes.map((route) => (
        <BusCard key={route.id} route={route} />
      ))}
    </div>
  );
};

// New component to render Stop search results
const StopsResults = () => {
  const debouncedSearchTerm = useSearchStore(
    (state) => state.debouncedSearchTerms.stops,
  );

  const {
    data: stops,
    isLoading,
    isError,
  } = useSearchStopsQuery(debouncedSearchTerm, {
    enabled: Boolean(debouncedSearchTerm),
  });

  const stopsArray = stops as Stop[] | undefined;

  if (!debouncedSearchTerm) {
    return (
      <p className="text-sm text-muted-foreground px-4">
        Type a search term to find stops.
      </p>
    );
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground px-4">Loading stops…</p>;
  }

  if (isError || !stopsArray || stopsArray.length === 0) {
    return (
      <p className="text-sm text-muted-foreground px-4">No stops found.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {stopsArray.map((stop) => (
        <StopCard key={stop.id} stop={stop} />
      ))}
    </div>
  );
};
