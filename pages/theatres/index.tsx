import { Box, Container, Pagination, Typography } from "@mui/material";
import { theatres } from "@prisma/client";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import superjson from "superjson";

import TheatreCard from "../../src/components/cards/TheatreCard";
import SearchBar from "../../src/components/ui/SearchBar";
import { getTheatres } from "../../src/data/theatres";

interface Props {
  theatres: theatres[];
}

const itemsPerPage = 8;

function TheatresPage({ theatres }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return theatres;
    return theatres.filter(
      (t) =>
        t.name.toLowerCase().includes(q) || (t.location ?? "").toLowerCase().includes(q)
    );
  }, [theatres, search]);

  const isSearching = search.trim().length > 0;
  const visible = isSearching
    ? filtered
    : filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const countLabel = isSearching
    ? `${filtered.length} of ${theatres.length} matching`
    : `${theatres.length} venues`;

  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>Theatres • StageKeeper</title>
      </Head>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
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
            All Theatres
          </Typography>
          <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.62rem",
              letterSpacing: "0.1em",
              color: "rgba(232,220,200,0.3)",
              whiteSpace: "nowrap",
            }}
          >
            {countLabel}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <SearchBar
            placeholder="Search by name or location…"
            value={search}
            onChange={setSearch}
          />
        </Box>

        {visible.length === 0 ? (
          <Box
            sx={{
              border: "1px solid rgba(212,175,85,0.08)",
              borderRadius: 1,
              py: 5,
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
                color: "rgba(232,220,200,0.35)",
              }}
            >
              No theatres match &ldquo;{search}&rdquo;.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 0 }}>
            {visible.map((theatre) => (
              <TheatreCard
                key={theatre.id}
                image={theatre.image}
                link={`/theatres/${theatre.name.replace(/\s+/g, "-").toLowerCase()}`}
                name={theatre.name}
              />
            ))}
          </Box>
        )}

        {!isSearching && filtered.length > itemsPerPage && (
          <Pagination
            count={Math.ceil(filtered.length / itemsPerPage)}
            page={page}
            sx={{
              mt: 4,
              display: "flex",
              justifyContent: "center",
              "& .MuiPaginationItem-root": {
                color: "rgba(232,220,200,0.5)",
                borderColor: "rgba(212,175,85,0.2)",
                "&.Mui-selected": {
                  background: "rgba(212,175,85,0.15)",
                  color: "#D4AF55",
                  borderColor: "rgba(212,175,85,0.4)",
                },
                "&:hover": { background: "rgba(212,175,85,0.08)" },
              },
            }}
            onChange={(_, value) => setPage(value)}
          />
        )}
      </Container>
    </Box>
  );
}

export async function getStaticProps() {
  const theatres = await getTheatres();
  return {
    props: superjson.serialize({ theatres }).json,
    revalidate: 3600,
  };
}

export default TheatresPage;
