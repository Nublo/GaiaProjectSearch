'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import SearchResults from '@/components/SearchResults';
import type { SearchCriteria, Game } from '@/types/game';

// Mock data for demonstration
const mockGames: Game[] = [
  {
    id: '1',
    gameId: 'BGA-12345',
    playerRace: 'Terrans',
    finalScore: 145,
    playerName: 'AlexGamer',
    gameDate: new Date('2025-01-15'),
    roundCount: 6,
    playerCount: 4,
    buildingsData: [
      { round: 1, structure: 'mine' },
      { round: 2, structure: 'trading-station' },
      { round: 3, structure: 'research-lab' },
    ],
    createdAt: new Date(),
    winnerRace: 'Gleens',
    winnerPlayerName: 'GaiaFan99',
    playerElo: 250,
  },
  {
    id: '2',
    gameId: 'BGA-12346',
    playerRace: 'Xenos',
    finalScore: 132,
    playerName: 'SpaceExplorer',
    gameDate: new Date('2025-01-20'),
    roundCount: 6,
    playerCount: 3,
    buildingsData: [
      { round: 1, structure: 'mine' },
      { round: 1, structure: 'mine' },
      { round: 4, structure: 'academy' },
    ],
    createdAt: new Date(),
    winnerRace: 'Xenos',
    winnerPlayerName: 'SpaceExplorer',
    playerElo: 180,
  },
  {
    id: '3',
    gameId: 'BGA-12347',
    playerRace: 'Gleens',
    finalScore: 158,
    playerName: 'GaiaFan99',
    gameDate: new Date('2025-01-25'),
    roundCount: 6,
    playerCount: 4,
    buildingsData: [
      { round: 2, structure: 'mine' },
      { round: 3, structure: 'trading-station' },
      { round: 5, structure: 'planetary-institute' },
    ],
    createdAt: new Date(),
    winnerRace: 'Gleens',
    winnerPlayerName: 'GaiaFan99',
    playerElo: 300,
  },
];

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (criteria: SearchCriteria) => {
    setIsLoading(true);
    setHasSearched(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Filter mock data based on criteria
    let filtered = mockGames;

    if (criteria.race) {
      filtered = filtered.filter((game) => game.playerRace === criteria.race);
    }

    if (criteria.playerName) {
      filtered = filtered.filter((game) =>
        game.playerName.toLowerCase().includes(criteria.playerName!.toLowerCase())
      );
    }

    if (criteria.structure) {
      filtered = filtered.filter((game) =>
        game.buildingsData?.some((building) => building.structure === criteria.structure)
      );
    }

    if (criteria.maxRound !== undefined && criteria.structure) {
      filtered = filtered.filter((game) =>
        game.buildingsData?.some(
          (building) =>
            building.structure === criteria.structure && building.round <= criteria.maxRound!
        )
      );
    }

    if (criteria.playerCount !== undefined) {
      filtered = filtered.filter((game) => game.playerCount === criteria.playerCount);
    }

    if (criteria.winnerRace) {
      filtered = filtered.filter((game) => game.winnerRace === criteria.winnerRace);
    }

    if (criteria.winnerPlayerName) {
      filtered = filtered.filter((game) =>
        game.winnerPlayerName?.toLowerCase().includes(criteria.winnerPlayerName!.toLowerCase())
      );
    }

    if (criteria.minPlayerElo !== undefined) {
      filtered = filtered.filter((game) => {
        if (!game.playerElo) return false;
        return game.playerElo >= criteria.minPlayerElo!;
      });
    }

    setGames(filtered);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Gaia Project Game Search
          </h1>
          <p className="text-gray-600">
            Search and analyze Board Game Arena Gaia Project games
          </p>
        </header>

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {hasSearched && (
          <div className="mt-8">
            <SearchResults games={games} total={games.length} isLoading={isLoading} />
          </div>
        )}

        {!hasSearched && (
          <div className="mt-8 text-center text-gray-500">
            <p>Enter search criteria above to find games</p>
          </div>
        )}
      </div>
    </div>
  );
}
