/** Follows or unfollows from the browser. Throws the server's message so the UI can show it. */
export async function setFollowing(followingUsername: string, follow: boolean) {
  const response = await fetch("/api/user/follow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ followingUsername, action: follow ? "follow" : "unfollow" }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Couldn't update follow status.");
  }
}
