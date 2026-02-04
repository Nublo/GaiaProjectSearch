/**
 * Test script to check pagination for game fetching
 */

import { BGAClient } from '../src/lib/bga-client';
import * as dotenv from 'dotenv';

dotenv.config();

async function testPagination() {
  const username = process.env.BGA_USERNAME;
  const password = process.env.BGA_PASSWORD;

  if (!username || !password) {
    console.error('❌ Error: BGA_USERNAME and BGA_PASSWORD must be set');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('🧪 Testing BGA Pagination');
  console.log('='.repeat(60));
  console.log('');

  const client = new BGAClient();

  try {
    await client.initialize();
    await client.login(username, password);

    const playerId = parseInt(client.getSession().userId!);
    const gameId = 1495; // Gaia Project

    // Fetch first page (default)
    console.log('📄 Fetching page 1...');
    const page1 = await client.getPlayerFinishedGames(playerId, gameId, 1);

    console.log(`✅ Page 1: ${page1.data.tables.length} games`);
    console.log(`   First game table_id: ${page1.data.tables[0].table_id}`);
    console.log(`   Last game table_id: ${page1.data.tables[page1.data.tables.length - 1].table_id}`);
    console.log('');

    // Fetch second page
    console.log('📄 Fetching page 2...');
    const page2 = await client.getPlayerFinishedGames(playerId, gameId, 2);

    console.log(`✅ Page 2: ${page2.data.tables.length} games`);
    console.log(`   First game table_id: ${page2.data.tables[0].table_id}`);
    console.log(`   Last game table_id: ${page2.data.tables[page2.data.tables.length - 1].table_id}`);
    console.log('');

    // Check if different from page 1
    const isDifferent = page1.data.tables[0].table_id !== page2.data.tables[0].table_id;
    console.log(`   Pages are different? ${isDifferent ? '✅ YES' : '❌ NO'}`);
    console.log('');

    // Fetch third page
    console.log('📄 Fetching page 3...');
    const page3 = await client.getPlayerFinishedGames(playerId, gameId, 3);

    console.log(`✅ Page 3: ${page3.data.tables.length} games`);
    console.log(`   First game table_id: ${page3.data.tables[0].table_id}`);
    console.log('');

    // Estimate total games from page 1 data
    // Note: We'd need updateStats=1 to get exact count, but we can estimate
    console.log('📊 Pagination info:');
    const totalGames = 'unknown (need updateStats=1 for exact count)';

    console.log('='.repeat(60));
    console.log(`📊 Total games available: ${totalGames}`);
    if (typeof totalGames === 'number') {
      console.log(`   Pages needed (10 per page): ${Math.ceil(totalGames / 10)}`);
    }
    console.log('='.repeat(60));
    console.log('');
    console.log('✅ Pagination test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testPagination();
