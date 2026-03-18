-- AlterTable
ALTER TABLE "players" ADD COLUMN     "qic_points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tech_points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_scored_points" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "players_qic_points_idx" ON "players"("qic_points");

-- CreateIndex
CREATE INDEX "players_tech_points_idx" ON "players"("tech_points");

-- CreateIndex
CREATE INDEX "players_total_scored_points_idx" ON "players"("total_scored_points");
