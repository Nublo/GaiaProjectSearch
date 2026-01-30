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
- **Containerization**: Docker for local PostgreSQL and production deployment

## Architecture

### Data Model
- **Hybrid Storage Strategy**: Store both raw game logs (JSONB) and preprocessed searchable fields
- **Expected Scale**: 10k-100k games
- **Primary Table**: `games` with fields:
  - `game_id` (BGA game identifier)
  - `game_log` (full JSON from BGA API)
  - Preprocessed fields: `player_race`, `final_score`, `player_name`, `game_date`, `round_count`, `player_count`, `buildings_data`

### Data Flow
1. User authenticates with BGA credentials
2. API fetches game data (JSON logs) from BGA
3. Parser extracts searchable fields from JSON
4. Both raw JSON and preprocessed data stored in PostgreSQL
5. Search queries use indexed preprocessed fields for fast results

## Project Structure

```
bga_gaia_parser/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Home/search interface
│   │   ├── games/[id]/        # Game detail pages
│   │   └── api/               # API routes
│   │       ├── auth/          # BGA authentication
│   │       ├── collect/       # Data collection endpoints
│   │       └── search/        # Search endpoints
│   ├── components/            # React components
│   ├── lib/                   # Utility functions
│   │   ├── bga-client.ts     # BGA API client
│   │   ├── game-parser.ts    # JSON parsing logic
│   │   └── db.ts             # Prisma client
│   └── types/                 # TypeScript types
├── prisma/
│   └── schema.prisma          # Database schema
├── docker-compose.yml         # Local PostgreSQL setup
└── Dockerfile                 # Production container
```

## Development Commands

### Initial Setup
```bash
# Install dependencies
npm install

# Start local PostgreSQL database
docker-compose up -d

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### Development
```bash
# Start development server (http://localhost:3000)
npm run dev

# Open Prisma Studio (database UI)
npx prisma studio

# Run database migrations
npx prisma migrate dev

# Reset database (warning: deletes all data)
npx prisma migrate reset
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

### Database Management
```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# View database in browser
npx prisma studio
```

## Current Project Status

### ✅ Completed

**Phase 1: Project Initialization & UI Development**
- ✅ Next.js 15 project initialized with TypeScript and Tailwind CSS
- ✅ Complete search UI implemented with two sections:
  - **Single Filters**: Winner Race, Winning Player, Player ELO/Level (at least)
  - **Multiple Filters**: Fraction Config (Race + Structure + Round), Amount of Players, Player Name
- ✅ Multi-condition system implemented - users can add multiple search conditions with visual chips
- ✅ Mock data integration for UI testing (3 sample games)
- ✅ TypeScript types defined for Game, SearchCriteria, and SearchResults

**UI Features Implemented**:
- Search form with organized filter sections
- "Add condition" functionality for multiple filters
- Visual condition chips with remove buttons
- Player ELO input with both dropdown (level presets) and manual numeric input
- Input validation (ELO field only accepts digits 0-9)
- Responsive layout with Tailwind CSS
- Form reset functionality

### 🚧 Pending Work

**Phase 2: Backend & Database Setup** (Next Priority)
1. Setup Prisma with PostgreSQL connection
2. Create database schema with games table (JSONB + preprocessed fields)
3. Setup Docker Compose for local PostgreSQL
4. Implement BGA API client for authentication and data fetching
5. Build game JSON parser to extract searchable fields

**Phase 3: Search Functionality**
6. Create search API endpoint that uses multiple conditions
7. Integrate search API with frontend UI
8. Replace mock data with real database queries

**Phase 4: Data Collection**
9. Create data collection API endpoints
10. Implement background job system for periodic data fetching
11. Build admin interface for triggering data collection

**Phase 5: Production Deployment**
12. Create Dockerfile for production
13. Test end-to-end workflow
14. Deploy to Vercel with PostgreSQL database

### Important Implementation Notes

**Search Filter Architecture**:
- Single filters (winner, player ELO) can only have one value
- Multiple filters support adding multiple conditions of the same type
- Conditions are stored in separate state arrays and displayed as removable chips
- Future: Multiple conditions will be combined with OR logic in search queries

**Player ELO System**:
- Users can select from preset levels (Beginner=0, Apprentice=1, Average=100, Good=200, Strong=300, Expert=500, Master=700)
- Or manually enter any numeric ELO value
- Dropdown and manual input are synchronized - changing one resets the other

**Fraction Config Filter**:
- Combines Race + Structure + Built in Round (max) into one condition
- Can add conditions with just race, just structure, or any combination
- Displays as chips: "Terrans: Mine (round ≤ 3)"

## Deployment

### Local (Testing)
- Run PostgreSQL: `docker-compose up -d` (not yet created)
- Start app: `npm run dev`
- Access at: `http://localhost:3000`

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
