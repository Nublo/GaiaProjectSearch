import Link from 'next/link';
import type { Game } from '@/types/game';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const formattedDate = new Date(game.gameDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-1">
            Game #{game.gameId}
          </h3>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">{game.finalScore}</div>
          <div className="text-xs text-gray-500">points</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Player:</span>
          <span className="text-sm text-gray-900">{game.playerName}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Race:</span>
          <span className="inline-block px-2 py-1 text-sm bg-purple-100 text-purple-800 rounded">
            {game.playerRace}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Rounds:</span> {game.roundCount}
          </div>
          <div>
            <span className="font-medium">Players:</span> {game.playerCount}
          </div>
        </div>
      </div>

      {game.buildingsData && game.buildingsData.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Early Structures:</p>
          <div className="flex flex-wrap gap-1">
            {game.buildingsData.slice(0, 3).map((building, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded"
              >
                R{building.round}: {building.structure}
              </span>
            ))}
            {game.buildingsData.length > 3 && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                +{game.buildingsData.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <Link
        href={`/games/${game.id}`}
        className="block w-full text-center bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
      >
        View Details
      </Link>
    </div>
  );
}
