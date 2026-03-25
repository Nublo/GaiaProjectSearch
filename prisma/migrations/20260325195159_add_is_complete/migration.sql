-- AlterTable
ALTER TABLE "games" ADD COLUMN     "is_complete" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "games_is_complete_idx" ON "games"("is_complete");
