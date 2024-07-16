-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- CreateEnum
CREATE TYPE "Badge" AS ENUM ('ADMIN', 'PATRON', 'USER');

-- CreateTable
CREATE TABLE "attendance" (
    "id" SERIAL NOT NULL,
    "event" INTEGER NOT NULL,
    "attendant" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT,

    CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "musicals" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "playbill" TEXT,
    "duration" INTEGER,
    "musicBy" TEXT NOT NULL,
    "lyricsBy" TEXT NOT NULL,
    "bookBy" TEXT NOT NULL,
    "premiere" DATE,

    CONSTRAINT "musicals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performances" (
    "id" SERIAL NOT NULL,
    "musical" INTEGER NOT NULL,
    "theatre" INTEGER NOT NULL,
    "startTime" TIMESTAMPTZ(6) NOT NULL,
    "endTime" TIMESTAMPTZ(6) NOT NULL,
    "rating" DECIMAL,
    "comment" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "showings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programming" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "musical" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "endDate" DATE,
    "startDate" DATE,

    CONSTRAINT "programming_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasons" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "theatre" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theatres" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "image" TEXT,
    "address" TEXT,

    CONSTRAINT "playhouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "location" TEXT,
    "website" TEXT,
    "bio" TEXT,
    "image" TEXT,
    "badge" "Badge" NOT NULL DEFAULT 'USER',
    "inGroup" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "musicals_title_key" ON "musicals"("title");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_attendant_fkey" FOREIGN KEY ("attendant") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_event_fkey" FOREIGN KEY ("event") REFERENCES "performances"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "performances" ADD CONSTRAINT "showings_musical_fkey" FOREIGN KEY ("musical") REFERENCES "musicals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "performances" ADD CONSTRAINT "showings_theatre_fkey" FOREIGN KEY ("theatre") REFERENCES "theatres"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "programming" ADD CONSTRAINT "programming_musical_fkey" FOREIGN KEY ("musical") REFERENCES "musicals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "programming" ADD CONSTRAINT "programming_season_fkey" FOREIGN KEY ("season") REFERENCES "seasons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_theatre_fkey" FOREIGN KEY ("theatre") REFERENCES "theatres"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_inGroup_fkey" FOREIGN KEY ("inGroup") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
