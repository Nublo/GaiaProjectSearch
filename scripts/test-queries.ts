/**
 * Test script to verify search queries work correctly
 *
 * Usage: npx tsx scripts/test-queries.ts
 */

import { prisma } from '../src/lib/db';

async function testQueries() {
  console.log('='.repeat(60));
  console.log('🔍 Testing Search Queries');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Test 1: Get all games
    console.log('Test 1: Get all games');
    const allGames = await prisma.game.findMany({
      include: { players: true }
    });
    console.log(`✅ Found ${allGames.length} games\n`);

    if (allGames.length === 0) {
      console.log('⚠️  No games in database. Run `npx tsx scripts/test-storage.ts` first.\n');
      return;
    }

    // Test 2: Search by player name
    console.log('Test 2: Search games where any player named "AlabeSons"');
    const playerNameGames = await prisma.game.findMany({
      where: {
        players: {
          some: {
            playerName: { contains: 'AlabeSons', mode: 'insensitive' }
          }
        }
      },
      include: { players: true }
    });
    console.log(`✅ Found ${playerNameGames.length} games`);
    playerNameGames.forEach(game => {
      const player = game.players.find(p => p.playerName.toLowerCase().includes('alabesons'));
      console.log(`   - Game ${game.gameId}: ${player?.playerName} played ${player?.raceName}`);
    });
    console.log('');

    // Test 3: Search by race
    console.log('Test 3: Search games where any player played Bal T\'aks (race 10)');
    const raceGames = await prisma.game.findMany({
      where: {
        players: {
          some: {
            raceId: 10  // Bal T'aks
          }
        }
      },
      include: { players: true }
    });
    console.log(`✅ Found ${raceGames.length} games`);
    raceGames.forEach(game => {
      const player = game.players.find(p => p.raceId === 10);
      console.log(`   - Game ${game.gameId}: ${player?.playerName} (${player?.finalScore} pts)`);
    });
    console.log('');

    // Test 4: Search by score threshold
    console.log('Test 4: Search games where any player scored >= 200 points');
    const scoreGames = await prisma.game.findMany({
      where: {
        players: {
          some: {
            finalScore: { gte: 200 }
          }
        }
      },
      include: { players: true }
    });
    console.log(`✅ Found ${scoreGames.length} games`);
    scoreGames.forEach(game => {
      const player = game.players.find(p => p.finalScore >= 200);
      console.log(
        `   - Game ${game.gameId}: ${player?.playerName} scored ${player?.finalScore} pts with ${player?.raceName}`
      );
    });
    console.log('');

    // Test 5: Search by winner
    console.log('Test 5: Search games won by Bal T\'aks players');
    const winnerGames = await prisma.game.findMany({
      where: {
        players: {
          some: {
            isWinner: true,
            raceId: 10
          }
        }
      },
      include: { players: true }
    });
    console.log(`✅ Found ${winnerGames.length} games`);
    winnerGames.forEach(game => {
      const winner = game.players.find(p => p.isWinner);
      console.log(
        `   - Game ${game.gameId}: ${winner?.playerName} won with ${winner?.raceName} (${winner?.finalScore} pts)`
      );
    });
    console.log('');

    // Test 6: Search by minimum player ELO
    console.log('Test 6: Search games where minimum player ELO >= 1800');
    const eloGames = await prisma.game.findMany({
      where: {
        minPlayerElo: { gte: 1800 }
      },
      include: { players: true }
    });
    console.log(`✅ Found ${eloGames.length} games`);
    eloGames.forEach(game => {
      console.log(`   - Game ${game.gameId}: Min ELO = ${game.minPlayerElo}`);
    });
    console.log('');

    // Test 7: Complex query - race + score
    console.log('Test 7: Search games where any player played Gleens (4) with score >= 150');
    const complexGames = await prisma.game.findMany({
      where: {
        players: {
          some: {
            raceId: 4,  // Gleens
            finalScore: { gte: 150 }
          }
        }
      },
      include: { players: true }
    });
    console.log(`✅ Found ${complexGames.length} games`);
    complexGames.forEach(game => {
      const player = game.players.find(p => p.raceId === 4 && p.finalScore >= 150);
      console.log(
        `   - Game ${game.gameId}: ${player?.playerName} - ${player?.raceName} (${player?.finalScore} pts)`
      );
    });
    console.log('');

    // Test 8: Multiple OR conditions
    console.log('Test 8: Search games where player is AlabeSons OR felipetoito');
    const orGames = await prisma.game.findMany({
      where: {
        OR: [
          { players: { some: { playerName: { contains: 'AlabeSons', mode: 'insensitive' } } } },
          { players: { some: { playerName: { contains: 'felipetoito', mode: 'insensitive' } } } }
        ]
      },
      include: { players: true }
    });
    console.log(`✅ Found ${orGames.length} games\n`);

    // Test 9: Verify indexes
    console.log('Test 9: Verify database indexes');
    const indexes = await prisma.$queryRaw<
      Array<{ indexname: string; indexdef: string }>
    >`SELECT indexname, indexdef FROM pg_indexes WHERE tablename IN ('games', 'players') ORDER BY tablename, indexname`;

    const gamesIndexes = indexes.filter(i => i.indexname.startsWith('games_'));
    const playersIndexes = indexes.filter(i => i.indexname.startsWith('players_'));

    console.log(`   Games indexes: ${gamesIndexes.length}`);
    gamesIndexes.forEach(idx => {
      console.log(`     - ${idx.indexname}`);
    });

    console.log(`   Players indexes: ${playersIndexes.length}`);
    playersIndexes.forEach(idx => {
      console.log(`     - ${idx.indexname}`);
    });

    // Check for GIN index
    const ginIndex = indexes.find(i => i.indexdef.includes('USING gin'));
    if (ginIndex) {
      console.log(`\n   ✅ GIN index found: ${ginIndex.indexname}`);
    } else {
      console.log('\n   ❌ GIN index not found');
    }
    console.log('');

    console.log('='.repeat(60));
    console.log('✅ All query tests completed successfully!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

testQueries();
