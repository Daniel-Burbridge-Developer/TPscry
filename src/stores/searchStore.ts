import { create } from 'zustand';

// Define the shape of your search terms object
interface SearchTerms {
  routes: string;
  // Add other search types here in the future, e.g.,
  // trips: string;
  // stops: string;
}

// Define the state and actions for the store
interface SearchStoreState {
  searchTerms: SearchTerms;
  setSearchTerm: (type: keyof SearchTerms, term: string) => void;
}

export const useSearchStore = create<SearchStoreState>((set) => ({
  // Initial state
  searchTerms: {
    routes: '',
  },

  // Action to update a specific search term
  setSearchTerm: (type, term) =>
    set((state) => ({
      searchTerms: {
        ...state.searchTerms,
        [type]: term,
      },
    })),
}));

// TODO
// REVIEW SEARCHSTORE, FETCHING SEARCH BAR, SEARCHING,
// ITEM CONTAINER, MAKE SURE YOU UNDERSTAND HOW EVERYTHING WORKS
// ZUSTAND, TANSTACK QUERY

// NEXT MAKE THE CARD PRETTY, IMPLEMENT STOP SEARCH AS WELL.
