/**
 * Test script to explore table info API endpoint
 *
 * Usage: npx tsx scripts/test-table-info.ts
 */

import { BGAClient } from '../src/lib/bga-client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

async function testTableInfo() {
  const username = process.env.BGA_USERNAME;
  const password = process.env.BGA_PASSWORD;

  if (!username || !password) {
    console.error('❌ Error: BGA_USERNAME and BGA_PASSWORD must be set in .env file');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('🧪 Testing Table Info API');
  console.log('='.repeat(60));
  console.log('');

  const client = new BGAClient();

  try {
    // Initialize and login
    console.log('📡 Initializing and logging in...');
    await client.initialize();
    await client.login(username, password);
    console.log('✅ Logged in\n');

    // Fetch a recent game to get table ID
    console.log('📋 Fetching recent game...');
    const playerId = parseInt(client.getSession().userId!);
    const gamesResponse = await client.getPlayerFinishedGames(playerId, 1495, 1);

    const gameTableInfo = gamesResponse.data.tables[0];
    console.log(`✅ Selected game: ${gameTableInfo.table_id}`);
    console.log(`   Players: ${gameTableInfo.player_names}`);
    console.log(`   Scores: ${gameTableInfo.scores}`);
    console.log('');

    // Fetch table info
    console.log(`🎯 Fetching table info for game ${gameTableInfo.table_id}...`);
    const tableInfo = await client.getTableInfo(gameTableInfo.table_id);
    console.log('✅ Table info fetched\n');

    // Display the structure
    console.log('='.repeat(60));
    console.log('📊 Table Info Response Structure');
    console.log('='.repeat(60));
    console.log('');

    console.log('Full Response:');
    console.log(JSON.stringify(tableInfo, null, 2));
    console.log('');

    // Save to file for inspection
    const outputPath = './scripts/test-table-info-output.json';
    fs.writeFileSync(outputPath, JSON.stringify(tableInfo, null, 2));
    console.log(`💾 Full response saved to: ${outputPath}`);
    console.log('');

    // Try to identify player ELO data
    console.log('🔍 Looking for player ELO data...');
    console.log('');

    if (tableInfo.data) {
      console.log('Available data fields:');
      Object.keys(tableInfo.data).forEach(key => {
        console.log(`  - ${key}: ${typeof tableInfo.data[key]}`);
      });
      console.log('');

      if (tableInfo.data.player) {
        console.log('Player data structure:');
        console.log(JSON.stringify(tableInfo.data.player, null, 2));
      }

      if (tableInfo.data.players) {
        console.log('Players data structure:');
        console.log(JSON.stringify(tableInfo.data.players, null, 2));
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Test completed successfully!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

testTableInfo();
