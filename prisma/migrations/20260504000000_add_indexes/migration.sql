-- CreateIndex
CREATE INDEX IF NOT EXISTS "attendance_user_idx" ON "attendance"("user");
CREATE INDEX IF NOT EXISTS "attendance_performance_idx" ON "attendance"("performance");
CREATE INDEX IF NOT EXISTS "attendance_user_performance_idx" ON "attendance"("user", "performance");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "following_followingUsername_idx" ON "following"("followingUsername");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "likedShows_user_idx" ON "likedShows"("user");
CREATE INDEX IF NOT EXISTS "likedShows_musical_idx" ON "likedShows"("musical");
CREATE INDEX IF NOT EXISTS "likedShows_play_idx" ON "likedShows"("play");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "performances_musical_idx" ON "performances"("musical");
CREATE INDEX IF NOT EXISTS "performances_play_idx" ON "performances"("play");
CREATE INDEX IF NOT EXISTS "performances_theatre_idx" ON "performances"("theatre");
CREATE INDEX IF NOT EXISTS "performances_startTime_idx" ON "performances"("startTime");
CREATE INDEX IF NOT EXISTS "performances_theatre_startTime_idx" ON "performances"("theatre", "startTime");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "programming_musical_idx" ON "programming"("musical");
CREATE INDEX IF NOT EXISTS "programming_play_idx" ON "programming"("play");
CREATE INDEX IF NOT EXISTS "programming_season_idx" ON "programming"("season");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "seasons_theatre_idx" ON "seasons"("theatre");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "watchlist_user_idx" ON "watchlist"("user");
CREATE INDEX IF NOT EXISTS "watchlist_musical_idx" ON "watchlist"("musical");
CREATE INDEX IF NOT EXISTS "watchlist_play_idx" ON "watchlist"("play");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "logs_user_idx" ON "logs"("user");
CREATE INDEX IF NOT EXISTS "logs_taggedBy_idx" ON "logs"("taggedBy");
CREATE INDEX IF NOT EXISTS "logs_musical_idx" ON "logs"("musical");
CREATE INDEX IF NOT EXISTS "logs_play_idx" ON "logs"("play");
CREATE INDEX IF NOT EXISTS "logs_theatre_idx" ON "logs"("theatre");
CREATE INDEX IF NOT EXISTS "logs_programming_idx" ON "logs"("programming");
