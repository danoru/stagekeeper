import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import * as React from "react";

function getPages(session: any) {
  if (session) {
    const pages = [
      { id: 1, title: session.user.username, link: `/users/${session.user.username}` },
      { id: 2, title: "Musicals", link: "/musicals" },
      { id: 3, title: "Plays", link: "/plays" },
      { id: 4, title: "Theatres", link: "/theatres" },
      { id: 5, title: "Users", link: "/users" },
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
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              sx={{ display: { xs: "block", md: "none" } }}
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
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
