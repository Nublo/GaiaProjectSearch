import { Prisma } from '@prisma/client';

/**
 * Building condition for filtering games by building actions.
 */
export interface BuildingCondition {
  raceId?: number;
  buildingId?: number;
  maxRound?: number; // 0-indexed: round 1 = 0, round 2 = 1, etc.
}

/**
 * Build a Prisma where condition for player filtering (race only).
 * For building queries, use generateBuildingSQL() with Prisma.$queryRaw
 *
 * @param condition - Building condition
 * @returns Prisma where input for Player model
 */
export function buildPlayerQuery(condition: BuildingCondition): Prisma.PlayerWhereInput {
  const where: Prisma.PlayerWhereInput = {};

  if (condition.raceId) {
    where.raceId = condition.raceId;
  }

  // Note: Building queries require raw SQL due to JSONB complexity
  // Use generateBuildingSQL() for complete building + round filtering

  return where;
}

/**
 * Generate raw SQL fragment for building searches.
 * Use this with Prisma.$queryRaw for complex building queries.
 *
 * Example usage:
 * ```typescript
 * const sql = generateBuildingSQL(6, 3); // Research Lab in round <= 3
 * const games = await prisma.$queryRaw`
 *   SELECT DISTINCT g.*
 *   FROM games g
 *   JOIN players p ON p.game_id = g.id
 *   WHERE p.race_id = 1 AND ${Prisma.raw(sql)}
 * `;
 * ```
 *
 * @param buildingId - Building ID (4-9)
 * @param maxRound - Maximum round number (1-6, will be converted to 0-indexed)
 * @returns SQL fragment string
 */
export function generateBuildingSQL(
  buildingId: number,
  maxRound: number
): string {
  // Convert 1-indexed round to 0-indexed for array position
  const maxRoundZeroIndexed = maxRound;

  return `
    EXISTS (
      SELECT 1
      FROM jsonb_array_elements(p.buildings_data->'buildings')
      WITH ORDINALITY AS round(buildings, round_num)
      WHERE round_num <= ${maxRoundZeroIndexed + 1}
        AND buildings ? '${buildingId}'
    )
  `;
}

/**
 * Build a complete where condition for game search with player filters.
 *
 * @param conditions - Array of OR conditions
 * @returns Prisma where input for Game model
 */
export function buildGameWhereCondition(
  conditions: {
    playerName?: string;
    raceId?: number;
    finalScoreMin?: number;
    playerEloMin?: number;
  }[]
): Prisma.GameWhereInput {
  if (conditions.length === 0) {
    return {};
  }

  if (conditions.length === 1) {
    const cond = conditions[0];
    return {
      players: {
        some: {
          ...(cond.playerName && { playerName: { contains: cond.playerName, mode: 'insensitive' } }),
          ...(cond.raceId && { raceId: cond.raceId }),
          ...(cond.finalScoreMin && { finalScore: { gte: cond.finalScoreMin } }),
          ...(cond.playerEloMin && { playerElo: { gte: cond.playerEloMin } })
        }
      }
    };
  }

  // Multiple conditions - use OR
  return {
    OR: conditions.map(cond => ({
      players: {
        some: {
          ...(cond.playerName && { playerName: { contains: cond.playerName, mode: 'insensitive' } }),
          ...(cond.raceId && { raceId: cond.raceId }),
          ...(cond.finalScoreMin && { finalScore: { gte: cond.finalScoreMin } }),
          ...(cond.playerEloMin && { playerElo: { gte: cond.playerEloMin } })
        }
      }
    }))
  };
}
