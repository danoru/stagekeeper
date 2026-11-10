-- CreateEnum
CREATE TYPE "CompanionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- AlterEnum
ALTER TYPE "ReportTarget" ADD VALUE 'THEATRE_NOTE';

-- AlterEnum
ALTER TYPE "CreditCategory" ADD VALUE 'UNDERSTUDY';

-- AlterTable
ALTER TABLE "people" ADD COLUMN     "disambiguator" TEXT;

-- AlterTable
ALTER TABLE "theatres" ADD COLUMN     "timeZone" TEXT NOT NULL DEFAULT 'America/Los_Angeles';

-- CreateTable
CREATE TABLE "theatreNotes" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "theatre" INTEGER NOT NULL,
    "user" INTEGER,
    "category" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "theatreNotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theatreNoteVotes" (
    "note" INTEGER NOT NULL,
    "user" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "theatreNoteVotes_pkey" PRIMARY KEY ("note","user")
);

-- CreateTable
CREATE TABLE "attendanceCompanion" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendance" INTEGER NOT NULL,
    "user" INTEGER NOT NULL,
    "taggedBy" INTEGER NOT NULL,
    "status" "CompanionStatus" NOT NULL DEFAULT 'PENDING',
    "linkedAttendance" INTEGER,

    CONSTRAINT "attendanceCompanion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "theatreNotes_theatre_status_idx" ON "theatreNotes"("theatre", "status");

-- CreateIndex
CREATE INDEX "theatreNotes_user_idx" ON "theatreNotes"("user");

-- CreateIndex
CREATE INDEX "attendanceCompanion_user_status_idx" ON "attendanceCompanion"("user", "status");

-- CreateIndex
CREATE UNIQUE INDEX "attendanceCompanion_attendance_user_key" ON "attendanceCompanion"("attendance", "user");

-- AddForeignKey
ALTER TABLE "theatreNotes" ADD CONSTRAINT "theatreNotes_theatre_fkey" FOREIGN KEY ("theatre") REFERENCES "theatres"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "theatreNotes" ADD CONSTRAINT "theatreNotes_user_fkey" FOREIGN KEY ("user") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "theatreNoteVotes" ADD CONSTRAINT "theatreNoteVotes_note_fkey" FOREIGN KEY ("note") REFERENCES "theatreNotes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "theatreNoteVotes" ADD CONSTRAINT "theatreNoteVotes_user_fkey" FOREIGN KEY ("user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attendanceCompanion" ADD CONSTRAINT "attendanceCompanion_attendance_fkey" FOREIGN KEY ("attendance") REFERENCES "attendance"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attendanceCompanion" ADD CONSTRAINT "attendanceCompanion_linkedAttendance_fkey" FOREIGN KEY ("linkedAttendance") REFERENCES "attendance"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attendanceCompanion" ADD CONSTRAINT "attendanceCompanion_user_fkey" FOREIGN KEY ("user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attendanceCompanion" ADD CONSTRAINT "attendanceCompanion_taggedBy_fkey" FOREIGN KEY ("taggedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

