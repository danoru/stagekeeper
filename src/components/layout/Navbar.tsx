import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Toolbar,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import * as React from "react";

import LogShowDialog, { type PresetShow } from "../shows/LogShowDialog";

function getPages(session: any) {
  if (session) {
    const pages = [
      { id: 1, title: session.user.username, link: `/users/${session.user.username}` },
      { id: 2, title: "Groups", link: "/groups" },
      { id: 3, title: "Musicals", link: "/musicals" },
      { id: 4, title: "Plays", link: "/plays" },
      { id: 5, title: "Theatres", link: "/theatres" },
      { id: 6, title: "Users", link: "/users" },
      { id: 7, title: "Settings", link: "/settings" },
    ];
    if (session.user.badge === "ADMIN") {
      pages.push({ id: 8, title: "Admin", link: "/admin" });
    }
    return pages;
  } else {
    return [
      { id: 1, title: "Login", link: "/login" },
      { id: 2, title: "Create Account", link: "/register" },
      { id: 3, title: "Musicals", link: "/musicals" },
      { id: 4, title: "Plays", link: "/plays" },
      { id: 5, title: "Theatres", link: "/theatres" },
      { id: 6, title: "Users", link: "/users" },
    ];
  }
}

const navLinkSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.72rem",
  fontWeight: 400,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  px: 1.5,
  minWidth: 0,
  color: "rgba(232, 220, 200, 0.65)",
  "&:hover": { color: "#D4AF55", backgroundColor: "rgba(212, 175, 85, 0.06)" },
};

function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pages = getPages(session);
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [logOpen, setLogOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<string | null>(null);

  function handleLogged({ show, mode }: { show: PresetShow; mode: "seen" | "going" }) {
    setSnackbar(mode === "going" ? `You're going to ${show.title}.` : `Logged ${show.title}.`);
    // Refresh whatever page we're on so feeds and counts pick up the new row.
    router.replace(router.asPath, undefined, { scroll: false });
  }

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  function handleLogout() {
    handleCloseNavMenu();
    signOut({ redirect: false }).then(() => router.push("/"));
  }

  if (status === "loading") return null;

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, md: 60 } }}>
          {/* Logo desktop */}
          <Typography
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 4,
              display: { md: "flex", xs: "none" },
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontWeight: 600,
              fontSize: "1.35rem",
              letterSpacing: "0.12em",
              color: "#D4AF55",
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            StageKeeper
          </Typography>

          {/* Mobile hamburger */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton color="inherit" size="large" onClick={handleOpenNavMenu}>
              <MenuIcon />
            </IconButton>
            <Menu
              keepMounted
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              open={Boolean(anchorElNav)}
              sx={{ display: { xs: "block", md: "none" } }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              onClose={handleCloseNavMenu}
            >
              {pages.map((page) => (
                <MenuItem key={page.id} onClick={handleCloseNavMenu}>
                  <Typography
                    component="a"
                    href={page.link}
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.85rem",
                      color: "text.primary",
                      textDecoration: "none",
                    }}
                  >
                    {page.title}
                  </Typography>
                </MenuItem>
              ))}
              {session && (
                <MenuItem onClick={handleLogout}>
                  <Typography
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.85rem",
                      color: "text.primary",
                    }}
                  >
                    Logout
                  </Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Logo mobile */}
          <Typography
            noWrap
            component="a"
            href="/"
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontWeight: 600,
              fontSize: "1.15rem",
              letterSpacing: "0.1em",
              color: "#D4AF55",
              textDecoration: "none",
              textTransform: "uppercase",
            }}
          >
            StageKeeper
          </Typography>

          {/* Desktop links */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: 0.5 }}>
            {pages.map((page) => (
              <Button
                key={page.id}
                component="a"
                href={page.link}
                sx={{
                  ...navLinkSx,
                  color: page.title === session?.user?.username ? "#D4AF55" : navLinkSx.color,
                  fontWeight: page.title === session?.user?.username ? 600 : 400,
                }}
                onClick={handleCloseNavMenu}
              >
                {page.title}
              </Button>
            ))}
            {session && (
              <Button sx={navLinkSx} onClick={handleLogout}>
                Logout
              </Button>
            )}
          </Box>

          {session && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              sx={{
                ml: 1,
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#D4AF55",
                borderColor: "rgba(212,175,85,0.4)",
                whiteSpace: "nowrap",
                "&:hover": { borderColor: "#D4AF55", background: "rgba(212,175,85,0.08)" },
              }}
              variant="outlined"
              onClick={() => setLogOpen(true)}
            >
              Log a show
            </Button>
          )}
        </Toolbar>
      </Container>
      {session && (
        <LogShowDialog open={logOpen} onClose={() => setLogOpen(false)} onLogged={handleLogged} />
      )}
      <Snackbar autoHideDuration={5000} open={snackbar !== null} onClose={() => setSnackbar(null)}>
        <Alert severity="success" onClose={() => setSnackbar(null)}>
          {snackbar}
        </Alert>
      </Snackbar>
    </AppBar>
  );
}

export default Navbar;
