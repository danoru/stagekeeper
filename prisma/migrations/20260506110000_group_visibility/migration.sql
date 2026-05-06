BEGIN;

CREATE TYPE "GroupVisibility" AS ENUM ('PRIVATE', 'PUBLIC_REQUEST', 'PUBLIC_OPEN');

ALTER TABLE "groups"
  ADD COLUMN "visibility" "GroupVisibility" NOT NULL DEFAULT 'PRIVATE';

CREATE INDEX "groups_visibility_idx" ON "groups"("visibility");

COMMIT;
