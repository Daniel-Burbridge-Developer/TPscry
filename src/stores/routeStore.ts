import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RouteStoreState {
  favouriteRouteIds: string[];
  addFavouriteRouteId: (routeId: string) => void;
  removeFavouriteRouteId: (routeId: string) => void;
  clearFavourites: () => void;
}

export const useRouteStore = create<RouteStoreState>()(
  persist(
    (set) => ({
      favouriteRouteIds: [],
      addFavouriteRouteId: (routeId) =>
        set((state) => ({
          favouriteRouteIds: state.favouriteRouteIds.includes(routeId)
            ? state.favouriteRouteIds
            : [...state.favouriteRouteIds, routeId],
        })),
      removeFavouriteRouteId: (routeId) =>
        set((state) => ({
          favouriteRouteIds: state.favouriteRouteIds.filter(
            (id) => id !== routeId,
          ),
        })),
      clearFavourites: () =>
        set({
          favouriteRouteIds: [],
        }),
    }),
    {
      name: 'route-store', // name of the item in storage
      partialize: (state) => ({ favouriteRouteIds: state.favouriteRouteIds }),
    },
  ),
);
