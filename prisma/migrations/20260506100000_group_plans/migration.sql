BEGIN;

CREATE TYPE "RsvpStatus" AS ENUM ('GOING', 'MAYBE', 'NOT_GOING');

CREATE TABLE "groupPlan" (
  "id"          SERIAL          PRIMARY KEY,
  "createdAt"   TIMESTAMPTZ(6)  NOT NULL DEFAULT NOW(),
  "group"       INTEGER         NOT NULL,
  "performance" INTEGER         NOT NULL,
  "createdBy"   INTEGER         NOT NULL,
  "note"        TEXT,
  CONSTRAINT "groupPlan_group_fkey"
    FOREIGN KEY ("group") REFERENCES "groups"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "groupPlan_performance_fkey"
    FOREIGN KEY ("performance") REFERENCES "performances"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "groupPlan_createdBy_fkey"
    FOREIGN KEY ("createdBy") REFERENCES "users"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "groupPlan_unique_performance_per_group"
    UNIQUE ("group", "performance")
);

CREATE INDEX "groupPlan_group_idx" ON "groupPlan"("group");
CREATE INDEX "groupPlan_performance_idx" ON "groupPlan"("performance");
CREATE INDEX "groupPlan_createdBy_idx" ON "groupPlan"("createdBy");

CREATE TABLE "groupPlanRsvp" (
  "plan"      INTEGER         NOT NULL,
  "user"      INTEGER         NOT NULL,
  "status"    "RsvpStatus"    NOT NULL,
  "updatedAt" TIMESTAMPTZ(6)  NOT NULL DEFAULT NOW(),
  CONSTRAINT "groupPlanRsvp_pkey" PRIMARY KEY ("plan", "user"),
  CONSTRAINT "groupPlanRsvp_plan_fkey"
    FOREIGN KEY ("plan") REFERENCES "groupPlan"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "groupPlanRsvp_user_fkey"
    FOREIGN KEY ("user") REFERENCES "users"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX "groupPlanRsvp_user_idx" ON "groupPlanRsvp"("user");
CREATE INDEX "groupPlanRsvp_plan_idx" ON "groupPlanRsvp"("plan");

COMMIT;
