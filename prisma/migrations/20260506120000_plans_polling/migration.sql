BEGIN;

DROP TABLE IF EXISTS "groupPlanRsvp";
DROP TABLE IF EXISTS "groupPlan";
DROP TYPE IF EXISTS "RsvpStatus";

CREATE TYPE "PlanStatus" AS ENUM ('POLLING', 'CONFIRMED', 'CANCELED');
CREATE TYPE "Availability" AS ENUM ('UNAVAILABLE', 'AVAILABLE', 'PREFER', 'GOING');

CREATE TABLE "groupPlan" (
  "id"           SERIAL          PRIMARY KEY,
  "createdAt"    TIMESTAMPTZ(6)  NOT NULL DEFAULT NOW(),
  "group"        INTEGER         NOT NULL,
  "programming"  INTEGER         NOT NULL,
  "createdBy"    INTEGER         NOT NULL,
  "note"         TEXT,
  "status"       "PlanStatus"    NOT NULL DEFAULT 'POLLING',
  "selectedDate" INTEGER,
  CONSTRAINT "groupPlan_group_fkey"
    FOREIGN KEY ("group") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "groupPlan_programming_fkey"
    FOREIGN KEY ("programming") REFERENCES "programming"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "groupPlan_createdBy_fkey"
    FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "groupPlan_group_idx" ON "groupPlan"("group");
CREATE INDEX "groupPlan_programming_idx" ON "groupPlan"("programming");
CREATE INDEX "groupPlan_createdBy_idx" ON "groupPlan"("createdBy");
CREATE INDEX "groupPlan_status_idx" ON "groupPlan"("status");

CREATE TABLE "groupPlanDate" (
  "id"         SERIAL          PRIMARY KEY,
  "createdAt"  TIMESTAMPTZ(6)  NOT NULL DEFAULT NOW(),
  "plan"       INTEGER         NOT NULL,
  "startTime"  TIMESTAMPTZ(6)  NOT NULL,
  "proposedBy" INTEGER         NOT NULL,
  CONSTRAINT "groupPlanDate_plan_fkey"
    FOREIGN KEY ("plan") REFERENCES "groupPlan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "groupPlanDate_proposedBy_fkey"
    FOREIGN KEY ("proposedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "groupPlanDate_unique_per_plan" UNIQUE ("plan", "startTime")
);

CREATE INDEX "groupPlanDate_plan_idx" ON "groupPlanDate"("plan");
CREATE INDEX "groupPlanDate_proposedBy_idx" ON "groupPlanDate"("proposedBy");

ALTER TABLE "groupPlan"
  ADD CONSTRAINT "groupPlan_selectedDate_fkey"
  FOREIGN KEY ("selectedDate") REFERENCES "groupPlanDate"("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE TABLE "groupPlanAvailability" (
  "planDate"  INTEGER         NOT NULL,
  "user"      INTEGER         NOT NULL,
  "status"    "Availability"  NOT NULL,
  "updatedAt" TIMESTAMPTZ(6)  NOT NULL DEFAULT NOW(),
  CONSTRAINT "groupPlanAvailability_pkey" PRIMARY KEY ("planDate", "user"),
  CONSTRAINT "groupPlanAvailability_planDate_fkey"
    FOREIGN KEY ("planDate") REFERENCES "groupPlanDate"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "groupPlanAvailability_user_fkey"
    FOREIGN KEY ("user") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "groupPlanAvailability_user_idx" ON "groupPlanAvailability"("user");
CREATE INDEX "groupPlanAvailability_planDate_idx" ON "groupPlanAvailability"("planDate");

COMMIT;
