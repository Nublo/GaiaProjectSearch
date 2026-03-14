-- AlterTable
ALTER TABLE "games" ADD COLUMN     "final_scorings" INTEGER[];

-- CreateIndex
CREATE INDEX "games_final_scorings_gin_idx" ON "games" USING GIN ("final_scorings");
