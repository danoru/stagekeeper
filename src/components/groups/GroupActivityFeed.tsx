import { Box, Container, Link, Rating, Stack, Typography } from "@mui/material";
import moment from "moment";

import type { GroupActivityEvent } from "../../data/groups";
import { resolveShowImage } from "../../utils/gradients";
import UserAvatar from "../users/UserAvatar";

interface Props {
  events: GroupActivityEvent[];
}

function showSlug(title: string, type: "MUSICAL" | "PLAY") {
  const showType = type === "MUSICAL" ? "musicals" : "plays";
  return `/${showType}/${title.replace(/\s+/g, "-").toLowerCase()}`;
}

function EventThumb({ playbill, title }: { playbill: string; title: string }) {
  const { isGradient, value } = resolveShowImage(playbill, title);
  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: "62px", sm: "76px" },
        width: { xs: "44px", sm: "56px" },
        borderRadius: 0.5,
        overflow: "hidden",
        border: "1px solid rgba(212,175,85,0.12)",
        flexShrink: 0,
      }}
    >
      {isGradient ? (
        <Box sx={{ position: "absolute", inset: 0, background: value }} />
      ) : (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${value})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.7)",
          }}
        />
      )}
    </Box>
  );
}

function GroupActivityFeed({ events }: Props) {
  if (events.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box
          sx={{
            border: "1px solid rgba(212,175,85,0.08)",
            borderRadius: 1,
            py: 6,
            px: 3,
            textAlign: "center",
            background: "rgba(212,175,85,0.02)",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: "1.05rem",
              color: "rgba(232,220,200,0.3)",
              mb: 0.5,
            }}
          >
            Nothing yet from your groups.
          </Typography>
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.7rem",
              color: "rgba(232,220,200,0.2)",
              letterSpacing: "0.04em",
            }}
          >
            Plans, RSVPs, and members&rsquo; show logs will surface here.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={0}>
        {events.map((event, i) => (
          <EventRow key={`${event.kind}-${event.timestamp.toString()}-${i}`} event={event} />
        ))}
      </Stack>
    </Container>
  );
}

function EventRow({ event }: { event: GroupActivityEvent }) {
  const slug = showSlug(event.show.title, event.show.type);
  const userHref = `/users/${event.user.username}`;
  const when = moment(event.timestamp).fromNow();

  let line: React.ReactNode;
  let extra: React.ReactNode = null;

  if (event.kind === "attendance") {
    line = (
      <>
        <strong>{event.user.username}</strong> logged{" "}
        <Link href={slug} sx={linkStyle} underline="none">
          {event.show.title}
        </Link>
        {event.theatre ? <> at {event.theatre}</> : null}
        {event.seenDate ? <> on {moment(event.seenDate).format("MMM D, YYYY")}</> : null}
      </>
    );
    extra = (
      <>
        {event.rating != null && (
          <Rating
            readOnly
            precision={0.5}
            size="small"
            value={event.rating}
            sx={{
              "& .MuiRating-iconFilled": { color: "#D4AF55" },
              "& .MuiRating-iconEmpty": { color: "rgba(212,175,85,0.2)" },
              fontSize: "0.8rem",
              mt: 0.5,
            }}
          />
        )}
        {event.comment && (
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: "0.82rem",
              color: "rgba(232,220,200,0.6)",
              mt: 0.5,
              lineHeight: 1.4,
            }}
          >
            &ldquo;{event.comment}&rdquo;
          </Typography>
        )}
      </>
    );
  } else if (event.kind === "plan_created") {
    line = (
      <>
        <strong>{event.user.username}</strong> started a poll for{" "}
        <Link href={slug} sx={linkStyle} underline="none">
          {event.show.title}
        </Link>{" "}
        in{" "}
        <Link href={`/groups/${event.group.id}`} sx={linkStyle} underline="none">
          {event.group.name}
        </Link>
        {event.theatre ? ` at ${event.theatre}` : ""}
      </>
    );
  } else {
    line = (
      <>
        <strong>{event.user.username}</strong>{" "}
        <Box component="span" sx={{ color: "#7BC97B" }}>
          locked in
        </Box>{" "}
        <Link href={slug} sx={linkStyle} underline="none">
          {event.show.title}
        </Link>{" "}
        in{" "}
        <Link href={`/groups/${event.group.id}`} sx={linkStyle} underline="none">
          {event.group.name}
        </Link>
        {" — "}
        {moment(event.startTime).format("MMM D · h:mm A")}
        {event.theatre ? ` at ${event.theatre}` : ""}
      </>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "auto auto 1fr", sm: "auto auto 1fr" },
        columnGap: 2,
        py: 2,
        borderBottom: "1px solid rgba(212,175,85,0.06)",
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      <Box>
        <Link href={userHref} underline="none">
          <UserAvatar avatarSize="36px" name={event.user.username} />
        </Link>
      </Box>
      <EventThumb playbill={event.show.playbill} title={event.show.title} />
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.82rem",
            color: "rgba(232,220,200,0.85)",
            lineHeight: 1.45,
          }}
        >
          {line}
        </Typography>
        {extra}
        <Typography
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.62rem",
            letterSpacing: "0.08em",
            color: "rgba(232,220,200,0.35)",
            mt: 0.5,
          }}
        >
          {when}
        </Typography>
      </Box>
    </Box>
  );
}

const linkStyle = {
  color: "#E8DCC8",
  fontWeight: 500,
  "&:hover": { color: "#D4AF55" },
};

export default GroupActivityFeed;
