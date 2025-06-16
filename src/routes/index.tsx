import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Heart,
  RouteIcon,
  Search,
} from "lucide-react";
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

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import * as React from "react";
import { cn } from "~/lib/utils";
import { useRouteStore } from "~/stores/routeStore";
import { routeByIdQuery } from "~/lib/queries/routes";
import { useQueries } from "@tanstack/react-query";
import { Route as RouteType } from "~/schemas/routeSchema";
import SearchResults from "~/components/search/SearchResults";

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
          <SearchResultsWrapper />
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

const SearchResultsWrapper = () => {
  return (
    <BackdropCard className="w-full" contentClassName="p-0">
      <SearchResults />
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
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          Recent Searches
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1 sm:space-y-2">
          {recentSearches.map((search, index) => (
            <div
              key={index}
              className="flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 sm:p-3"
            >
              <span className="text-sm">{search}</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          ))}
        </div>
      </CardContent>
    </BackdropCard>
  );
};

const Favouites = () => {
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
  const favorites = routeQueries
    .map((q) => q.data)
    .filter((r): r is RouteType => Boolean(r));
  return (
    <BackdropCard className="w-full" contentClassName="p-0">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
          Favorites
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1 sm:space-y-2">
          {favorites.map((favorite, index) => (
            <div
              key={index}
              className="flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 sm:p-3"
            >
              <span className="text-sm">
                {favorite.longName || favorite.shortName}
              </span>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 fill-current text-red-500" />
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
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
