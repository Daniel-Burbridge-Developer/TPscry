import { create } from 'zustand';

interface SearchTerms {
  routes: string;
}

interface DebouncedSearchTerms extends SearchTerms {}

type RecentSearchTerms = Record<keyof SearchTerms, string[]>;

const DEBOUNCE_MS = 300;

const debounceTimers: Partial<
  Record<keyof SearchTerms, ReturnType<typeof setTimeout>>
> = {};

interface SearchStoreState {
  searchTerms: SearchTerms;
  debouncedSearchTerms: DebouncedSearchTerms;
  recentSearchTerms: RecentSearchTerms;
  setSearchTerm: (type: keyof SearchTerms, term: string) => void;
}

export const useSearchStore = create<SearchStoreState>((set, get) => ({
  searchTerms: {
    routes: '',
  },
  debouncedSearchTerms: {
    routes: '',
  },
  recentSearchTerms: {
    routes: [],
  },

  setSearchTerm: (type, term) => {
    set((state) => ({
      searchTerms: {
        ...state.searchTerms,
        [type]: term,
      },
    }));

    // Clear any existing timer for this type
    if (debounceTimers[type]) {
      clearTimeout(debounceTimers[type]!);
    }

    // Start a new debounce timer
    debounceTimers[type] = setTimeout(() => {
      // When the timer fires, update the debounced value
      set((state) => {
        // Update recent searches (unique, max 5)
        const existingRecents = state.recentSearchTerms[type] || [];
        const updatedRecents = term.trim()
          ? [term, ...existingRecents.filter((t) => t !== term)].slice(0, 5)
          : existingRecents;

        return {
          debouncedSearchTerms: {
            ...state.debouncedSearchTerms,
            [type]: term,
          },
          recentSearchTerms: {
            ...state.recentSearchTerms,
            [type]: updatedRecents,
          },
        };
      });
    }, DEBOUNCE_MS);
  },
}));
