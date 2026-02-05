import { prisma } from './db';
import { ParsedGameData } from './game-parser';
import { GameTableInfo } from './bga-types';

/**
 * Store a parsed game and all its players in the database.
 *
 * @param parsedGame - The parsed game data from GameLogParser
 * @param gameTableInfo - The game table info from BGA API (contains ELO data)
 * @returns The created game with all players
 */
export async function storeGame(
  parsedGame: ParsedGameData,
  gameTableInfo: GameTableInfo
) {
  // Parse BGA data
  const eloValues = gameTableInfo.elo_after.split(',').map(Number);
  const playerIds = gameTableInfo.players.split(',').map(Number);

  // Find minimum ELO among all players
  const validElos = eloValues.filter(elo => elo > 0);
  const minPlayerElo = validElos.length > 0 ? Math.min(...validElos) : null;

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
          // Find corresponding ELO for this player
          const playerIndex = playerIds.indexOf(player.playerId);
          const playerElo = playerIndex >= 0 ? eloValues[playerIndex] : null;

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
