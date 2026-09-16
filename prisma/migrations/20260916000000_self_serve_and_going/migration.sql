-- Self-serve data entry (user-created shows/theatres with a pending status),
-- "going" intent on attendance, group invite links, password reset, onboarding.
BEGIN;

CREATE TYPE "ContentStatus" AS ENUM ('PENDING', 'APPROVED');

-- Shows and theatres can now be created by any user; admins approve them.
ALTER TABLE "musicals"
  ADD COLUMN "status" "ContentStatus" NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN "createdBy" INTEGER;
ALTER TABLE "plays"
  ADD COLUMN "status" "ContentStatus" NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN "createdBy" INTEGER;
ALTER TABLE "plays" ALTER COLUMN "premiere" DROP NOT NULL;
ALTER TABLE "theatres"
  ADD COLUMN "status" "ContentStatus" NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN "createdBy" INTEGER;

ALTER TABLE "musicals" ADD CONSTRAINT "musicals_createdBy_fkey"
  FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "plays" ADD CONSTRAINT "plays_createdBy_fkey"
  FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "theatres" ADD CONSTRAINT "theatres_createdBy_fkey"
  FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE INDEX "musicals_status_idx" ON "musicals"("status");
CREATE INDEX "plays_status_idx" ON "plays"("status");
CREATE INDEX "theatres_status_idx" ON "theatres"("status");

-- "I'm going": an attendance row with going = true and a future seenDate.
ALTER TABLE "attendance" ADD COLUMN "going" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "attendance_going_seenDate_idx" ON "attendance"("going", "seenDate");

-- Shareable group invite links.
ALTER TABLE "groups" ADD COLUMN "inviteToken" TEXT;
UPDATE "groups" SET "inviteToken" = gen_random_uuid()::text WHERE "inviteToken" IS NULL;
ALTER TABLE "groups" ALTER COLUMN "inviteToken" SET NOT NULL;
CREATE UNIQUE INDEX "groups_inviteToken_key" ON "groups"("inviteToken");

-- Password reset + onboarding.
ALTER TABLE "users"
  ADD COLUMN "onboardedAt" TIMESTAMPTZ(6),
  ADD COLUMN "passwordResetToken" TEXT,
  ADD COLUMN "passwordResetExpires" TIMESTAMPTZ(6);
CREATE UNIQUE INDEX "users_passwordResetToken_key" ON "users"("passwordResetToken");

COMMIT;
