/**
 * Test script to verify game storage in database
 *
 * Usage: npx tsx scripts/test-storage.ts
 */

import { BGAClient } from '../src/lib/bga-client';
import { GameLogParser } from '../src/lib/game-parser';
import { storeGame, gameExists, getGame } from '../src/lib/game-storage';
import * as dotenv from 'dotenv';

dotenv.config();

async function testStorage() {
  const username = process.env.BGA_USERNAME;
  const password = process.env.BGA_PASSWORD;

  if (!username || !password) {
    console.error('❌ Error: BGA_USERNAME and BGA_PASSWORD must be set in .env file');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('🧪 Testing Game Storage');
  console.log('='.repeat(60));
  console.log('');

  const client = new BGAClient();

  try {
    // Initialize and login
    console.log('📡 Initializing and logging in...');
    await client.initialize();
    await client.login(username, password);
    console.log('✅ Logged in\n');

    // Fetch a recent game
    console.log('📋 Fetching recent game...');
    const playerId = parseInt(client.getSession().userId!);
    const gamesResponse = await client.getPlayerFinishedGames(playerId, 1495, 1);

    const gameTableInfo = gamesResponse.data.tables[0];
    console.log(`✅ Selected game: ${gameTableInfo.table_id}`);
    console.log(`   Players: ${gameTableInfo.player_names}`);
    console.log(`   Scores: ${gameTableInfo.scores}`);
    console.log(`   ELO after: ${gameTableInfo.elo_after}`);
    console.log('');

    // Check if game already exists
    const gameId = parseInt(gameTableInfo.table_id);
    const exists = await gameExists(gameId);

    if (exists) {
      console.log(`⚠️  Game ${gameId} already exists in database`);
      console.log('   Retrieving existing game...\n');

      const existingGame = await getGame(gameId);
      if (existingGame) {
        console.log('📊 Existing Game Data:');
        console.log(`   Game ID: ${existingGame.gameId}`);
        console.log(`   Winner: ${existingGame.winnerName}`);
        console.log(`   Player Count: ${existingGame.playerCount}`);
        console.log(`   Min Player ELO: ${existingGame.minPlayerElo}`);
        console.log('');

        console.log('👥 Players:');
        existingGame.players.forEach((player, index) => {
          console.log(
            `${index + 1}. ${player.playerName} - ${player.raceName} (${player.finalScore} pts)${
              player.isWinner ? ' 🏆' : ''
            }`
          );
          console.log(`   ELO: ${player.playerElo || 'N/A'}`);
        });
        console.log('');
      }

      console.log('✅ Test completed (used existing game)');
      return;
    }

    // Fetch table info for ELO ratings
    console.log(`🎯 Fetching table info for ELO ratings...`);
    const tableInfo = await client.getTableInfo(gameTableInfo.table_id);
    console.log('✅ Table info fetched\n');

    // Display player ELO data
    console.log('📊 Player ELO Ratings (Raw → Normalized):');
    tableInfo.data.result.player.forEach((player) => {
      const rawElo = parseFloat(player.rank_after_game);
      const normalizedElo = Math.round(rawElo - 1300); // BGA ELO offset
      const eloChange = player.point_win;
      console.log(`   ${player.name}: ${rawElo} → ${normalizedElo} (${eloChange > 0 ? '+' : ''}${eloChange})`);
    });
    console.log('');

    // Fetch the game log
    console.log(`🎯 Fetching game log...`);
    const logResponse = await client.getGameLog(gameTableInfo.table_id);
    console.log(`✅ Fetched ${logResponse.data.logs.length} log packets\n`);

    // Parse the game log
    console.log('⚙️  Parsing game log...');
    const parsedGame = GameLogParser.parseGameLog(gameTableInfo, logResponse, tableInfo);
    console.log('✅ Parsing completed\n');

    // Store in database
    console.log('💾 Storing game in database...');
    const storedGame = await storeGame(parsedGame);
    console.log('✅ Game stored successfully\n');

    // Display stored data
    console.log('='.repeat(60));
    console.log('📊 Stored Game Data');
    console.log('='.repeat(60));
    console.log('');

    console.log(`Database ID: ${storedGame.id}`);
    console.log(`Game ID: ${storedGame.gameId}`);
    console.log(`Game Name: ${storedGame.gameName}`);
    console.log(`Player Count: ${storedGame.playerCount}`);
    console.log(`Winner: ${storedGame.winnerName}`);
    console.log(`Min Player ELO: ${storedGame.minPlayerElo}`);
    console.log('');

    console.log('👥 Players:');
    storedGame.players.forEach((player, index) => {
      console.log(
        `${index + 1}. ${player.playerName} - ${player.raceName} (Race ${player.raceId})${
          player.isWinner ? ' 🏆' : ''
        }`
      );
      console.log(`   Score: ${player.finalScore} points`);
      console.log(`   ELO: ${player.playerElo || 'N/A'}`);
      console.log(`   Player ID: ${player.playerId}`);

      // Show building data structure
      const buildingsData = player.buildingsData as { buildings: number[][] };
      const totalBuildings = buildingsData.buildings.reduce((sum, round) => sum + round.length, 0);
      console.log(`   Buildings: ${totalBuildings} total across ${buildingsData.buildings.length} rounds`);
    });
    console.log('');

    // Verify retrieval
    console.log('🔍 Verifying retrieval...');
    const retrievedGame = await getGame(storedGame.gameId);
    if (retrievedGame) {
      console.log(
        `✅ Successfully retrieved game ${retrievedGame.gameId} with ${retrievedGame.players.length} players`
      );
    } else {
      console.log('❌ Failed to retrieve stored game');
    }
    console.log('');

    console.log('='.repeat(60));
    console.log('✅ Storage test completed successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('💡 Next steps:');
    console.log('   - Run `npm run db:studio` to view the data in Prisma Studio');
    console.log('   - Check that both games and players tables have data');
    console.log('   - Verify indexes are working correctly');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

testStorage();
