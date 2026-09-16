import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface Props {
  children: React.ReactNode;
  subtitle: string;
  title: string;
}

// Shared shell for the login / register / password-reset screens.
function AuthCard({ children, subtitle, title }: Props) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#080C14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 420,
          background: "#0D1520",
          border: "1px solid rgba(212,175,85,0.15)",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            borderBottom: "1px solid rgba(212,175,85,0.12)",
            background: "linear-gradient(180deg, #0F1A28 0%, #0D1520 100%)",
            px: 4,
            py: 3,
            textAlign: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
            <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.3)" }} />
            <Typography
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.6rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#D4AF55",
              }}
            >
              StageKeeper
            </Typography>
            <Box sx={{ flex: 1, height: "1px", background: "rgba(212,175,85,0.3)" }} />
          </Box>
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "1.9rem",
              fontWeight: 600,
              color: "#E8DCC8",
              lineHeight: 1,
              letterSpacing: "0.01em",
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: "0.9rem",
              color: "rgba(232,220,200,0.45)",
              mt: 0.5,
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        <Box sx={{ px: 4, py: 4 }}>{children}</Box>
      </Box>
    </Box>
  );
}

export const authFooterLinkSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.78rem",
  color: "rgba(232,220,200,0.5)",
  transition: "color 0.2s",
  "&:hover": { color: "#D4AF55" },
};

export const authFooterSx = {
  textAlign: "center",
  borderTop: "1px solid rgba(212,175,85,0.1)",
  pt: 2.5,
  display: "flex",
  flexDirection: "column",
  gap: 1,
};

export default AuthCard;
