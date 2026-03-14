/**
 * Backfill final_scorings for existing games by re-parsing rawGameLog.
 *
 * Reads notifyScore events from the stored raw log and maps their `desc`
 * fields to FinalScoringType IDs. Only processes games where finalScorings
 * is currently empty.
 *
 * Usage: npx tsx scripts/backfill-final-scorings.ts
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { FINAL_SCORING_DESC_TO_ID } from '../src/lib/gaia-constants';

dotenv.config();

const prisma = new PrismaClient();

function extractFinalScorings(rawGameLog: any): number[] {
  try {
    const logs = rawGameLog?.rawLog?.data?.logs ?? [];
    const descs = new Set<string>();

    for (const packet of logs) {
      for (const event of packet.data ?? []) {
        if (event.type === 'notifyScore') {
          const desc = event.args?.desc;
          if (desc && FINAL_SCORING_DESC_TO_ID[desc] !== undefined) {
            descs.add(desc);
          }
        }
      }
    }

    return Array.from(descs)
      .map((d) => FINAL_SCORING_DESC_TO_ID[d])
      .filter((id): id is number => id !== undefined)
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Backfill: final_scorings');
  console.log('='.repeat(60));

  const BATCH_SIZE = 10;

  // Find tableIds where finalScorings is NULL or empty (existing rows from before the migration)
  const staleIds = await prisma.$queryRaw<{ table_id: number }[]>`
    SELECT table_id FROM games WHERE final_scorings IS NULL OR final_scorings = '{}'
  `;
  // table_id is returned as BigInt from $queryRaw — convert to number for Prisma ORM
  const tableIds = staleIds.map((r) => Number(r.table_id));

  console.log(`\nFound ${tableIds.length} game(s) with empty finalScorings.\n`);

  if (tableIds.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < tableIds.length; i += BATCH_SIZE) {
    const batchIds = tableIds.slice(i, i + BATCH_SIZE);

    const games = await prisma.game.findMany({
      where: { tableId: { in: batchIds } },
      select: { tableId: true, rawGameLog: true },
    });

    for (const game of games) {
      const finalScorings = extractFinalScorings(game.rawGameLog);

      if (finalScorings.length === 0) {
        skipped++;
        continue;
      }

      await prisma.game.update({
        where: { tableId: game.tableId },
        data: { finalScorings },
      });
      updated++;
    }

    const done = Math.min(i + BATCH_SIZE, tableIds.length);
    console.log(`  ${done}/${tableIds.length} processed (updated: ${updated}, skipped: ${skipped})`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (no notifyScore events found): ${skipped}`);
  console.log('='.repeat(60));
}

main()
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
