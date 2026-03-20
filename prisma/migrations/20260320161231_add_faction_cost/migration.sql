-- AlterTable
ALTER TABLE "players" ADD COLUMN     "faction_cost" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "players_faction_cost_idx" ON "players"("faction_cost");
