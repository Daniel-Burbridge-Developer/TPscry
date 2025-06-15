import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Clock, Heart, RouteIcon, Search } from "lucide-react";
import { RouteAndStopSearchBar } from "~/components/search/RouteAndStopSearchBar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { useSearchStore } from "~/stores/searchStore";
import { useSearchRoutesQuery } from "~/hooks/useSearchRoutesQuery";
import { useSearchStopsQuery } from "~/hooks/useSearchStopsQuery";
import BusCard from "~/components/BusCard";
import StopCard from "~/components/StopCard";
import type { Stop } from "~/schemas/stopSchema";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-800 to-blue-900 py-8 sm:py-12">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-xl bg-white/90 px-4 py-8 shadow-lg sm:gap-6 sm:px-8 sm:py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-800 drop-shadow-sm sm:text-4xl">
          TP SCRY
        </h1>
        <p className="mb-2 text-center text-base text-gray-700 sm:text-lg">
          Tracking{" "}
          <span className="font-semibold text-blue-700">Transperth</span> in
          real-time
        </p>
        <div className="mx-auto w-full">
          <RouteAndStopSearchBar />
        </div>
      </div>
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
  return (
    <div className="w-full">
      <RouteAndStopSearchBar />
    </div>
  );
};

const SearchResults = () => {
  return (
    <div>
      <div>
        <h1 className="flex items-center gap-2">
          <Search className="h-6 w-6" />
          Search Results
        </h1>
      </div>
      <div>
        <h1 className="flex items-center gap-2">
          <RouteIcon className="h-6 w-6" />
          Routes
        </h1>
        <Collapsible>
          {/* Routes Section */}
          <CollapsibleTrigger>
            <div className="flex items-center gap-2">
              <ChevronDown className="h-6 w-6" />
              <span>Routes</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <RoutesResults />
          </CollapsibleContent>

          {/* Stops Section */}
          <CollapsibleTrigger>
            <div className="flex items-center gap-2">
              <ChevronDown className="h-6 w-6" />
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
        <Clock className="h-6 w-6" />
        Recent Searches
      </h1>
      <div>
        {recentSearches.length <= 0 ? (
          <p>No recent searches</p>
        ) : (
          <div className="flex w-fit flex-row-reverse flex-wrap gap-2">
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                className="rounded bg-gray-100 px-2 py-1 text-sm transition-colors hover:bg-gray-200"
                onClick={() => {
                  setSearchTerm("routes", term);
                  setSearchTerm("stops", term);
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
        <Heart className="h-6 w-6" />
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
      <p className="px-4 text-sm text-muted-foreground">
        Type a search term to find routes.
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="px-4 text-sm text-muted-foreground">Loading routes…</p>
    );
  }

  if (isError || !routes || routes.length === 0) {
    return (
      <p className="px-4 text-sm text-muted-foreground">No routes found.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
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
      <p className="px-4 text-sm text-muted-foreground">
        Type a search term to find stops.
      </p>
    );
  }

  if (isLoading) {
    return <p className="px-4 text-sm text-muted-foreground">Loading stops…</p>;
  }

  if (isError || !stopsArray || stopsArray.length === 0) {
    return (
      <p className="px-4 text-sm text-muted-foreground">No stops found.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
      {stopsArray.map((stop) => (
        <StopCard key={stop.id} stop={stop} />
      ))}
    </div>
  );
};
