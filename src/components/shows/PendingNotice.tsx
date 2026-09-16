import Typography from "@mui/material/Typography";

// Shown on shows/theatres a member added that an admin hasn't tidied up yet.
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
      Added by a member · details coming soon
    </Typography>
  );
}

export default PendingNotice;
