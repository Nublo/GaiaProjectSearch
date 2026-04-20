import { BGAClient } from '../src/lib/bga-client';
import { GameCollector } from '../src/lib/game-collector';
import { ensureVpnConnected } from './vpn-helper';
import * as dotenv from 'dotenv';

dotenv.config();

async function collectTop10() {
  const username = process.env.BGA_USERNAME;
  const password = process.env.BGA_PASSWORD;

  if (!username || !password) {
    console.error('❌ Error: BGA_USERNAME and BGA_PASSWORD must be set in .env file');
    process.exit(1);
  }

  console.log('='.repeat(70));
  console.log('🎮 BGA Gaia Project - Top 10 Players Collection');
  console.log('='.repeat(70));

  await ensureVpnConnected();

  const client = new BGAClient();

  try {
    // Initialize and login
    console.log('\n📡 Initializing BGA client...');
    await client.initialize();
    await client.login(username, password);
    console.log('✅ Logged in successfully');

    // Fetch top 10 players
    console.log('\n🏆 Fetching top 10 players by ELO...');
    const ranking = await client.getRanking(1495, 0, 'elo');

    // Extract player list
    const topPlayers = ranking.data.ranks.slice(0, 10).map((p) => ({
      id: parseInt(p.id),
      name: p.name,
    }));

    console.log('✅ Found top 10 players:');
    topPlayers.forEach((p, i) => console.log(`   ${i + 1}. ${p.name} (ID: ${p.id})`));

    // Collect games for all top players
    console.log('\n🎯 Starting collection for all players...\n');
    const collector = new GameCollector(client, {
      rateLimit: 1500, // 1.5 seconds between requests
    });

    const results = await collector.collectMultiplePlayers(topPlayers);

    // Display summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 Collection Summary');
    console.log('='.repeat(70));

    let totalNew = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    const wasRateLimited = results.some((s) => s.rateLimited);

    results.forEach((stats) => {
      console.log(`\n👤 ${stats.playerName} (ID: ${stats.playerId})`);
      console.log(`   Total games found: ${stats.totalGames}`);
      console.log(`   New games stored: ${stats.newGames}`);
      console.log(`   Already existed: ${stats.skippedGames}`);
      console.log(`   Failed: ${stats.failedGames}`);
      if (stats.rateLimited) console.log(`   🛑 Rate limited`);

      totalNew += stats.newGames;
      totalSkipped += stats.skippedGames;
      totalFailed += stats.failedGames;

      if (stats.errors.length > 0) {
        console.log(`   Errors:`);
        stats.errors.forEach((err) => {
          console.log(`     - Game ${err.tableId}: ${err.error}`);
        });
      }
    });

    const skippedPlayers = topPlayers.length - results.length;

    console.log('\n' + '='.repeat(70));
    console.log(wasRateLimited ? `⏸️  Collection paused (rate limited)` : `✅ Collection Complete!`);
    console.log(`   Total new games: ${totalNew}`);
    console.log(`   Total skipped: ${totalSkipped}`);
    console.log(`   Total failed: ${totalFailed}`);
    if (skippedPlayers > 0) {
      console.log(`   Players not attempted: ${skippedPlayers}`);
    }
    if (wasRateLimited) {
      console.log(`\n   Run again later to continue collecting.`);
    }
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Collection failed:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await client.close();
  }
}

collectTop10();
