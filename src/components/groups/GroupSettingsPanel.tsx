import { Box, Button, Divider, Stack, TextField, Typography } from "@mui/material";
import type { GroupRole, users } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";

import UserAvatar from "../users/UserAvatar";

interface Member {
  user: number;
  role: GroupRole;
  users: users;
}

interface Group {
  id: number;
  name: string;
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
              onChange={(e) => setName(e.target.value)}
              size="small"
              value={name}
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
                    onClick={() => handleRemove(m.users.username)}
                    size="small"
                    variant="text"
                  >
                    {isSelf ? "Leave" : "Remove"}
                  </Button>
                )}
              </Stack>
            );
          })}
        </Stack>

        {isOwner && (
          <Box component="form" onSubmit={handleAddMember} sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <TextField
                fullWidth
                onChange={(e) => setNewMember(e.target.value)}
                placeholder="Username"
                size="small"
                value={newMember}
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
          <Button color="error" disabled={busy} onClick={handleDelete} variant="outlined">
            Delete Group
          </Button>
        </Box>
      )}
    </Stack>
  );
}

export default GroupSettingsPanel;
