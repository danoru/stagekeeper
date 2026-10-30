-- Group invites: adding someone by username now asks them first. Membership starts when the
-- invitee accepts. Generated with `prisma migrate diff` against the previous schema.
BEGIN;

CREATE TABLE "groupInvite" (
    "group" INTEGER NOT NULL,
    "user" INTEGER NOT NULL,
    "invitedBy" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groupInvite_pkey" PRIMARY KEY ("group","user")
);

CREATE INDEX "groupInvite_user_idx" ON "groupInvite"("user");

ALTER TABLE "groupInvite" ADD CONSTRAINT "groupInvite_group_fkey" FOREIGN KEY ("group") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "groupInvite" ADD CONSTRAINT "groupInvite_user_fkey" FOREIGN KEY ("user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "groupInvite" ADD CONSTRAINT "groupInvite_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

COMMIT;
