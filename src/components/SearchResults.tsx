import GameCard from './GameCard';
import type { Game } from '@/types/game';

interface SearchResultsProps {
  games: Game[];
  total: number;
  isLoading?: boolean;
}

export default function SearchResults({ games, total, isLoading = false }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-600">
          <div className="animate-pulse">Searching games...</div>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-600 bg-white rounded-lg shadow-md p-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No games found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Found {total} game{total !== 1 ? 's' : ''}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
