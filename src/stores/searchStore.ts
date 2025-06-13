import { create } from 'zustand';

interface SearchTerms {
  routes: string;
}

interface DebouncedSearchTerms extends SearchTerms {}

const DEBOUNCE_MS = 300;

const debounceTimers: Partial<
  Record<keyof SearchTerms, ReturnType<typeof setTimeout>>
> = {};

interface SearchStoreState {
  searchTerms: SearchTerms;
  debouncedSearchTerms: DebouncedSearchTerms;
  setSearchTerm: (type: keyof SearchTerms, term: string) => void;
}

export const useSearchStore = create<SearchStoreState>((set, get) => ({
  searchTerms: {
    routes: '',
  },
  debouncedSearchTerms: {
    routes: '',
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
      set((state) => ({
        debouncedSearchTerms: {
          ...state.debouncedSearchTerms,
          [type]: term,
        },
      }));
    }, DEBOUNCE_MS);
  },
}));
