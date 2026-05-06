import { Box, Button, Link, Stack, TextField, Typography } from "@mui/material";
import type { Availability } from "@prisma/client";
import moment from "moment";
import { useRouter } from "next/router";
import { useState } from "react";

import type { Plan } from "./GroupPlans";
import UserAvatar from "../users/UserAvatar";

interface Props {
  groupId: number;
  plan: Plan;
  viewerId: number;
  isOwner: boolean;
}

const STATUSES: { value: Availability; label: string; color: string; help: string }[] = [
  { value: "GOING", label: "Going", color: "#7BC97B", help: "Committed to this date" },
  { value: "PREFER", label: "Prefer", color: "#D4AF55", help: "My top pick" },
  { value: "AVAILABLE", label: "Available", color: "#8DB3D9", help: "Could make it" },
  { value: "UNAVAILABLE", label: "Can't go", color: "#CF4444", help: "Not free" },
];

function PlanCard({ groupId, plan, viewerId, isOwner }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(plan.note ?? "");
  const [error, setError] = useState<string | null>(null);

  const prog = plan.programmings;
  const isMusical = prog.type === "MUSICAL";
  const show = isMusical ? prog.musicals : prog.plays;
  const showType = isMusical ? "musicals" : "plays";
  const slug = show ? `/${showType}/${show.title.replace(/\s+/g, "-").toLowerCase()}` : null;
  const theatre = prog.seasons?.theatres.name ?? "Theatre TBD";

  const canMutate = plan.createdBy === viewerId || isOwner;

  function refresh() {
    router.replace(router.asPath);
  }

  async function setStatus(planDateId: number, status: Availability) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/groups/${groupId}/plans/${plan.id}/dates/${planDateId}/availability`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      if (res.ok) refresh();
      else {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to set availability.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function clearStatus(planDateId: number) {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/groups/${groupId}/plans/${plan.id}/dates/${planDateId}/availability`,
        { method: "DELETE" }
      );
      if (res.ok) refresh();
    } finally {
      setBusy(false);
    }
  }

  async function confirmDate(planDateId: number) {
    if (!confirm("Lock this in as the group's date?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", planDateId }),
      });
      if (res.ok) refresh();
    } finally {
      setBusy(false);
    }
  }

  async function reopen() {
    setBusy(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reopen" }),
      });
      if (res.ok) refresh();
    } finally {
      setBusy(false);
    }
  }

  async function removeDate(planDateId: number) {
    if (!confirm("Remove this date from the poll?")) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/groups/${groupId}/plans/${plan.id}/dates/${planDateId}`,
        { method: "DELETE" }
      );
      if (res.ok) refresh();
    } finally {
      setBusy(false);
    }
  }

  async function addDate() {
    if (!newDate) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/groups/${groupId}/plans/${plan.id}/dates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: new Date(newDate).toISOString() }),
      });
      if (res.ok) {
        setNewDate("");
        setAdding(false);
        refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to add date.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function saveNote() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/groups/${groupId}/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateNote", note: noteDraft }),
      });
      if (res.ok) {
        setEditingNote(false);
        refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to update note.");
      }
    } finally {
      setBusy(false);
    }
  }

  function cancelEditNote() {
    setNoteDraft(plan.note ?? "");
    setEditingNote(false);
    setError(null);
  }

  async function deletePlan() {
    if (!confirm("Delete this plan entirely?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/plans/${plan.id}`, {
        method: "DELETE",
      });
      if (res.ok) refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box
      sx={{
        border: "1px solid rgba(212,175,85,0.12)",
        borderRadius: 1,
        p: 2.5,
        background: "rgba(212,175,85,0.02)",
      }}
    >
      <Stack
        alignItems={{ xs: "flex-start", sm: "center" }}
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ mb: 1.5 }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {slug && show ? (
            <Link
              href={slug}
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#E8DCC8",
                "&:hover": { color: "#D4AF55" },
              }}
              underline="none"
            >
              {show.title}
            </Link>
          ) : (
            <Typography
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#E8DCC8",
              }}
            >
              Untitled show
            </Typography>
          )}
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.7rem",
              letterSpacing: "0.04em",
              color: "rgba(212,175,85,0.7)",
              mt: 0.25,
            }}
          >
            {theatre} ·{" "}
            {plan.status === "POLLING"
              ? "Polling"
              : plan.status === "CONFIRMED" && plan.selected
                ? `Confirmed for ${moment(plan.selected.startTime).format(
                    "ddd, MMM D · h:mm A"
                  )}`
                : "Canceled"}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.62rem",
              color: "rgba(232,220,200,0.4)",
              mt: 0.5,
            }}
          >
            Proposed by {plan.users.username}
          </Typography>
        </Box>
        {canMutate && (
          <Stack direction="row" spacing={1}>
            {plan.status === "CONFIRMED" && (
              <Button
                disabled={busy}
                onClick={reopen}
                size="small"
                sx={{ fontSize: "0.65rem" }}
                variant="text"
              >
                Reopen
              </Button>
            )}
            <Button
              color="error"
              disabled={busy}
              onClick={deletePlan}
              size="small"
              sx={{ fontSize: "0.65rem" }}
              variant="text"
            >
              Delete
            </Button>
          </Stack>
        )}
      </Stack>

      {editingNote ? (
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            inputProps={{ maxLength: 500 }}
            multiline
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Add a note (optional)"
            rows={2}
            size="small"
            sx={{ mb: 1 }}
            value={noteDraft}
          />
          <Stack direction="row" spacing={1}>
            <Button
              disabled={busy}
              onClick={saveNote}
              size="small"
              sx={{ fontSize: "0.65rem" }}
              variant="outlined"
            >
              Save
            </Button>
            <Button
              disabled={busy}
              onClick={cancelEditNote}
              size="small"
              sx={{ fontSize: "0.65rem", color: "rgba(232,220,200,0.5)" }}
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      ) : (
        (plan.note || canMutate) && (
          <Box sx={{ mb: 2 }}>
            {plan.note && (
              <Typography
                sx={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontStyle: "italic",
                  fontSize: "0.85rem",
                  color: "rgba(232,220,200,0.6)",
                  pl: 1.5,
                  borderLeft: "2px solid rgba(212,175,85,0.2)",
                }}
              >
                &ldquo;{plan.note}&rdquo;
              </Typography>
            )}
            {canMutate && (
              <Button
                onClick={() => setEditingNote(true)}
                size="small"
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(212,175,85,0.7)",
                  mt: plan.note ? 0.5 : 0,
                  ml: plan.note ? 1.5 : 0,
                  px: 0,
                  minWidth: 0,
                }}
              >
                {plan.note ? "Edit note" : "+ Add note"}
              </Button>
            )}
          </Box>
        )
      )}

      <Stack spacing={1}>
        {plan.dates.map((date) => (
          <DateRow
            key={date.id}
            busy={busy}
            canMutateDate={canMutate || date.proposedBy === viewerId}
            isSelected={plan.selectedDate === date.id}
            onClearStatus={() => clearStatus(date.id)}
            onConfirm={canMutate && plan.status === "POLLING" ? () => confirmDate(date.id) : null}
            onRemove={() => removeDate(date.id)}
            onSetStatus={(status) => setStatus(date.id, status)}
            planDate={date}
            viewerId={viewerId}
          />
        ))}
      </Stack>

      {plan.status === "POLLING" && (
        <Box sx={{ mt: 1.5 }}>
          {adding ? (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                InputLabelProps={{ shrink: true }}
                label="Date / time"
                onChange={(e) => setNewDate(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
                type="datetime-local"
                value={newDate}
              />
              <Button disabled={busy || !newDate} onClick={addDate} variant="outlined">
                Add
              </Button>
              <Button
                onClick={() => {
                  setAdding(false);
                  setNewDate("");
                }}
                size="small"
                sx={{ color: "rgba(232,220,200,0.5)" }}
              >
                Cancel
              </Button>
            </Box>
          ) : (
            <Button
              onClick={() => setAdding(true)}
              size="small"
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.62rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(212,175,85,0.7)",
              }}
            >
              + Suggest another date
            </Button>
          )}
        </Box>
      )}

      {error && (
        <Typography sx={{ color: "#CF4444", fontSize: "0.7rem", mt: 1 }}>{error}</Typography>
      )}
    </Box>
  );
}

interface DateRowProps {
  planDate: Plan["dates"][number];
  viewerId: number;
  busy: boolean;
  isSelected: boolean;
  canMutateDate: boolean;
  onSetStatus: (status: Availability) => void;
  onClearStatus: () => void;
  onConfirm: (() => void) | null;
  onRemove: () => void;
}

function DateRow({
  planDate,
  viewerId,
  busy,
  isSelected,
  canMutateDate,
  onSetStatus,
  onClearStatus,
  onConfirm,
  onRemove,
}: DateRowProps) {
  const myVote = planDate.availability.find((a) => a.user === viewerId);

  const counts = { GOING: 0, PREFER: 0, AVAILABLE: 0, UNAVAILABLE: 0 } as Record<
    Availability,
    number
  >;
  for (const a of planDate.availability) counts[a.status]++;

  return (
    <Box
      sx={{
        border: isSelected
          ? "1px solid rgba(123,201,123,0.5)"
          : "1px solid rgba(212,175,85,0.08)",
        borderRadius: 1,
        p: 1.5,
        background: isSelected ? "rgba(123,201,123,0.04)" : "transparent",
      }}
    >
      <Stack
        alignItems={{ xs: "flex-start", sm: "center" }}
        direction={{ xs: "column", sm: "row" }}
        spacing={1.25}
        sx={{ mb: 1 }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "#E8DCC8",
            }}
          >
            {moment(planDate.startTime).format("ddd, MMM D · h:mm A")}
            {isSelected && (
              <Box
                component="span"
                sx={{
                  ml: 1.25,
                  px: 0.75,
                  py: 0.2,
                  fontSize: "0.55rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#7BC97B",
                  border: "1px solid rgba(123,201,123,0.4)",
                  borderRadius: 0.5,
                }}
              >
                Selected
              </Box>
            )}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.62rem",
              letterSpacing: "0.04em",
              color: "rgba(232,220,200,0.4)",
              mt: 0.25,
            }}
          >
            {STATUSES.filter((s) => counts[s.value] > 0)
              .map((s) => `${counts[s.value]} ${s.label.toLowerCase()}`)
              .join(" · ") || "No votes yet"}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {onConfirm && (
            <Button
              disabled={busy}
              onClick={onConfirm}
              size="small"
              sx={{
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#7BC97B",
                border: "1px solid rgba(123,201,123,0.3)",
                "&:hover": { borderColor: "#7BC97B", background: "rgba(123,201,123,0.08)" },
              }}
            >
              Lock in
            </Button>
          )}
          {canMutateDate && !isSelected && (
            <Button
              color="error"
              disabled={busy}
              onClick={onRemove}
              size="small"
              sx={{ fontSize: "0.6rem" }}
              variant="text"
            >
              Remove
            </Button>
          )}
        </Stack>
      </Stack>

      <Stack direction="row" spacing={0.75} sx={{ mb: 1.25, flexWrap: "wrap", rowGap: 0.75 }}>
        {STATUSES.map((s) => {
          const active = myVote?.status === s.value;
          return (
            <Button
              key={s.value}
              disabled={busy}
              onClick={() => (active ? onClearStatus() : onSetStatus(s.value))}
              size="small"
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: active ? s.color : "rgba(232,220,200,0.5)",
                border: "1px solid",
                borderColor: active ? s.color : "rgba(212,175,85,0.15)",
                background: active ? `${s.color}15` : "transparent",
                "&:hover": { borderColor: s.color, background: `${s.color}10` },
              }}
              title={s.help}
            >
              {s.label}
            </Button>
          );
        })}
      </Stack>

      <Stack direction="row" flexWrap="wrap" spacing={2}>
        {STATUSES.map((s) => {
          const list = planDate.availability.filter((a) => a.status === s.value);
          if (list.length === 0) return null;
          return (
            <Box key={s.value}>
              <Typography
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "0.5rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: s.color,
                  mb: 0.5,
                }}
              >
                {s.label}
              </Typography>
              <Stack direction="row" spacing={-0.5}>
                {list.map((a) => (
                  <Box key={a.user} sx={{ ml: -0.25 }} title={a.users.username}>
                    <UserAvatar avatarSize="24px" name={a.users.username} />
                  </Box>
                ))}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

export default PlanCard;
