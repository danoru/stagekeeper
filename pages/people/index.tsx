import { Box, Container, Link, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import PageMeta from "../../src/components/layout/PageMeta";
import type { PersonSearchResult } from "../../src/data/people";

function PeoplePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PersonSearchResult[] | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/people/search?q=${encodeURIComponent(q)}`)
        .then((r) => (r.ok ? r.json() : []))
        .then(setResults)
        .catch(() => setResults([]));
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <PageMeta
        description="Look up local performers and creatives and see every production they've been in."
        path="/people"
        title="People"
      />
      <Typography color="secondary" component="h1" sx={{ mb: 1 }} variant="h4">
        People
      </Typography>
      <Typography sx={{ mb: 3, color: "rgba(232,220,200,0.6)" }}>
        Look up a performer, director or designer to see their credits.
      </Typography>
      <TextField
        autoFocus
        fullWidth
        inputProps={{ "aria-label": "Search people" }}
        placeholder="Search by name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Stack spacing={1} sx={{ mt: 2 }}>
        {results?.length === 0 && (
          <Typography sx={{ fontStyle: "italic", color: "rgba(232,220,200,0.5)" }}>
            No one by that name yet. Credits are added from show pages by people who saw the
            production.
          </Typography>
        )}
        {results?.map((p) => (
          <Box
            key={p.id}
            sx={{ px: 2, py: 1.25, border: "1px solid rgba(212,175,85,0.1)", borderRadius: 1 }}
          >
            <Link href={`/people/${p.slug}`} sx={{ color: "rgba(232,220,200,0.95)" }}>
              {p.name}
            </Link>
            <Typography sx={{ fontSize: "0.78rem", color: "rgba(232,220,200,0.5)" }}>
              {[p.latest, `${p.credits} credit${p.credits === 1 ? "" : "s"}`]
                .filter(Boolean)
                .join(" · ")}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Container>
  );
}

export default PeoplePage;
