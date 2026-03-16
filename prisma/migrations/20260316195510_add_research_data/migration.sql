/*
  Warnings:

  - Added the required column `research_data` to the `players` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "players" ADD COLUMN "research_data" JSONB NOT NULL DEFAULT '{"research":[]}';
ALTER TABLE "players" ALTER COLUMN "research_data" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "players_research_data_gin_idx" ON "players" USING GIN ("research_data");
