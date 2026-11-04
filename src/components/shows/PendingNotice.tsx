import Typography from "@mui/material/Typography";

// Shown on shows/theatres a member added that an admin hasn't approved yet; only admins, whoever
// added it and anyone who logged it can reach those pages.
function PendingNotice() {
  return (
    <Typography
      sx={{
        mt: 1,
        fontFamily: '"DM Sans", sans-serif',
        fontSize: "0.68rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "rgba(212,175,85,0.6)",
      }}
    >
      Waiting for an admin to approve · hidden from everyone else until then
    </Typography>
  );
}

export default PendingNotice;
