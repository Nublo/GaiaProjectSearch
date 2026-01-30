// Game-related TypeScript types

export interface Game {
  id: string;
  gameId: string;
  playerRace: string;
  finalScore: number;
  playerName: string;
  gameDate: Date;
  roundCount: number;
  playerCount: number;
  buildingsData?: BuildingAction[];
  createdAt: Date;
  winnerRace?: string;
  winnerPlayerName?: string;
  playerElo?: number;
}

export interface BuildingAction {
  round: number;
  structure: string;
  location?: string;
}

export interface SearchCriteria {
  race?: string;
  playerName?: string;
  structure?: string;
  maxRound?: number;
  playerCount?: number;
  winnerRace?: string;
  winnerPlayerName?: string;
  minPlayerElo?: number;
}

export interface SearchResults {
  games: Game[];
  total: number;
  page: number;
  pageSize: number;
}
