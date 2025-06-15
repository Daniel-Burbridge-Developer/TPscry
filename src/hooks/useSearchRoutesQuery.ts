import { useQuery } from "@tanstack/react-query";
import { searchRoutesQuery } from "~/lib/queries/routes";

export const useSearchRoutesQuery = (
  searchSlug: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    ...searchRoutesQuery(searchSlug),
    ...options,
  });
};
