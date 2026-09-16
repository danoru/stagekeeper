import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, Button, Divider, Stack, TextField, Typography } from "@mui/material";
import type { GroupRole } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";

import type { FeedUser } from "../../data/performances";
import UserAvatar from "../users/UserAvatar";

interface Member {
  user: number;
  role: GroupRole;
  users: FeedUser;
}

interface Group {
  id: number;
  name: string;
  inviteToken: string;
  members: Member[];
}

interface Props {
  group: Group;
  isOwner: boolean;
  viewerId: number;
}

function GroupSettingsPanel({ group, isOwner, viewerId }: Props) {
  const router = useRouter();
  const [name, setName] = useState(group.name);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [newMember, setNewMember] = useState("");
  const [memberError, setMemberError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [inviteToken, setInviteToken] = useState(group.inviteToken);
  const [copied, setCopied] = useState(false);

  const inviteUrl =
    typeof window === "undefined" ? "" : `${window.location.origin}/groups/join/${inviteToken}`;

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleRotateInvite() {
    setBusy(true);
    try {
      const res = await fetch(`/api/groups/${group.id}/invite`, { method: "POST" });
      if (!res.ok) return;
      const body = await res.json();
      setInviteToken(body.inviteToken);
    } finally {
      setBusy(false);
    }
  }

  function refresh() {
    router.replace(router.asPath);
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name.trim() === group.name) return;
    setBusy(true);
    setRenameError(null);
    try {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setRenameError(body.error ?? "Failed to rename.");
        return;
      }
      refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newMember.trim()) return;
    setBusy(true);
    setMemberError(null);
    try {
      const res = await fetch(`/api/groups/${group.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newMember.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setMemberError(body.error ?? "Failed to add member.");
        return;
      }
      setNewMember("");
      refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(username: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/groups/${group.id}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setMemberError(body.error ?? "Failed to remove member.");
        return;
      }
      const removed = group.members.find((m) => m.users.username === username);
      if (removed?.user === viewerId) {
        router.push("/groups");
        return;
      }
      refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this group? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/groups/${group.id}`, { method: "DELETE" });
      if (!res.ok) return;
      router.push("/groups");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack
      divider={<Divider sx={{ borderColor: "rgba(212,175,85,0.08)" }} />}
      spacing={4}
      sx={{
        border: "1px solid rgba(212,175,85,0.1)",
        borderRadius: 1,
        p: 4,
        background: "rgba(212,175,85,0.02)",
      }}
    >
      {isOwner && (
        <Box component="form" onSubmit={handleRename}>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#D4AF55",
              mb: 2,
            }}
          >
            Rename
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <TextField
              fullWidth
              inputProps={{ maxLength: 60 }}
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              disabled={busy || !name.trim() || name.trim() === group.name}
              type="submit"
              variant="outlined"
            >
              Save
            </Button>
          </Box>
          {renameError && (
            <Typography sx={{ color: "#CF4444", fontSize: "0.7rem", mt: 1 }}>
              {renameError}
            </Typography>
          )}
        </Box>
      )}

      <Box>
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#D4AF55",
            mb: 1,
          }}
        >
          Invite Link
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: "rgba(232,220,200,0.5)", mb: 1.5 }}>
          Anyone with this link can join the group. Share it in your group chat.
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <TextField
            fullWidth
            inputProps={{ readOnly: true, onFocus: (e) => e.currentTarget.select() }}
            size="small"
            value={inviteUrl}
          />
          <Button
            startIcon={<ContentCopyIcon fontSize="small" />}
            sx={{ whiteSpace: "nowrap" }}
            variant="outlined"
            onClick={copyInvite}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </Box>
        {isOwner && (
          <Button
            disabled={busy}
            size="small"
            sx={{ mt: 1, color: "rgba(232,220,200,0.5)" }}
            variant="text"
            onClick={handleRotateInvite}
          >
            Reset link
          </Button>
        )}
      </Box>

      <Box>
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#D4AF55",
            mb: 2,
          }}
        >
          Members
        </Typography>

        <Stack spacing={1}>
          {group.members.map((m) => {
            const isSelf = m.user === viewerId;
            const canRemove = (isOwner || isSelf) && !(m.role === "OWNER" && !isSelf);
            return (
              <Stack
                key={m.user}
                alignItems="center"
                direction="row"
                spacing={2}
                sx={{
                  px: 2,
                  py: 1,
                  border: "1px solid rgba(212,175,85,0.06)",
                  borderRadius: 1,
                }}
              >
                <UserAvatar avatarSize="32px" name={m.users.username} />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.85rem",
                      color: "#E8DCC8",
                    }}
                  >
                    {m.users.username}
                    {isSelf && (
                      <Box
                        component="span"
                        sx={{
                          fontSize: "0.65rem",
                          color: "rgba(232,220,200,0.4)",
                          ml: 1,
                        }}
                      >
                        (you)
                      </Box>
                    )}
                  </Typography>
                  {m.role === "OWNER" && (
                    <Typography
                      sx={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: "0.55rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#D4AF55",
                      }}
                    >
                      Owner
                    </Typography>
                  )}
                </Box>
                {canRemove && (
                  <Button
                    color="error"
                    disabled={busy}
                    size="small"
                    variant="text"
                    onClick={() => handleRemove(m.users.username)}
                  >
                    {isSelf ? "Leave" : "Remove"}
                  </Button>
                )}
              </Stack>
            );
          })}
        </Stack>

        {isOwner && (
          <Box component="form" sx={{ mt: 2 }} onSubmit={handleAddMember}>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <TextField
                fullWidth
                placeholder="Username"
                size="small"
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
              />
              <Button disabled={busy || !newMember.trim()} type="submit" variant="outlined">
                Add
              </Button>
            </Box>
            {memberError && (
              <Typography sx={{ color: "#CF4444", fontSize: "0.7rem", mt: 1 }}>
                {memberError}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {isOwner && (
        <Box>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#CF4444",
              mb: 2,
            }}
          >
            Danger Zone
          </Typography>
          <Button color="error" disabled={busy} variant="outlined" onClick={handleDelete}>
            Delete Group
          </Button>
        </Box>
      )}
    </Stack>
  );
}

export default GroupSettingsPanel;
