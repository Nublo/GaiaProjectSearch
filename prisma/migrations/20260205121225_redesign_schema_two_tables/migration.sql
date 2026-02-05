/*
  Warnings:

  - You are about to drop the column `buildings_data` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `final_score` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `game_date` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `game_log` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `player_elo` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `player_name` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `player_race` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `round_count` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `games` table. All the data in the column will be lost.
  - Added the required column `raw_game_log` to the `games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winner_name` to the `games` table without a default value. This is not possible if the table is not empty.
  - Made the column `player_count` on table `games` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "games_final_score_idx";

-- DropIndex
DROP INDEX "games_game_date_idx";

-- DropIndex
DROP INDEX "games_player_elo_idx";

-- DropIndex
DROP INDEX "games_player_name_idx";

-- DropIndex
DROP INDEX "games_player_race_idx";

-- AlterTable
ALTER TABLE "games" DROP COLUMN "buildings_data",
DROP COLUMN "created_at",
DROP COLUMN "final_score",
DROP COLUMN "game_date",
DROP COLUMN "game_log",
DROP COLUMN "player_elo",
DROP COLUMN "player_name",
DROP COLUMN "player_race",
DROP COLUMN "round_count",
DROP COLUMN "updated_at",
ADD COLUMN     "game_name" TEXT NOT NULL DEFAULT 'gaiaproject',
ADD COLUMN     "min_player_elo" INTEGER,
ADD COLUMN     "raw_game_log" JSONB NOT NULL,
ADD COLUMN     "winner_name" TEXT NOT NULL,
ALTER COLUMN "player_count" SET NOT NULL;

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
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
CREATE INDEX "players_game_id_idx" ON "players"("game_id");

-- CreateIndex
CREATE INDEX "players_is_winner_idx" ON "players"("is_winner");

-- CreateIndex
CREATE INDEX "players_race_id_final_score_idx" ON "players"("race_id", "final_score");

-- CreateIndex
CREATE INDEX "players_game_id_race_id_idx" ON "players"("game_id", "race_id");

-- CreateIndex
CREATE INDEX "players_player_elo_final_score_idx" ON "players"("player_elo", "final_score");

-- CreateIndex
CREATE INDEX "games_winner_name_idx" ON "games"("winner_name");

-- CreateIndex
CREATE INDEX "games_player_count_idx" ON "games"("player_count");

-- CreateIndex
CREATE INDEX "games_min_player_elo_idx" ON "games"("min_player_elo");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add GIN index for JSONB buildings_data column
-- This enables efficient queries on building types and rounds
CREATE INDEX IF NOT EXISTS "players_buildings_data_gin_idx"
ON "players" USING GIN ("buildings_data");
