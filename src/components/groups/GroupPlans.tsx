import { Box, Button, Stack, Typography } from "@mui/material";
import type {
  Availability,
  groupPlan,
  groupPlanAvailability,
  groupPlanDate,
  musicals,
  plays,
  PlanStatus,
  programming,
  seasons,
  theatres,
} from "@prisma/client";
import { useState } from "react";

import CreatePlanForm from "./CreatePlanForm";
import PlanCard from "./PlanCard";

type DateRow = groupPlanDate & {
  users: { id: number; username: string; image: string | null };
  availability: (groupPlanAvailability & {
    users: { id: number; username: string; image: string | null };
  })[];
};

export type Plan = groupPlan & {
  programmings: programming & {
    musicals: musicals | null;
    plays: plays | null;
    seasons: (seasons & { theatres: theatres }) | null;
  };
  users: { id: number; username: string; image: string | null };
  selected: groupPlanDate | null;
  dates: DateRow[];
};

export type ProgrammingOption = programming & {
  musicals: musicals | null;
  plays: plays | null;
  seasons: (seasons & { theatres: theatres }) | null;
};

interface Props {
  groupId: number;
  plans: Plan[];
  programmingOptions: ProgrammingOption[];
  viewerId: number;
  isOwner: boolean;
}

function GroupPlans({ groupId, plans, programmingOptions, viewerId, isOwner }: Props) {
  const [creating, setCreating] = useState(false);

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
          onClick={() => setCreating((c) => !c)}
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
        >
          {creating ? "Cancel" : "Propose a show"}
        </Button>
      </Box>

      {creating && (
        <Box sx={{ mb: 2.5 }}>
          <CreatePlanForm
            groupId={groupId}
            onCreated={() => setCreating(false)}
            programmingOptions={programmingOptions}
          />
        </Box>
      )}

      {plans.length === 0 ? (
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
            No plans yet.
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
          {plans.map((plan) => (
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
    </>
  );
}

export type { Availability, PlanStatus };

export default GroupPlans;
