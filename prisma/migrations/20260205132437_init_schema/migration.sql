-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "table_id" INTEGER NOT NULL,
    "game_id" TEXT NOT NULL DEFAULT '1495',
    "game_name" TEXT NOT NULL DEFAULT 'gaiaproject',
    "player_count" INTEGER NOT NULL,
    "winner_name" TEXT NOT NULL,
    "min_player_elo" INTEGER,
    "raw_game_log" JSONB NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "player_id" INTEGER NOT NULL,
    "player_name" TEXT NOT NULL,
    "race_id" INTEGER NOT NULL,
    "race_name" TEXT NOT NULL,
    "final_score" INTEGER NOT NULL,
    "player_elo" INTEGER,
    "is_winner" BOOLEAN NOT NULL DEFAULT false,
    "buildings_data" JSONB NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "games_table_id_key" ON "games"("table_id");

-- CreateIndex
CREATE INDEX "games_winner_name_idx" ON "games"("winner_name");

-- CreateIndex
CREATE INDEX "games_player_count_idx" ON "games"("player_count");

-- CreateIndex
CREATE INDEX "games_min_player_elo_idx" ON "games"("min_player_elo");

-- CreateIndex
CREATE INDEX "players_player_name_idx" ON "players"("player_name");

-- CreateIndex
CREATE INDEX "players_race_id_idx" ON "players"("race_id");

-- CreateIndex
CREATE INDEX "players_race_name_idx" ON "players"("race_name");

-- CreateIndex
CREATE INDEX "players_final_score_idx" ON "players"("final_score");

-- CreateIndex
CREATE INDEX "players_player_elo_idx" ON "players"("player_elo");

-- CreateIndex
CREATE INDEX "players_table_id_idx" ON "players"("table_id");

-- CreateIndex
CREATE INDEX "players_is_winner_idx" ON "players"("is_winner");

-- CreateIndex
CREATE INDEX "players_race_id_final_score_idx" ON "players"("race_id", "final_score");

-- CreateIndex
CREATE INDEX "players_table_id_race_id_idx" ON "players"("table_id", "race_id");

-- CreateIndex
CREATE INDEX "players_player_elo_final_score_idx" ON "players"("player_elo", "final_score");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add GIN index for JSONB buildings_data column
-- This enables efficient queries on building types and rounds
CREATE INDEX IF NOT EXISTS "players_buildings_data_gin_idx"
ON "players" USING GIN ("buildings_data");
