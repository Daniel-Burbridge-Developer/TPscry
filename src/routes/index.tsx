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

import { Card, CardContent } from "~/components/ui/card";
import * as React from "react";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-800 to-blue-900 py-8 sm:py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6">
        <div className="flex w-full flex-col items-center justify-center gap-6">
          <Heading />
          <SearchBar />
          <SearchResults />
        </div>
        <div className="flex w-full flex-row items-center justify-center gap-6">
          <RecentSearches />
          <Favouites />
        </div>
      </div>
    </div>
  );
}

interface BackdropCardProps extends React.HTMLAttributes<HTMLDivElement> {
  contentClassName?: string;
}

const BackdropCard = React.forwardRef<HTMLDivElement, BackdropCardProps>(
  ({ className, contentClassName, children, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-transparent bg-white/70 shadow-lg backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl dark:bg-white/10",
        className,
      )}
      {...props}
    >
      {/* Subtle animated gradient highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <CardContent
        className={cn(
          "relative flex flex-col items-stretch p-4 sm:p-6",
          contentClassName,
        )}
      >
        {children}
      </CardContent>
    </Card>
  ),
);
BackdropCard.displayName = "BackdropCard";

const Heading = () => {
  return (
    <BackdropCard className="flex w-full flex-col items-center justify-center gap-2 align-middle">
      <h1 className="text-center text-4xl font-extrabold tracking-tight text-blue-800 drop-shadow-sm">
        TP SCRY
      </h1>
      <p className="text-center text-lg text-gray-700">
        Tracking <span className="font-semibold text-blue-700">Transperth</span>{" "}
        in real-time
      </p>
    </BackdropCard>
  );
};

const SearchBar = () => {
  return (
    <BackdropCard className="w-full" contentClassName="p-0">
      <RouteAndStopSearchBar />
    </BackdropCard>
  );
};

const SearchResults = () => {
  return (
    <BackdropCard className="w-full" contentClassName="p-0">
      <div className="flex w-full flex-col items-center">
        <div className="flex w-full flex-col items-center">
          <h1 className="flex items-center justify-center gap-2">
            <Search className="h-6 w-6" />
            Search Results
          </h1>
        </div>
        <div className="flex w-full flex-col items-center">
          <h1 className="flex items-center justify-center gap-2">
            <RouteIcon className="h-6 w-6" />
            Routes
          </h1>
          <Collapsible className="w-full">
            {/* Routes Section */}
            <CollapsibleTrigger>
              <div className="flex w-full items-center justify-center gap-2">
                <ChevronDown className="h-6 w-6" />
                <span>Routes</span>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <RoutesResults />
            </CollapsibleContent>

            {/* Stops Section */}
            <CollapsibleTrigger>
              <div className="flex w-full items-center justify-center gap-2">
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
    </BackdropCard>
  );
};

const RecentSearches = () => {
  const recentSearches = useSearchStore(
    (state) => state.recentSearchTerms.routes,
  );
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);

  return (
    <BackdropCard className="w-full" contentClassName="p-0">
      <div className="flex w-full flex-col items-center">
        <h1 className="flex items-center justify-center gap-2">
          <Clock className="h-6 w-6" />
          Recent Searches
        </h1>
        <div className="flex w-full justify-center">
          {recentSearches.length <= 0 ? (
            <p>No recent searches</p>
          ) : (
            <div className="flex w-fit flex-row-reverse flex-wrap justify-center gap-2">
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
    </BackdropCard>
  );
};

const Favouites = () => {
  return (
    <BackdropCard className="w-full" contentClassName="p-0">
      <div className="flex w-full flex-col items-center">
        <h1 className="flex items-center justify-center gap-2">
          <Heart className="h-6 w-6" />
          Favourites
        </h1>
      </div>
    </BackdropCard>
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
      <p className="px-4 text-center text-sm text-muted-foreground">
        Type a search term to find routes.
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="px-4 text-center text-sm text-muted-foreground">
        Loading routes…
      </p>
    );
  }

  if (isError || !routes || routes.length === 0) {
    return (
      <p className="px-4 text-center text-sm text-muted-foreground">
        No routes found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 justify-items-center gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
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
      <p className="px-4 text-center text-sm text-muted-foreground">
        Type a search term to find stops.
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="px-4 text-center text-sm text-muted-foreground">
        Loading stops…
      </p>
    );
  }

  if (isError || !stopsArray || stopsArray.length === 0) {
    return (
      <p className="px-4 text-center text-sm text-muted-foreground">
        No stops found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 justify-items-center gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
      {stopsArray.map((stop) => (
        <StopCard key={stop.id} stop={stop} />
      ))}
    </div>
  );
};
