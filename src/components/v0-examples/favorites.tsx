'use client';

import { Heart, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FavoritesProps {
  favorites: string[];
  onFavoriteSelect: (favorite: string) => void;
}

/**
 * Favorites Component
 *
 * TODO for your implementation:
 * - Connect to your Zustand store for favorites management
 * - Add favorites persistence (localStorage or database)
 * - Add remove from favorites functionality
 * - Implement different favorite types (routes, stops, route-stop combinations)
 * - Add favorites organization/categorization
 */
export function Favorites({ favorites, onFavoriteSelect }: FavoritesProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
          Favorites
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1 sm:space-y-2">
          {favorites.map((favorite, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
              onClick={() => onFavoriteSelect(favorite)}
            >
              <span className="text-sm">{favorite}</span>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
