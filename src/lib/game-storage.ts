import { prisma } from './db';
import { ParsedGameData } from './game-parser';
import { GetTableInfoResponse } from './bga-types';

/**
 * BGA ELO offset - BGA's ELO system was redesigned and now displays ratings
 * with 1300 subtracted from the raw stored value. We normalize to match
 * what users see in the BGA interface.
 */
const BGA_ELO_OFFSET = 1300;

/**
 * Store a parsed game and all its players in the database.
 *
 * @param parsedGame - The parsed game data from GameLogParser
 * @param tableInfo - The table info response from BGA API (contains ELO data for all players)
 * @returns The created game with all players
 */
export async function storeGame(
  parsedGame: ParsedGameData,
  tableInfo: GetTableInfoResponse
) {
  // Extract player ELO data from table info
  const playerEloMap = new Map<number, number>();

  tableInfo.data.result.player.forEach((playerResult) => {
    const playerId = parseInt(playerResult.player_id);
    const rawElo = parseFloat(playerResult.rank_after_game);
    if (!isNaN(rawElo)) {
      // Normalize ELO by subtracting BGA offset (1300)
      // This matches what users see in BGA interface
      const normalizedElo = Math.round(rawElo - BGA_ELO_OFFSET);
      playerEloMap.set(playerId, normalizedElo);
    }
  });

  // Find minimum ELO among all players
  const allElos = Array.from(playerEloMap.values());
  const minPlayerElo = allElos.length > 0 ? Math.min(...allElos) : null;

  // Create game and players in a transaction
  const game = await prisma.game.create({
    data: {
      gameId: parseInt(parsedGame.tableId),
      gameName: parsedGame.gameName,
      playerCount: parsedGame.playerCount,
      winnerName: parsedGame.winnerName,
      minPlayerElo: minPlayerElo,
      rawGameLog: parsedGame as any,

      players: {
        create: parsedGame.players.map((player) => {
          // Get ELO for this player from the map
          const playerElo = playerEloMap.get(player.playerId) || null;

          return {
            playerId: player.playerId,
            playerName: player.playerName,
            raceId: player.raceId,
            raceName: player.raceName,
            finalScore: player.finalScore,
            playerElo: playerElo,
            isWinner: player.playerName === parsedGame.winnerName,
            buildingsData: {
              buildings: player.buildings
            }
          };
        })
      }
    },
    include: {
      players: true
    }
  });

  return game;
}

/**
 * Check if a game already exists in the database.
 *
 * @param gameId - BGA game table ID
 * @returns True if game exists, false otherwise
 */
export async function gameExists(gameId: number): Promise<boolean> {
  const game = await prisma.game.findUnique({
    where: { gameId }
  });
  return game !== null;
}

/**
 * Get a game and all its players from the database.
 *
 * @param gameId - BGA game table ID
 * @returns The game with all players, or null if not found
 */
export async function getGame(gameId: number) {
  return await prisma.game.findUnique({
    where: { gameId },
    include: { players: true }
  });
}
