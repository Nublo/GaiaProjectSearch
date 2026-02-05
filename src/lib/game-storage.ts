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
      gameId: parseInt(parsedGame.tableId),
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
