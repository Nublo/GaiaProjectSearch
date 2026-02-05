import { prisma } from './db';
import { ParsedGameData } from './game-parser';

/**
 * Store a parsed game and all its players in the database.
 *
 * @param parsedGame - The parsed game data from GameLogParser (includes normalized ELO data)
 * @returns The created game with all players
 */
export async function storeGame(parsedGame: ParsedGameData) {
  // Create game and players in a transaction
  const game = await prisma.game.create({
    data: {
      tableId: parseInt(parsedGame.tableId),
      gameId: parsedGame.gameId.toString(),
      gameName: parsedGame.gameName,
      playerCount: parsedGame.playerCount,
      winnerName: parsedGame.winnerName,
      minPlayerElo: parsedGame.minPlayerElo,
      rawGameLog: parsedGame as any,

      players: {
        create: parsedGame.players.map((player) => {
          return {
            playerId: player.playerId,
            playerName: player.playerName,
            raceId: player.raceId,
            raceName: player.raceName,
            finalScore: player.finalScore,
            playerElo: player.playerElo,
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
 * @param tableId - BGA table ID (unique game instance identifier)
 * @returns True if game exists, false otherwise
 */
export async function gameExists(tableId: number): Promise<boolean> {
  const game = await prisma.game.findUnique({
    where: { tableId }
  });
  return game !== null;
}

/**
 * Get a game and all its players from the database.
 *
 * @param tableId - BGA table ID (unique game instance identifier)
 * @returns The game with all players, or null if not found
 */
export async function getGame(tableId: number) {
  return await prisma.game.findUnique({
    where: { tableId },
    include: { players: true }
  });
}
