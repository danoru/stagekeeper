DELETE FROM "watchlist" w
USING "watchlist" dup
WHERE w."musical" IS NOT NULL
  AND w."user" = dup."user"
  AND w."musical" = dup."musical"
  AND w."id" > dup."id";

DELETE FROM "watchlist" w
USING "watchlist" dup
WHERE w."play" IS NOT NULL
  AND w."user" = dup."user"
  AND w."play" = dup."play"
  AND w."id" > dup."id";

DELETE FROM "likedShows" l
USING "likedShows" dup
WHERE l."musical" IS NOT NULL
  AND l."user" = dup."user"
  AND l."musical" = dup."musical"
  AND l."id" > dup."id";

DELETE FROM "likedShows" l
USING "likedShows" dup
WHERE l."play" IS NOT NULL
  AND l."user" = dup."user"
  AND l."play" = dup."play"
  AND l."id" > dup."id";

-- CreateIndex
CREATE UNIQUE INDEX "watchlist_user_musical_key" ON "watchlist"("user", "musical");

-- CreateIndex
CREATE UNIQUE INDEX "watchlist_user_play_key" ON "watchlist"("user", "play");

-- CreateIndex
CREATE UNIQUE INDEX "likedShows_user_musical_key" ON "likedShows"("user", "musical");

-- CreateIndex
CREATE UNIQUE INDEX "likedShows_user_play_key" ON "likedShows"("user", "play");
