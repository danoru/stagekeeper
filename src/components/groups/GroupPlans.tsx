import { Alert, Box, Button, Snackbar, Stack, Typography } from "@mui/material";
import type {
  Availability,
  groupPlan,
  groupPlanAvailability,
  groupPlanDate,
  PlanStatus,
  programming,
} from "@prisma/client";
import { useMemo, useState } from "react";

import type { ShowSummary, TheatreSummary } from "../../data/performances";

import CreatePlanForm from "./CreatePlanForm";
import PlanCard from "./PlanCard";

type DateRow = groupPlanDate & {
  users: { id: number; username: string; image: string | null };
  availability: (groupPlanAvailability & {
    users: { id: number; username: string; image: string | null };
  })[];
};

export type ProgrammingOption = programming & {
  musicals: ShowSummary | null;
  plays: ShowSummary | null;
  seasons: { id: number; name: string; theatres: TheatreSummary } | null;
};

export type Plan = groupPlan & {
  programmings: ProgrammingOption;
  users: { id: number; username: string; image: string | null };
  selected: groupPlanDate | null;
  dates: DateRow[];
};

/**
 * A plan is over once its showtime has passed: the picked date if one was chosen,
 * otherwise the last candidate date, otherwise the end of the show's run.
 * Canceled plans are history as well.
 */
export function isPastPlan(plan: Plan, now: Date = new Date()): boolean {
  if (plan.status === "CANCELED") return true;
  // Dates arrive as ISO strings after superjson's `.json` half.
  if (plan.selected) return new Date(plan.selected.startTime) < now;
  if (plan.dates.length > 0) {
    return plan.dates.every((d) => new Date(d.startTime) < now);
  }
  return new Date(plan.programmings.endDate) < now;
}

/** Sort key for a plan: its picked date, else its last candidate, else the run's end. */
function planTime(plan: Plan): number {
  if (plan.selected) return new Date(plan.selected.startTime).getTime();
  if (plan.dates.length > 0) {
    return Math.max(...plan.dates.map((d) => new Date(d.startTime).getTime()));
  }
  return new Date(plan.programmings.endDate).getTime();
}

interface Props {
  groupId: number;
  plans: Plan[];
  programmingOptions: ProgrammingOption[];
  viewerId: number;
  isOwner: boolean;
}

function GroupPlans({ groupId, plans, programmingOptions, viewerId, isOwner }: Props) {
  const [creating, setCreating] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const upcoming: Plan[] = [];
    const past: Plan[] = [];
    for (const plan of plans) (isPastPlan(plan, now) ? past : upcoming).push(plan);
    // Most recent outing first.
    past.sort((a, b) => planTime(b) - planTime(a));
    return { upcoming, past };
  }, [plans]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  function handleCreateResult(result: { ok: true } | { ok: false; error: string }) {
    if (result.ok) {
      setCreating(false);
      setSnackbar({ open: true, message: "Plan proposed.", severity: "success" });
    } else {
      setSnackbar({ open: true, message: result.error, severity: "error" });
    }
  }

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#D4AF55",
            whiteSpace: "nowrap",
          }}
        >
          Plans
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
        <Button
          size="small"
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.62rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#D4AF55",
            border: "1px solid rgba(212,175,85,0.3)",
            "&:hover": {
              borderColor: "rgba(212,175,85,0.6)",
              background: "rgba(212,175,85,0.06)",
            },
          }}
          onClick={() => setCreating((c) => !c)}
        >
          {creating ? "Cancel" : "Propose a show"}
        </Button>
      </Box>

      {creating && (
        <Box sx={{ mb: 2.5 }}>
          <CreatePlanForm
            groupId={groupId}
            programmingOptions={programmingOptions}
            onResult={handleCreateResult}
          />
        </Box>
      )}

      {upcoming.length === 0 ? (
        <Box
          sx={{
            border: "1px solid rgba(212,175,85,0.08)",
            borderRadius: 1,
            py: 4,
            px: 3,
            textAlign: "center",
            background: "rgba(212,175,85,0.02)",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: "1rem",
              color: "rgba(232,220,200,0.3)",
              mb: 0.5,
            }}
          >
            {past.length > 0 ? "Nothing on the calendar." : "No plans yet."}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.7rem",
              color: "rgba(232,220,200,0.2)",
              letterSpacing: "0.04em",
            }}
          >
            Propose a show with a few candidate dates and members can vote.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {upcoming.map((plan) => (
            <PlanCard
              key={plan.id}
              groupId={groupId}
              isOwner={isOwner}
              plan={plan}
              viewerId={viewerId}
            />
          ))}
        </Stack>
      )}

      {past.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: showPast ? 2.5 : 0 }}>
            <Typography
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.62rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(232,220,200,0.35)",
                whiteSpace: "nowrap",
              }}
            >
              Past outings
            </Typography>
            <Box sx={{ flex: 1, height: "1px", background: "rgba(232,220,200,0.08)" }} />
            <Button
              size="small"
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.62rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(232,220,200,0.45)",
              }}
              onClick={() => setShowPast((v) => !v)}
            >
              {showPast ? "Hide" : `Show ${past.length}`}
            </Button>
          </Box>
          {showPast && (
            <Stack spacing={2} sx={{ opacity: 0.8 }}>
              {past.map((plan) => (
                <PlanCard
                  key={plan.id}
                  isPast
                  groupId={groupId}
                  isOwner={isOwner}
                  plan={plan}
                  viewerId={viewerId}
                />
              ))}
            </Stack>
          )}
        </Box>
      )}

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={5000}
        open={snackbar.open}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export type { Availability, PlanStatus };

export default GroupPlans;
