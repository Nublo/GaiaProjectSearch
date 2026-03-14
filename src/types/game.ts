// Game-related TypeScript types

export interface GameResult {
  id: string;
  tableId: number;
  playerCount: number;
  winnerName: string;
  minPlayerElo?: number | null;
  finalScorings: number[];
  players: PlayerResult[];
}

export interface PlayerResult {
  id: string;
  playerId: number;
  playerName: string;
  raceId: number;
  raceName: string;
  finalScore: number;
  playerElo?: number | null;
  isWinner: boolean;
  buildingsData: { buildings: number[][] };
}

export interface SearchRequest {
  winnerRace?: string;
  winnerPlayerName?: string;
  minPlayerElo?: number;
  playerNames: string[];
  playerCounts: number[];
  structureConditions: StructureCondition[];
  finalScorings?: number[];
}

export interface StructureCondition {
  race?: string;
  structure?: string;
  maxRound?: number;
}

export interface SearchResponse {
  games: GameResult[];
  total: number;
}
