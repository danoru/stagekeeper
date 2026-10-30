import { Box, Chip, Container, Link, Stack, Typography } from "@mui/material";
import moment from "moment";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import superjson from "superjson";

import PageMeta from "../../src/components/layout/PageMeta";
import { describePart } from "../../src/components/people/creditText";
import PendingNotice from "../../src/components/shows/PendingNotice";
import { getPersonBySlug, getPersonCredits, type PersonProduction } from "../../src/data/people";
import { resolveShowImage } from "../../src/utils/gradients";
import { showPath, theatrePath } from "../../src/utils/slug";

interface Props {
  person: { id: number; name: string; slug: string; bio: string | null; status: string };
  current: PersonProduction[];
  past: PersonProduction[];
}

const eyebrowSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#D4AF55",
  whiteSpace: "nowrap",
} as const;

function Section({ label, items }: { label: string; items: PersonProduction[] }) {
  if (items.length === 0) return null;
  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography component="h2" sx={eyebrowSx}>
          {label}
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
      </Box>
      <Stack spacing={1.25}>
        {items.map((item) => (
          <CreditRow key={item.production.id} item={item} />
        ))}
      </Stack>
    </Box>
  );
}

function CreditRow({ item }: { item: PersonProduction }) {
  const { production, parts, seenByViewer } = item;
  const show = production.musicals ?? production.plays;
  if (!show) return null;
  const segment = production.musicals ? "musicals" : "plays";
  const theatre = production.seasons?.theatres;
  const { isGradient, value } = resolveShowImage(show.playbill, show.title);

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "center",
        p: 1.5,
        border: "1px solid rgba(212,175,85,0.1)",
        borderRadius: 1,
        background: "rgba(212,175,85,0.02)",
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 44,
          height: 60,
          flexShrink: 0,
          borderRadius: 0.5,
          background: isGradient ? value : `center / cover no-repeat url("${value}")`,
        }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Link href={showPath(segment, show.title)} sx={{ color: "rgba(232,220,200,0.95)" }}>
          {show.title}
        </Link>
        <Typography sx={{ fontSize: "0.85rem", color: "#D4AF55" }}>
          {parts.map(describePart).join(" · ")}
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: "rgba(232,220,200,0.5)" }}>
          {theatre ? (
            <Link href={theatrePath(theatre.name)} sx={{ color: "inherit" }} underline="hover">
              {theatre.name}
            </Link>
          ) : (
            "Theatre TBD"
          )}
          {` · ${moment.utc(production.startDate).format("MMM D")} – ${moment
            .utc(production.endDate)
            .format("MMM D, YYYY")}`}
        </Typography>
      </Box>
      {seenByViewer && (
        <Chip
          label="You saw this"
          size="small"
          sx={{ borderColor: "rgba(80,203,120,0.5)", color: "#50CB78" }}
          variant="outlined"
        />
      )}
    </Box>
  );
}

function PersonPage({ person, current, past }: Props) {
  const total = current.length + past.length;
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageMeta
        description={`${person.name}'s stage credits${total ? ` across ${total} production${total === 1 ? "" : "s"}` : ""} on StageKeeper.`}
        path={`/people/${person.slug}`}
        title={person.name}
      />
      <Typography color="secondary" component="h1" variant="h4">
        {person.name}
      </Typography>
      {person.status === "PENDING" && <PendingNotice />}
      {person.bio && (
        <Typography sx={{ mt: 1, color: "rgba(232,220,200,0.7)" }}>{person.bio}</Typography>
      )}
      <Section items={current} label="Now & Upcoming" />
      <Section items={past} label="Past Productions" />
      {total === 0 && (
        <Typography sx={{ mt: 4, fontStyle: "italic", color: "rgba(232,220,200,0.5)" }}>
          No confirmed credits yet.
        </Typography>
      )}
    </Container>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const slug = String(context.params?.slug ?? "");
  const person = await getPersonBySlug(slug);
  const session = await getSession(context);
  const isAdmin = session?.user.badge === "ADMIN";
  // Unconfirmed people stay hidden until an admin approves one of their credits.
  if (!person || (person.status === "PENDING" && !isAdmin)) return { notFound: true };

  const { current, past } = await getPersonCredits(
    person.id,
    session ? Number(session.user.id) : null
  );
  return {
    props: superjson.serialize({ person, current, past }).json,
  };
}

export default PersonPage;
