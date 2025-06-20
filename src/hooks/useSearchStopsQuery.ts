import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { searchStopsQuery } from "~/lib/queries/stops";

/**
 * Thin wrapper around `useQuery` that enforces some sensible defaults so that
 * we do not hammer the backend with fuzzy-stop requests.
 *
 * 1. Only start searching once the user has typed a minimum number of
 *    characters (`MIN_LEN`). This alone cuts the number of queries
 *    dramatically because many one-or two-letter permutations are avoided.
 * 2. Cache the results aggressively on the client so that navigating back and
 *    forth (or re-focusing the window) does not trigger another network
 *    request for an already-seen term.
 */

const MIN_LEN = 3; // characters

export const useSearchStopsQuery = (
  searchSlug: string,
  options?: Partial<UseQueryOptions<any, any, any, any>> & {
    enabled?: boolean;
  },
) => {
  // Only enable the query if the search term meets the minimum length AND the
  // caller hasn't explicitly disabled it.
  const enabled =
    (searchSlug?.trim().length ?? 0) >= MIN_LEN && (options?.enabled ?? true);

  return useQuery({
    // Base query (queryKey & queryFn)
    ...searchStopsQuery(searchSlug),

    // Client-side caching defaults – callers can still override them via the
    // `options` argument.
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour in cache before garbage-collected
    refetchOnWindowFocus: false,

    // Merge in any caller-provided options (so they can override the defaults
    // if they really need to).
    ...options,
    enabled,
  });
};
