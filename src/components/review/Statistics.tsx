import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import type { attendance, musicals, performances, plays, theatres } from "@prisma/client";
import moment from "moment";
import Image from "next/image";

import LocationsChart from "./LocationsChart";
import MonthlyAttendanceChart from "./MonthlyAttendance";
import PerformanceByPremiereChart from "./PerformanceByPremiere";

interface Props {
  stats: (attendance & {
    performances: performances & { musicals: musicals; plays: plays; theatres: theatres };
  })[];
  view: "allTime" | "year";
  year?: string;
}

// ---- Section header matching site-wide gold label style ----
function SectionDivider({ label }: { label: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 5 }}>
      <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
      <Typography
        sx={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.6rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#D4AF55",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.2)" }} />
    </Box>
  );
}

// ---- Spotlight card: playbill image + info, alternating left/right layout ----
function SpotlightCard({
  title,
  theatre,
  location,
  date,
  playbill,
  headline,
  subtext,
  reverse = false,
}: {
  title: string;
  theatre: string;
  location: string;
  date: string;
  playbill: string;
  headline: string;
  subtext: string;
  reverse?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: reverse ? "row-reverse" : "row" },
        gap: 4,
        alignItems: { xs: "flex-start", md: "center" },
        p: 4,
        border: "1px solid rgba(212,175,85,0.1)",
        borderRadius: 1,
        background: "rgba(212,175,85,0.02)",
        mb: 3,
      }}
    >
      {/* Playbill */}
      <Box sx={{ flexShrink: 0 }}>
        <Box
          sx={{
            position: "relative",
            width: 130,
            height: 172,
            border: "1px solid rgba(212,175,85,0.2)",
            borderRadius: 0.5,
            overflow: "hidden",
          }}
        >
          {playbill ? (
            <Image alt={title} fill src={playbill} style={{ objectFit: "cover" }} />
          ) : (
            <Box sx={{ width: "100%", height: "100%", background: "rgba(212,175,85,0.05)" }} />
          )}
          {/* Gold top line */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, transparent, rgba(212,175,85,0.5), transparent)",
            }}
          />
        </Box>
      </Box>

      {/* Text */}
      <Box>
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.6rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#D4AF55",
            mb: 1,
          }}
        >
          {headline}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: { xs: "1.6rem", md: "2.2rem" },
            fontWeight: 600,
            color: "#E8DCC8",
            lineHeight: 1.1,
            mb: 1.5,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: "italic",
            fontSize: "1rem",
            color: "rgba(232,220,200,0.55)",
            lineHeight: 1.7,
          }}
        >
          {subtext}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
          {[theatre, location, date].map((item) => (
            <Typography
              key={item}
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.68rem",
                letterSpacing: "0.06em",
                color: "rgba(212,175,85,0.6)",
              }}
            >
              {item}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// ---- Chart wrapper with consistent label ----
function ChartSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        border: "1px solid rgba(212,175,85,0.1)",
        borderRadius: 1,
        background: "rgba(212,175,85,0.02)",
        mb: 3,
      }}
    >
      <Typography
        sx={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.6rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#D4AF55",
          mb: 2,
        }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );
}

function Statistics({ stats, view, year }: Props) {
  const hasData = stats.length > 0;

  const getPerformanceTitle = (stat: (typeof stats)[0]) =>
    stat.performances.musicals?.title || stat.performances.plays?.title || "N/A";

  const getPerformancePremiere = (stat: (typeof stats)[0]) =>
    moment(
      stat.performances.musicals?.premiere || stat.performances.plays?.premiere || null
    ).year();

  const getPlaybill = (stat: (typeof stats)[0]) =>
    stat.performances.musicals?.playbill || stat.performances.plays?.playbill || "";

  const firstPerformance = hasData
    ? stats.reduce((a, b) => (a.performances.startTime < b.performances.startTime ? a : b))
    : null;

  const latestPerformance = hasData
    ? stats.reduce((a, b) => (a.performances.startTime > b.performances.startTime ? a : b))
    : null;

  const oldestPerformance = hasData
    ? stats.reduce((a, b) => {
        const pA = getPerformancePremiere(a) ?? new Date().getFullYear();
        const pB = getPerformancePremiere(b) ?? new Date().getFullYear();
        return pA < pB ? a : b;
      })
    : null;

  const newestPerformance = hasData
    ? stats.reduce((a, b) => {
        const pA = getPerformancePremiere(a) ?? 1066;
        const pB = getPerformancePremiere(b) ?? 1066;
        return pA > pB ? a : b;
      })
    : null;

  const locationOccurrence: Record<string, number> = {};
  stats.forEach((stat) => {
    const loc = stat.performances.theatres.location;
    locationOccurrence[loc] = (locationOccurrence[loc] ?? 0) + 1;
  });
  const mostVisitedLocation =
    Object.keys(locationOccurrence).length > 0
      ? Object.keys(locationOccurrence).reduce((a, b) =>
          locationOccurrence[a] > locationOccurrence[b] ? a : b
        )
      : null;
  const numberOfLocations = Object.keys(locationOccurrence).length;

  const premieres = stats.map((s) => getPerformancePremiere(s)).filter(Boolean) as number[];
  const premiereAverage =
    premieres.length > 0 ? Math.round(premieres.reduce((a, b) => a + b, 0) / premieres.length) : 0;
  const averagePerformanceAge = new Date().getFullYear() - premiereAverage;

  function performanceTaste(y: number) {
    if (y < 1920) return "Vaudeville";
    if (y < 1940) return "The Jazz Age";
    if (y < 1960) return "The Golden Age";
    if (y < 1970) return "The Post-Golden Age";
    if (y < 2000) return "Pre-Contemporary";
    if (y < 2020) return "Contemporary";
    return "Current";
  }

  function performanceTasteDescription(y: number) {
    const era = performanceTaste(y);
    const descriptions: Record<string, string> = {
      Vaudeville:
        "A time of variety acts and early theatre, where spectacle and showmanship took center stage.",
      "The Jazz Age":
        "A period of experimentation and innovation, marked by bold storytelling and new styles.",
      "The Golden Age":
        "Classic theatre at its finest, with timeless works that defined their genres.",
      "The Post-Golden Age":
        "A transitional period exploring new themes and shifting audience expectations.",
      "Pre-Contemporary":
        "A mix of blockbuster hits and boundary-pushing works, setting the stage for modern theatre.",
      Contemporary:
        "Performances that embrace diverse styles, fresh narratives, and innovative staging techniques.",
      Current:
        "The evolving landscape of theatre today, where genre-blending is redefining the art form.",
    };
    return descriptions[era] || "An undefined era of theatre.";
  }

  const performanceEra = performanceTaste(premiereAverage);
  const performanceEraDescription = performanceTasteDescription(premiereAverage);

  const monthlyOccurrence: Record<string, { musicals: number; plays: number }> = {};
  stats.forEach((stat) => {
    const month = moment(stat.performances.startTime).format("MMMM");
    if (!monthlyOccurrence[month]) monthlyOccurrence[month] = { musicals: 0, plays: 0 };
    if (stat.performances.musicals?.title) monthlyOccurrence[month].musicals++;
    if (stat.performances.plays?.title) monthlyOccurrence[month].plays++;
  });
  const mostVisitsPerMonth =
    Object.keys(monthlyOccurrence).length > 0
      ? Object.keys(monthlyOccurrence).reduce((a, b) =>
          monthlyOccurrence[a].musicals + monthlyOccurrence[a].plays >
          monthlyOccurrence[b].musicals + monthlyOccurrence[b].plays
            ? a
            : b
        )
      : null;

  const getYearText = () => (view === "allTime" ? "of All Time" : `of ${year}`);
  const getAdverbText = () => (view === "allTime" ? "" : `in ${year}`);

  if (!hasData) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: "center" }}>
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: "italic",
            fontSize: "1.1rem",
            color: "rgba(232,220,200,0.3)",
          }}
        >
          No performances recorded {view === "year" ? `for ${year}` : "yet"}.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* First and Latest */}
      <SectionDivider label="Performances" />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
        {firstPerformance && (
          <SpotlightCard
            date={moment(firstPerformance.performances.startTime).format("MMMM Do, YYYY")}
            headline={`First Performance ${getYearText()}`}
            location={firstPerformance.performances.theatres.location}
            playbill={getPlaybill(firstPerformance)}
            subtext={`The curtain first rose on ${getPerformanceTitle(firstPerformance)} — your opening night ${view === "year" ? `in ${year}` : "of all time"}.`}
            theatre={firstPerformance.performances.theatres.name}
            title={getPerformanceTitle(firstPerformance)}
          />
        )}
        {latestPerformance && (
          <SpotlightCard
            date={moment(latestPerformance.performances.startTime).format("MMMM Do, YYYY")}
            headline={`Most Recent Performance ${getYearText()}`}
            location={latestPerformance.performances.theatres.location}
            playbill={getPlaybill(latestPerformance)}
            reverse
            subtext={`Most recently you sat down for ${getPerformanceTitle(latestPerformance)}.`}
            theatre={latestPerformance.performances.theatres.name}
            title={getPerformanceTitle(latestPerformance)}
          />
        )}
      </Box>

      {/* Oldest and Newest Premieres */}
      <SectionDivider label="Premiere Dates" />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
        {oldestPerformance && (
          <SpotlightCard
            date={moment(oldestPerformance.performances.startTime).format("MMMM Do, YYYY")}
            headline={`Oldest Premiere ${getYearText()}`}
            location={oldestPerformance.performances.theatres.location}
            playbill={getPlaybill(oldestPerformance)}
            subtext={`${getPerformanceTitle(oldestPerformance)} premiered in ${getPerformancePremiere(oldestPerformance)} — the oldest show you've seen.`}
            theatre={oldestPerformance.performances.theatres.name}
            title={getPerformanceTitle(oldestPerformance)}
          />
        )}
        {newestPerformance && (
          <SpotlightCard
            date={moment(newestPerformance.performances.startTime).format("MMMM Do, YYYY")}
            headline={`Newest Premiere ${getYearText()}`}
            location={newestPerformance.performances.theatres.location}
            playbill={getPlaybill(newestPerformance)}
            reverse
            subtext={`${getPerformanceTitle(newestPerformance)} premiered in ${getPerformancePremiere(newestPerformance)} — the newest show you've seen.`}
            theatre={newestPerformance.performances.theatres.name}
            title={getPerformanceTitle(newestPerformance)}
          />
        )}
      </Box>

      {/* Era / taste */}
      <SectionDivider label="Your Taste" />
      <Box
        sx={{
          p: 4,
          border: "1px solid rgba(212,175,85,0.1)",
          borderRadius: 1,
          background: "rgba(212,175,85,0.02)",
          mb: 3,
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.6rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#D4AF55",
            mb: 2,
          }}
        >
          Premiere Era
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: { xs: "2rem", md: "3rem" },
            fontWeight: 600,
            color: "#E8DCC8",
            lineHeight: 1,
            mb: 2,
          }}
        >
          {performanceEra}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: "italic",
            fontSize: "1.05rem",
            color: "rgba(232,220,200,0.55)",
            maxWidth: 520,
            mx: "auto",
            lineHeight: 1.7,
            mb: 2,
          }}
        >
          {performanceEraDescription}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.75rem",
            color: "rgba(232,220,200,0.4)",
          }}
        >
          Average premiere year: {premiereAverage} · Average show age: {averagePerformanceAge} years
        </Typography>
      </Box>
      <ChartSection label="Shows by Premiere Year">
        <PerformanceByPremiereChart stats={stats} />
      </ChartSection>

      {/* Locations */}
      <SectionDivider label="Where You've Been" />
      <Box
        sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 3 }}
      >
        <Box
          sx={{
            p: 4,
            border: "1px solid rgba(212,175,85,0.1)",
            borderRadius: 1,
            background: "rgba(212,175,85,0.02)",
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.6rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#D4AF55",
              mb: 1.5,
            }}
          >
            Most Visited City
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "2rem",
              fontWeight: 600,
              color: "#E8DCC8",
              mb: 1,
            }}
          >
            {mostVisitedLocation ?? "N/A"}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.75rem",
              color: "rgba(232,220,200,0.4)",
            }}
          >
            across {numberOfLocations} {numberOfLocations === 1 ? "city" : "cities"}{" "}
            {getAdverbText()}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 4,
            border: "1px solid rgba(212,175,85,0.1)",
            borderRadius: 1,
            background: "rgba(212,175,85,0.02)",
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.6rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#D4AF55",
              mb: 1.5,
            }}
          >
            Most Active Month
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "2rem",
              fontWeight: 600,
              color: "#E8DCC8",
              mb: 1,
            }}
          >
            {mostVisitsPerMonth ?? "N/A"}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.75rem",
              color: "rgba(232,220,200,0.4)",
            }}
          >
            your busiest month {getAdverbText()}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
        <ChartSection label="Shows by City">
          <LocationsChart stats={stats} />
        </ChartSection>
        <ChartSection label="Shows by Month">
          <MonthlyAttendanceChart stats={stats} />
        </ChartSection>
      </Box>
    </Container>
  );
}

export default Statistics;
