-- Cast lists: people and their credits on productions (programming runs). Credits are
-- suggested by members who have seen the show and stay PENDING until an admin approves.
-- Generated with `prisma migrate diff` against the previous schema.
BEGIN;

CREATE TYPE "CreditCategory" AS ENUM ('CAST', 'CREATIVE', 'MUSICIAN', 'CREW');

CREATE TABLE "people" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'PENDING',
    "createdBy" INTEGER,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "credits" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "programming" INTEGER NOT NULL,
    "person" INTEGER NOT NULL,
    "category" "CreditCategory" NOT NULL,
    "role" TEXT,
    "character" TEXT,
    "billing" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'PENDING',
    "suggestedBy" INTEGER,

    CONSTRAINT "credits_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "people_slug_key" ON "people"("slug");
CREATE INDEX "people_name_idx" ON "people"("name");
CREATE INDEX "people_status_idx" ON "people"("status");
CREATE INDEX "credits_programming_idx" ON "credits"("programming");
CREATE INDEX "credits_person_idx" ON "credits"("person");
CREATE INDEX "credits_status_idx" ON "credits"("status");

ALTER TABLE "people" ADD CONSTRAINT "people_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "credits" ADD CONSTRAINT "credits_programming_fkey" FOREIGN KEY ("programming") REFERENCES "programming"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "credits" ADD CONSTRAINT "credits_person_fkey" FOREIGN KEY ("person") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "credits" ADD CONSTRAINT "credits_suggestedBy_fkey" FOREIGN KEY ("suggestedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

COMMIT;
