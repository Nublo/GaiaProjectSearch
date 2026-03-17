-- AlterTable
ALTER TABLE "players" ADD COLUMN     "advanced_techs_data" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- CreateIndex
CREATE INDEX "players_advanced_techs_data_gin_idx" ON "players" USING GIN ("advanced_techs_data");
