BEGIN;

CREATE TYPE "GroupRole" AS ENUM ('OWNER', 'MEMBER');

ALTER TABLE "groups"
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW();

CREATE TABLE "groupMembership" (
  "group"    INTEGER       NOT NULL,
  "user"     INTEGER       NOT NULL,
  "role"     "GroupRole"   NOT NULL DEFAULT 'MEMBER',
  "joinedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "groupMembership_pkey" PRIMARY KEY ("group", "user"),
  CONSTRAINT "groupMembership_group_fkey"
    FOREIGN KEY ("group") REFERENCES "groups"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "groupMembership_user_fkey"
    FOREIGN KEY ("user") REFERENCES "users"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "groupMembership_user_idx" ON "groupMembership"("user");
CREATE INDEX "groupMembership_group_idx" ON "groupMembership"("group");

INSERT INTO "groupMembership" ("group", "user", "role", "joinedAt")
SELECT
  u."inGroup",
  u."id",
  CASE
    WHEN u."id" = MIN(u."id") OVER (PARTITION BY u."inGroup")
      THEN 'OWNER'::"GroupRole"
    ELSE 'MEMBER'::"GroupRole"
  END,
  NOW()
FROM "users" u
WHERE u."inGroup" IS NOT NULL;

ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_inGroup_fkey";
ALTER TABLE "users" DROP COLUMN IF EXISTS "inGroup";

COMMIT;
