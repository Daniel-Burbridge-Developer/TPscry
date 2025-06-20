import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StopStoreState {
  favouriteStopIds: string[];
  addFavouriteStopId: (stopId: string) => void;
  removeFavouriteStopId: (stopId: string) => void;
  clearFavourites: () => void;
}

export const useStopStore = create<StopStoreState>()(
  persist(
    (set) => ({
      favouriteStopIds: [],
      addFavouriteStopId: (stopId) =>
        set((state) => ({
          favouriteStopIds: state.favouriteStopIds.includes(stopId)
            ? state.favouriteStopIds
            : [...state.favouriteStopIds, stopId],
        })),
      removeFavouriteStopId: (stopId) =>
        set((state) => ({
          favouriteStopIds: state.favouriteStopIds.filter(
            (id) => id !== stopId,
          ),
        })),
      clearFavourites: () =>
        set({
          favouriteStopIds: [],
        }),
    }),
    {
      name: "route-store", // name of the item in storage
      partialize: (state) => ({ favouriteStopIds: state.favouriteStopIds }),
    },
  ),
);
