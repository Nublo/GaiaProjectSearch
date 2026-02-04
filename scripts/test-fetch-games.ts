/**
 * Test script to fetch games from BGA and analyze response structure
 *
 * Usage:
 * 1. Make sure you have BGA credentials in .env file
 * 2. Run: npx tsx scripts/test-fetch-games.ts
 */

import { BGAClient } from '../src/lib/bga-client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

async function testFetchGames() {
  const username = process.env.BGA_USERNAME;
  const password = process.env.BGA_PASSWORD;

  if (!username || !password) {
    console.error('❌ Error: BGA_USERNAME and BGA_PASSWORD must be set in .env file');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('🧪 Testing BGA Game Fetching');
  console.log('='.repeat(60));
  console.log('');

  const client = new BGAClient();

  try {
    // Step 1: Initialize
    console.log('📡 Step 1: Initializing BGA client...');
    await client.initialize();
    console.log('✅ Initialized\n');

    // Step 2: Login
    console.log('🔐 Step 2: Logging in...');
    await client.login(username, password);
    console.log('✅ Logged in\n');

    // Step 3: Fetch finished games for Gaia Project (game_id = 1495)
    console.log('🎮 Step 3: Fetching Gaia Project finished games...');
    const playerId = parseInt(client.getSession().userId!);
    const response = await client.getPlayerFinishedGames(playerId, 1495, 1);

    console.log('✅ Games fetched successfully\n');

    // Analyze response
    console.log('='.repeat(60));
    console.log('📊 Response Analysis');
    console.log('='.repeat(60));
    console.log('');

    // Save full response to file for inspection first
    const outputPath = './scripts/test-fetch-games-output.json';
    fs.writeFileSync(outputPath, JSON.stringify(response, null, 2));
    console.log(`✅ Full response saved to: ${outputPath}`);
    console.log('');

    console.log('Response Type:', typeof response);
    console.log('Response Keys:', Object.keys(response));
    console.log('');
    console.log('Response Status:', response.status);
    console.log('');

    // Check data structure
    if (response.data) {
      console.log('Data exists: YES');
      console.log('Data type:', typeof response.data);
      console.log('Data keys:', Object.keys(response.data));
      console.log('');

      // Check if tables exist
      if (response.data.tables) {
        console.log(`Number of tables returned: ${response.data.tables.length}`);
        console.log('');

        // Show first table structure
        if (response.data.tables.length > 0) {
          console.log('First table structure:');
          console.log('Keys:', Object.keys(response.data.tables[0]));
          console.log('');
          console.log('First table sample:');
          console.log(JSON.stringify(response.data.tables[0], null, 2));
          console.log('');
        }
      }

      // Check for pagination info
      console.log('Pagination info:');
      console.log('- total:', response.data.total);
      console.log('- hasMore:', response.data.hasMore);
      console.log('');
    } else {
      console.log('Data exists: NO');
      console.log('');
      console.log('Full response:');
      console.log(JSON.stringify(response, null, 2));
      console.log('');
    }

    console.log('='.repeat(60));
    console.log('✅ Test completed successfully!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testFetchGames();
