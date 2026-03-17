-- AlterTable
ALTER TABLE "players" ADD COLUMN     "standard_techs_data" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- CreateIndex
CREATE INDEX "players_standard_techs_data_gin_idx" ON "players" USING GIN ("standard_techs_data");
