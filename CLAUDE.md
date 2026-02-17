# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This project collects and parses game data for "Gaia Project" from Board Game Arena (BGA).

**Data Source**: BGA provides a public API that requires user authentication (login/password credentials provided by the user).

**Purpose**: To collect and parse Gaia Project game data from the BGA API for analysis and processing.

**End Goal**: Provide a public interface that allows users to search for specific games based on in-game actions and conditions.

Example search queries:
- "Find games where player was playing with a specific race, has final scoring points at least X, and built structure A in the first Y rounds"
- Search by race, scoring thresholds, building actions, round timing, and other game events

## Deployment Strategy

This is a web application designed with the following deployment requirements:

- **Local Development**: Should be hostable from a local computer for testing purposes from the start
- **Production Deployment**: Should be easily deployable and made accessible remotely (not limited to local-only access)
- The architecture should support both local testing and remote deployment scenarios

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Database**: PostgreSQL with JSONB for hybrid storage (raw JSON + preprocessed searchable fields)
- **ORM**: Prisma for type-safe database access
- **Frontend**: React with Tailwind CSS
- **Browser Automation**: Playwright (headless Chromium) for BGA API access
- **Containerization**: Docker for local PostgreSQL and production deployment

## Architecture

### Data Model
- **Two-Table Normalized Design**: Separates game-level and player-level data for efficient searching
- **Expected Scale**: 10k-100k games (20k-400k player records)
- **Games Table** (`games`): One row per game
  - `id` (String, CUID) - Primary key
  - `game_id` (Integer, unique, indexed) - BGA game table identifier
  - `game_name` (String) - Game name ("gaiaproject")
  - `player_count` (Integer, indexed) - Number of players (2-4)
  - `winner_name` (String, indexed) - Name of winning player
  - `min_player_elo` (Integer, indexed) - Minimum ELO among all players in game
  - `raw_game_log` (JSONB) - Complete parsed game data from parser
- **Players Table** (`players`): One row per player per game
  - `id` (String, CUID) - Primary key
  - `game_id` (String, FK to games.id) - Foreign key with CASCADE delete
  - `player_id` (Integer) - BGA player ID
  - `player_name` (String, indexed) - Player display name
  - `race_id` (Integer, indexed) - Race ID (1-14)
  - `race_name` (String, indexed) - Race name (Terrans, Lantids, etc.)
  - `final_score` (Integer, indexed) - Final score
  - `player_elo` (Integer, indexed) - Player's ELO after this game
  - `is_winner` (Boolean, indexed) - True if this player won
  - `buildings_data` (JSONB, GIN indexed) - Buildings by round: `{"buildings": [[4,5], [6], [7]]}`
  - Composite indexes: `(race_id, final_score)`, `(game_id, race_id)`, `(player_elo, final_score)`

### Database Performance & Scale
- **Expected storage**: ~1 GB for 100k games
  - Games table: ~100k × 1KB = 100MB
  - Players table: ~400k × 2KB = 800MB
  - Indexes: ~200-300MB
- **Query performance expectations**:
  - Player name/race/ELO searches: <1ms (B-tree indexes)
  - Building searches: 10-50ms (GIN index on JSONB)
  - Complex multi-condition queries: 50-200ms worst case
  - Most queries: <10ms
- **Index strategy**:
  - Single-column B-tree indexes for exact matches and range queries
  - Composite indexes for common query patterns
  - GIN index for JSONB building data searches
  - Foreign key index for game-player JOINs

### Data Flow
1. User authenticates with BGA credentials
2. API fetches game list using `getPlayerFinishedGames()`
3. For each game, fetch detailed log using `getGameLog()`
4. Parser extracts searchable fields and player data from JSON
5. Storage helper creates one game record + multiple player records in transaction
6. Search queries use "any player" pattern with indexed fields for fast results
7. Complex building queries use GIN index on JSONB buildings_data

## Project Structure

```
bga_gaia_parser/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx               # Home page — search form only
│   │   ├── results/
│   │   │   └── page.tsx           # Search results page (server-rendered, ?q= param)
│   │   ├── api/
│   │   │   ├── search/
│   │   │   │   └── route.ts       # POST /api/search — thin wrapper over searchGames()
│   │   │   └── players/
│   │   │       └── route.ts       # GET /api/players — distinct player names for autocomplete
│   │   ├── layout.tsx             # Root layout with metadata ("Gaia Project Search")
│   │   ├── favicon.ico            # Custom Gaia Project favicon
│   │   ├── icon.png               # 512×512 PNG icon for modern browsers
│   │   └── opengraph-image.png    # OG social sharing image
│   ├── components/
│   │   ├── SearchForm.tsx         # Search form with all filter types
│   │   ├── SearchResults.tsx      # Results list + active-filters summary
│   │   └── GameCard.tsx           # Single game card (all players, race badges, links)
│   ├── lib/
│   │   ├── search.ts             # searchGames() — shared search logic (Prisma + raw SQL)
│   │   ├── bga-client.ts         # BGA API client (Playwright-based)
│   │   ├── bga-types.ts          # BGA API TypeScript types
│   │   ├── game-collector.ts     # Automated game collection with rate limit handling
│   │   ├── game-parser.ts        # JSON parsing logic
│   │   ├── gaia-constants.ts     # Race/building/event type mappings
│   │   ├── game-storage.ts       # Database storage helpers
│   │   ├── building-query.ts     # Complex query helpers
│   │   └── db.ts                 # Prisma client singleton
│   └── types/
│       └── game.ts               # GameResult, PlayerResult, SearchRequest, etc.
├── scripts/
│   ├── collect-player.ts          # CLI: collect games for a specific player
│   └── collect-top10.ts           # CLI: collect games for top 10 ranked players
├── prisma/
│   └── schema.prisma              # Database schema
├── docker-compose.yml             # Local PostgreSQL setup
└── Dockerfile                     # Production container
```

## Development Commands

### Initial Setup
```bash
# Install dependencies
npm install

# Install Playwright Chromium browser
npx playwright install chromium

# Start local PostgreSQL database (Docker must be running)
docker-compose up -d

# Run database migrations
npm run db:migrate
# or: npx prisma migrate dev

# Generate Prisma client (usually happens automatically)
npm run db:generate
# or: npx prisma generate
```

### Development
```bash
# Start development server (http://localhost:3000)
npm run dev

# Open Prisma Studio (database UI in browser)
npm run db:studio
# or: npx prisma studio

# Run database migrations
npm run db:migrate
# or: npx prisma migrate dev

# Push schema changes without creating migration
npm run db:push
# or: npx prisma db push
```

### Building & Testing
```bash
# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### Docker & Database Management
```bash
# Start PostgreSQL container
docker-compose up -d

# Stop PostgreSQL container
docker-compose down

# Stop and remove volumes (deletes all data!)
docker-compose down -v

# View container logs
docker-compose logs -f postgres

# Check container status
docker-compose ps

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (warning: deletes all data)
npx prisma migrate reset

# Apply migrations to production
npx prisma migrate deploy
```

### NPM Scripts Reference
```bash
npm run dev           # Start Next.js dev server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript compiler check
npm run db:studio     # Open Prisma Studio (database UI)
npm run db:migrate    # Run database migrations
npm run db:push       # Push schema without migration
npm run db:generate   # Generate Prisma Client
```

## Current Project Status

### ✅ Completed

**Phase 1: Project Initialization & UI Development** (✅ COMPLETE)
- ✅ Next.js 15 project initialized with TypeScript and Tailwind CSS
- ✅ Complete search UI implemented with two sections:
  - **Single Filters**: Winner Race, Winning Player, Player ELO/Level (at least)
  - **Multiple Filters**: Fraction Config (Race + Structure + Round), Amount of Players, Player Name
- ✅ Multi-condition system implemented - users can add multiple search conditions with visual chips
- ✅ TypeScript types defined for GameResult, PlayerResult, SearchRequest, StructureCondition

**UI Features Implemented**:
- Search form with organized filter sections
- "Add condition" functionality for multiple filters
- Visual condition chips with remove buttons
- Player ELO input with both dropdown (level presets) and manual numeric input
- Input validation (ELO field only accepts digits 0-9)
- Responsive layout with Tailwind CSS
- Form reset functionality

**Phase 2: Backend & Database Setup** (✅ COMPLETE)
- ✅ **Prisma Setup**: Installed `@prisma/client` and `prisma` packages
- ✅ **Database Schema**: Two-table normalized design
  - **Games table**: One row per game with metadata
  - **Players table**: One row per player per game (4-player game = 4 rows)
  - Migration: `20260205132437_init_schema` - Initial schema creation
  - Migration: `20260205193359_fix_player_table_id_foreign_key` - Fixed Player.tableId to Int referencing Game.tableId
  - **17 indexes total**: 5 on games, 12 on players (including GIN index for JSONB)
  - Removed unused fields: roundCount, gameDate, createdAt, updatedAt
  - Added: `minPlayerElo` for fast skill-level filtering
  - **Foreign Key**: Player.tableId (Int) → Game.tableId (Int) for proper BGA table ID references
- ✅ **Docker Compose**: Created `docker-compose.yml` with PostgreSQL 16 Alpine
  - Container: `bga_gaia_postgres`
  - Database: `bga_gaia_db` (user: `bga_user`)
  - Port: 5432, Volume: `postgres_data`
  - Image size: ~103 MB, RAM usage: ~100-200 MB idle
- ✅ **Database Connection**: Tested and verified working
  - Created `src/lib/db.ts` - Prisma client singleton
  - CRUD operations verified (Create, Read, Delete)
  - JSONB fields storing data correctly
- ✅ **NPM Scripts**: Added database management scripts
  - `npm run db:studio` - Open Prisma Studio UI
  - `npm run db:migrate` - Run migrations
  - `npm run db:push` - Push schema changes
  - `npm run db:generate` - Generate Prisma Client
- ✅ **BGA API Client**: Playwright-based implementation with authentication and data fetching
  - **Browser Automation**: Uses headless Chromium via Playwright to bypass BGA anti-bot detection
    - All API requests originate from a real browser (correct TLS fingerprint, cookies, JS context)
    - Cookies/sessions managed automatically by the browser context
    - `requestToken` extracted from page JS: `page.evaluate(() => bgaConfig.requestToken)`
  - **Three Request Strategies**:
    - `apiFetch()` — Playwright's `context.request` (shares browser cookies) for simple APIs (login, search, ranking)
    - `browserNavigate()` — `page.goto()` + `page.route()` header injection for anti-bot-sensitive APIs (game logs, table info)
    - `navigateTo()` — Full page navigation with `networkidle` for session context establishment
  - **Authentication**: `initialize()` and `login()` methods
    - Launches Chromium, navigates to BGA homepage, extracts request token
    - Auto-detects BGA domain redirect (`boardgamearena.com` → `en.boardgamearena.com`)
    - Login via `context.request.fetch()` (shares browser cookies without cross-origin issues)
  - **Data Fetching**: Five API methods
    - `getPlayerFinishedGames(playerId, gameId, page)` - Fetch list of games (10 per page)
    - `getGameLog(tableId, translated)` - Fetch detailed game log with all events
    - `getTableInfo(tableId)` - Fetch table info including player ELO ratings
    - `getRanking(gameId, start, mode)` - Fetch player rankings by ELO
    - `searchPlayer(query)` - Search for players by name
  - `close()` method for browser cleanup (must be called when done)
  - Created `src/lib/bga-client.ts` - BGA API client class
  - Created `src/lib/bga-types.ts` - TypeScript type definitions
- ✅ **Game Log Parser**: Extracts searchable fields from game logs
  - Created `src/lib/game-parser.ts` - Main parser implementation
  - Created `src/lib/gaia-constants.ts` - Race/building/event type mappings
  - **Extracts**: Player races, final scores, winner, building actions by round
  - **Output Structure**: Compact JSON with players array containing all data
  - **Building Data**: Stored as 2D array `buildings[round][buildingIndex]` with only IDs
  - Complete race ID mapping (1-14: Terrans, Lantids, Xenos, etc.)
  - Complete building ID mapping (4-9: Mine, Trading Station, Research Lab, etc.)
  - Handles event types: `notifyChooseRace`, `notifyBuild`, `notifyUpgrade`, `notifyRoundEnd`
- ✅ **Game Storage Helpers**: Database storage and retrieval functions
  - Created `src/lib/game-storage.ts` - Storage helper functions
    - `storeGame()` - Store parsed game and all players in Prisma transaction
    - Uses explicit transaction: creates Game first, then creates Players with tableId FK
    - `gameExists()` - Check if game already in database
    - `getGame()` - Retrieve game with all players
  - Handles ELO mapping from BGA API data
  - Calculates `minPlayerElo` automatically
  - Sets `isWinner` flag for winning player
- ✅ **Query Helpers**: Complex search query builders
  - Created `src/lib/building-query.ts` - Building query helpers
    - `buildPlayerQuery()` - Basic player filtering
    - `generateBuildingSQL()` - Raw SQL for JSONB building searches
    - `buildGameWhereCondition()` - Multi-condition OR queries
  - Supports "any player" search pattern
  - Handles complex race + building + round combinations
- ✅ **Documentation**:
  - `docs/BGA_API.md` - Complete API reference with examples
  - `docs/GAME_LOG_STRUCTURE.md` - Detailed log structure and parsing strategy

**Complete Data Collection Flow:**
1. `BGAClient.initialize()` - Launches Chromium, navigates to BGA homepage, extracts request token
2. `BGAClient.login(username, password)` - Authenticates via browser context
3. `BGAClient.getPlayerFinishedGames(playerId, gameId, page)` - Fetch game list (paginated, 10 per page)
4. `BGAClient.getGameLog(tableId)` - Fetch detailed game log (via browser navigation)
5. `BGAClient.getTableInfo(tableId)` - Fetch table info including player ELO ratings
6. `GameLogParser.parseGameLog(gameTable, logResponse, tableInfo)` - Parse log into searchable data
7. `storeGame(parsedGame)` - Store in database using transaction (1 game + N players)
8. `BGAClient.close()` - Close browser and clean up resources

**Phase 4: Game Collection System** (✅ COMPLETE)
- ✅ **Player Rankings API**: Added `getRanking()` method to fetch top players by ELO
- ✅ **Player Search API**: Added `searchPlayer()` method to find players by name
  - Uses BGA omnibar search endpoint
  - Supports fuzzy matching
  - Returns player ID, name, and country info
- ✅ **Game Collector Service**: Created `src/lib/game-collector.ts`
  - Automated pagination through all player games
  - Rate limiting (configurable, default: 1.5s between requests)
  - Duplicate detection (skips games already in database)
  - **Immediate rate limit detection**: Stops as soon as BGA returns "You have reached a limit" — no wasted retries
  - `RateLimitError` propagates up with partial stats, so summaries are always complete
  - `collectMultiplePlayers()` stops processing remaining players on rate limit
  - Progress callbacks for real-time status updates
- ✅ **CLI Collection Scripts**:
  - `scripts/collect-player.ts` - Collect games for specific player (by name or ID)
  - `scripts/collect-top10.ts` - Collect games for top 10 ranked players
  - Both support env var override: `BGA_USERNAME=x BGA_PASSWORD=y npx tsx scripts/collect-player.ts <name>`
  - Both display rate limit status in summary and suggest re-running later
- ✅ **Error Handling**:
  - Gracefully handles old archived games without log files
  - BGA error responses detected and logged
  - Rate limit detection with immediate clean exit
  - Clear progress messages with emoji icons

**Collection System Usage:**
```bash
# Collect games for a specific player by name
npx tsx scripts/collect-player.ts Nigator

# Collect games for a specific player by ID
npx tsx scripts/collect-player.ts 83983741

# Collect games for top 10 players
npx tsx scripts/collect-top10.ts

# Run with different BGA credentials (overrides .env)
BGA_USERNAME=user2 BGA_PASSWORD=pass2 npx tsx scripts/collect-player.ts Nigator

# Run multiple collectors in parallel (different terminals, different accounts)
# Terminal 1: BGA_USERNAME=user1 BGA_PASSWORD=pass1 npx tsx scripts/collect-player.ts Nigator
# Terminal 2: BGA_USERNAME=user2 BGA_PASSWORD=pass2 npx tsx scripts/collect-player.ts nanyuanyiai
```

**Current Database Status:**
- ~200 games collected from top-ranked players
- All games include: player data, ELO ratings, race info, building actions per round
- Foreign key relationships working correctly (Player.tableId → Game.tableId)
- Database accessible via Prisma Studio at http://localhost:5558
- Collection ongoing for remaining top 10 players (BGA daily rate limit: ~100 game log views/day/account)

**Known Limitations:**
- **BGA Daily Rate Limit**: ~100 game log views per day per account
  - After ~100 fetches, BGA returns: "You have reached a limit (replay)"
  - Collector detects this immediately and stops cleanly
  - Re-run the next day (or use multiple accounts) to continue
  - Game list pagination is NOT rate limited — only game log/replay views

**Phase 3: Search Functionality** (✅ COMPLETE)
- ✅ **Search Logic**: Extracted into `src/lib/search.ts` → `searchGames(req)` function
  - Used by both the API route and the server-rendered results page (no duplication)
  - Builds Prisma `AND` conditions for all filter types
  - Race-only fraction conditions → Prisma ORM (`players: { some: { raceId } }`)
  - Building conditions → raw SQL with `AND EXISTS` blocks per condition (JSONB array search via `@>` and `WITH ORDINALITY`)
  - Early-exit when building SQL returns 0 matches (avoids a no-op Prisma query)
  - Player name conditions use **AND** logic (all named players must appear in the same game)
  - Player count conditions use **OR** logic (game matches any of the selected counts)
- ✅ **API Route**: `POST /api/search` — thin wrapper over `searchGames()`
- ✅ **Player Names API**: `GET /api/players` — returns all distinct player names from the DB for autocomplete
- ✅ **Results Page**: `src/app/results/page.tsx` — server-rendered, reads `?q=<JSON>` URL param
  - Search criteria serialized as JSON into the URL → bookmarkable, shareable, browser-back-works
  - Results open in a **new browser tab** (`window.open(..., '_blank')`) so the search form stays open
- ✅ **Active Filters Summary**: Shown at top of results page as labeled chips
  - Displays all applied filters: winner fraction, min ELO, player counts, player names, fraction conditions
  - "No filters applied" message when search has no criteria
- ✅ **GameCard**: Shows all players per game
  - Players sorted by final score descending (winner is always first)
  - Race badges with per-faction colors: Terrans/Lantids=blue, Firacs/Bescods=black, Ivits/Hadsch Hallas=red, Bal T'aks/Geodens=orange, Gleens/Xenos=yellow, Itars/Nevlas=white, Ambas/Taklons=brown
  - Player names link to BGA profile (`https://boardgamearena.com/player?id={playerId}`) in new tab
  - "Watch BGA replay" link opens game on BGA in new tab
  - Inline condition chips on matching player rows (e.g. `QIC Academy R2`) showing the **actual round** the structure was built — not the filter constraint
  - `buildingsData` included in `PlayerResult` so matching is done client-side without extra round-trips
- ✅ **Types**: Replaced old single-player `Game`/`SearchCriteria` with DB-aligned types
  - `GameResult`, `PlayerResult` (includes `buildingsData`), `SearchRequest`, `StructureCondition`, `SearchResponse`
- ✅ **Search Form UX**:
  - Player name autocomplete: fetches all player names on mount, shows dropdown of up to 5 matches after 2+ characters typed
  - Winning player autocomplete: same behaviour, uses same prefetched list
  - AND/OR labels on each multi-filter section header (Fraction Config AND, Amount of Players OR, Player Name AND)
  - Filter labels: "Winner Fraction" (was "Winner Race"), "Player ELO (min)" (was "Player ELO / Level (at least)")
- ✅ **Branding**:
  - Page title: "Gaia Project Search" (home) / "Search Results" (results page)
  - Custom favicon, 512×512 icon, and OG image using Gaia Project box art
  - Main search page shows only the search form (no title/subtitle)

### 🚧 Pending Work

**Phase 5: Production Deployment**
1. Test end-to-end workflow (collect → store → search) at scale
2. Deploy to Vercel (Next.js) + managed PostgreSQL (Vercel Postgres or Neon)
3. Set up environment variables for production
4. Configure Dockerfile for containerized deployment if needed

### Important Implementation Notes

**Search Filter Architecture**:
- **Search Pattern**: "Find games where ANY player matches conditions"
  - Uses Prisma's `players: { some: { ... } }` pattern
  - Returns entire games, not individual player performances
- Single filters (Winner Fraction, Player ELO min) can only have one value
- Multiple filters support adding multiple conditions of the same type, displayed as removable chips
- **Condition logic per filter type**:
  - Fraction Config → **AND**: every added condition must be satisfied (possibly by different players in the same game)
  - Player Name → **AND**: every named player must appear in the game
  - Amount of Players → **OR**: game must match any of the selected player counts
- Different filter types always combine with AND logic
- All searches leverage indexed fields for fast results

**Player ELO System**:
- Users can select from preset levels (Beginner=0, Apprentice=1, Average=100, Good=200, Strong=300, Expert=500, Master=700)
- Or manually enter any numeric ELO value
- Dropdown and manual input are synchronized - changing one resets the other
- **Minimum Player ELO Filter**: Precomputed field in games table
  - Stores the minimum ELO among all players in the game
  - Enables fast filtering: "Find games where even the weakest player had ELO ≥ X"
  - Calculated automatically during game storage
  - Indexed for sub-millisecond queries

**Fraction Config Filter**:
- Combines Race + Structure + Built in Round (max) into one condition
- Can add conditions with just race, just structure, or any combination
- Displays as chips in the search form: "Terrans: research lab (round ≤ 3)"
- In search results, matching player rows show an inline green chip with the **actual** round built: e.g. `Research Lab R2`
- Race-only conditions are not shown as inline chips (the race badge already identifies the fraction)

**Search Query Patterns**:
The two-table design enables efficient "find games where ANY player did X" searches:

```typescript
// Example 1: Player name search
const games = await prisma.game.findMany({
  where: {
    players: { some: { playerName: { contains: 'Alice' } } }
  },
  include: { players: true }
});

// Example 2: Race + Score combination
const games = await prisma.game.findMany({
  where: {
    players: { some: { raceId: 1, finalScore: { gte: 150 } } }
  },
  include: { players: true }
});

// Example 3: Winner + Minimum ELO
const games = await prisma.game.findMany({
  where: {
    AND: [
      { players: { some: { isWinner: true, raceId: 4 } } },
      { minPlayerElo: { gte: 300 } }
    ]
  },
  include: { players: true }
});

// Example 4: Building query (requires raw SQL)
const games = await prisma.$queryRaw`
  SELECT DISTINCT g.*
  FROM games g
  JOIN players p ON p.game_id = g.id
  WHERE p.race_id = 1
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(p.buildings_data->'buildings')
      WITH ORDINALITY AS round(buildings, round_num)
      WHERE round_num <= 4 AND buildings ? '6'
    )
`;
```

**Parsed Game Data Structure**:
```typescript
{
  tableId: string;          // BGA game table ID
  gameId: number;           // Game type (1495 for Gaia Project)
  gameName: string;         // "gaiaproject"
  playerCount: number;      // Number of players
  winnerName: string;       // Name of winning player
  players: [
    {
      playerId: number;
      playerName: string;
      raceId: number;       // 1-14 (Terrans, Lantids, Xenos, etc.)
      raceName: string;
      finalScore: number;
      buildings: number[][]; // buildings[round] = [buildingId1, buildingId2, ...]
                            // buildingId: 4=Mine, 5=Trading Station, 6=Research Lab,
                            //             7=Academy(Knowledge), 8=Academy(QIC), 9=PI
    }
  ]
}
```

## Deployment

### Local (Testing)
- **Prerequisites**: Docker Desktop installed and running
- Run PostgreSQL: `docker-compose up -d`
- Run migrations: `npm run db:migrate` (first time only)
- Start app: `npm run dev`
- Access at: `http://localhost:3000`
- View database: `npm run db:studio` (opens at `http://localhost:5558`)

### Production (Vercel - Recommended)
- Deploy Next.js to Vercel (free tier)
- Database: Vercel Postgres or Neon (free tier)
- Environment variables stored in Vercel dashboard
- Automatic deployments from Git pushes

### Docker Deployment
```bash
# Build image
docker build -t bga-gaia-parser .

# Run container
docker run -p 3000:3000 bga-gaia-parser
```
