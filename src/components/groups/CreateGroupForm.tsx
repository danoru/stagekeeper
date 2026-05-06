import { Box, Button, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";

function CreateGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to create group.");
        return;
      }
      const { group } = await res.json();
      router.push(`/groups/${group.id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create group.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        border: "1px solid rgba(212,175,85,0.1)",
        borderRadius: 1,
        p: 3,
        background: "rgba(212,175,85,0.02)",
      }}
    >
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
        Create a Group
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
        <TextField
          fullWidth
          inputProps={{ maxLength: 60 }}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          size="small"
          value={name}
        />
        <Button disabled={submitting || !name.trim()} type="submit" variant="outlined">
          Create
        </Button>
      </Box>
      {error && (
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.7rem",
            color: "#CF4444",
            mt: 1.5,
          }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default CreateGroupForm;
