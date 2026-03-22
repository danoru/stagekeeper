-- CreateEnum
CREATE TYPE "LogStatus" AS ENUM ('PENDING', 'APPROVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "logs" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user" INTEGER NOT NULL,
    "musical" INTEGER,
    "play" INTEGER,
    "theatre" INTEGER,
    "programming" INTEGER,
    "seenDate" DATE,
    "rating" DECIMAL,
    "comment" TEXT,
    "status" "LogStatus" NOT NULL DEFAULT 'APPROVED',
    "taggedBy" INTEGER,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_user_fkey" FOREIGN KEY ("user") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_taggedBy_fkey" FOREIGN KEY ("taggedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_musical_fkey" FOREIGN KEY ("musical") REFERENCES "musicals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_play_fkey" FOREIGN KEY ("play") REFERENCES "plays"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_theatre_fkey" FOREIGN KEY ("theatre") REFERENCES "theatres"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_programming_fkey" FOREIGN KEY ("programming") REFERENCES "programming"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;