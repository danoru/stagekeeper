-- CreateTable
CREATE TABLE "theatreFollows" (
    "user" INTEGER NOT NULL,
    "theatre" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "theatreFollows_pkey" PRIMARY KEY ("user","theatre")
);

-- CreateIndex
CREATE INDEX "theatreFollows_theatre_idx" ON "theatreFollows"("theatre");

-- AddForeignKey
ALTER TABLE "theatreFollows" ADD CONSTRAINT "theatreFollows_user_fkey" FOREIGN KEY ("user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "theatreFollows" ADD CONSTRAINT "theatreFollows_theatre_fkey" FOREIGN KEY ("theatre") REFERENCES "theatres"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

