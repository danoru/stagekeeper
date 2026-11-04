import { Alert, Box, Button, Chip, Link as MuiLink, Stack, Typography } from "@mui/material";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

import AdminGuard from "../../src/components/admin/AdminGuard";
import type { OpenReport } from "../../src/data/reports";

const TARGET_LABELS: Record<OpenReport["targetType"], string> = {
  MUSICAL: "Musical",
  PLAY: "Play",
  THEATRE: "Theatre",
  PERSON: "Person",
  USER: "Member",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<OpenReport[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/reports")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load."))))
      .then(setReports)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function resolve(id: number) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        setError("Couldn't update that report.");
        return;
      }
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminGuard>
      <Head>
        <title>Reports • Admin • StageKeeper</title>
      </Head>
      <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, px: 2, pb: 6 }}>
        <Typography gutterBottom variant="h4">
          Reports
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }} variant="body2">
          Things members flagged. Fix or remove the content from its own admin page, then mark the
          report handled.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {reports?.length === 0 && <Alert severity="success">No open reports.</Alert>}

        <Stack spacing={2}>
          {reports?.map((r) => (
            <Box
              key={r.id}
              sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
            >
              <Stack
                alignItems={{ sm: "center" }}
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                spacing={1}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Stack alignItems="center" direction="row" spacing={1}>
                    <Chip label={TARGET_LABELS[r.targetType]} size="small" variant="outlined" />
                    {r.href ? (
                      <MuiLink href={r.href} rel="noreferrer" target="_blank">
                        {r.label}
                      </MuiLink>
                    ) : (
                      <Typography component="span">{`${r.label} (removed)`}</Typography>
                    )}
                  </Stack>
                  <Typography sx={{ mt: 0.5 }} variant="body2">
                    {r.reason}
                  </Typography>
                  {r.details && (
                    <Typography
                      color="text.secondary"
                      sx={{ overflowWrap: "anywhere" }}
                      variant="body2"
                    >
                      {r.details}
                    </Typography>
                  )}
                  <Typography color="text.secondary" variant="caption">
                    {`${r.users?.username ?? "A deleted member"} · ${new Date(r.createdAt).toLocaleDateString()}`}
                  </Typography>
                </Box>
                <Button
                  disabled={busy}
                  size="small"
                  variant="outlined"
                  onClick={() => resolve(r.id)}
                >
                  Mark handled
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </AdminGuard>
  );
}
