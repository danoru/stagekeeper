import HomeIcon from "@mui/icons-material/Home";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { Button, Snackbar, Alert } from "@mui/material";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Props {
  theatreId: number;
}

// Theatre pages are cached for everyone, so whether this theatre is one of the viewer's own is
// fetched here rather than rendered on the server.
function HomeTheatreButton({ theatreId }: Props) {
  const { status } = useSession();
  const [isHome, setIsHome] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    fetch("/api/user/theatres")
      .then((r) => (r.ok ? r.json() : { ids: [] }))
      .then((body: { ids?: number[] }) => {
        if (!cancelled) setIsHome((body.ids ?? []).includes(theatreId));
      })
      .catch(() => {
        if (!cancelled) setIsHome(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, theatreId]);

  if (status !== "authenticated" || isHome === null) return null;

  async function toggle() {
    const next = !isHome;
    setBusy(true);
    setIsHome(next);
    try {
      const res = await fetch("/api/user/theatres", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theatreId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setIsHome(!next);
        setError(body.error ?? "Could not update your theatres.");
      }
    } catch {
      setIsHome(!next);
      setError("Could not update your theatres.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        aria-pressed={isHome}
        disabled={busy}
        size="small"
        startIcon={isHome ? <HomeIcon /> : <HomeOutlinedIcon />}
        sx={{
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: isHome ? "#D4AF55" : "rgba(232,220,200,0.6)",
          borderColor: isHome ? "rgba(212,175,85,0.5)" : "rgba(212,175,85,0.2)",
          "&:hover": { borderColor: "#D4AF55", color: "#D4AF55" },
        }}
        variant="outlined"
        onClick={toggle}
      >
        {isHome ? "One of my theatres" : "Add to my theatres"}
      </Button>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={4000}
        open={error !== null}
        onClose={() => setError(null)}
      >
        <Alert severity="error" variant="filled" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

export default HomeTheatreButton;
