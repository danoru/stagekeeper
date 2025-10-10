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
import { useSession } from "next-auth/react";
import * as React from "react";

function getPages(session: any) {
  if (session) {
    return [
      {
        id: 1,
        title: session.user.username,
        link: `/users/${session.user.username}`,
      },
      { id: 2, title: "Musicals", link: "/musicals" },
      { id: 3, title: "Plays", link: "/plays" },
      { id: 4, title: "Theatres", link: "/theatres" },
      { id: 5, title: "Users", link: "/users" },
      // { id: 6, title: "Upcoming", link: "/upcoming" },
      { id: 7, title: "Logout", link: "/api/auth/signout" },
    ];
  } else {
    return [
      { id: 1, title: "Login", link: "/login" },
      { id: 2, title: "Create Account", link: "/register" },
      { id: 3, title: "Musicals", link: "/musicals" },
      { id: 2, title: "Plays", link: "/plays" },
      { id: 4, title: "Theatres", link: "/theatres" },
      // { id: 5, title: "Upcoming", link: "/upcoming" },
      { id: 6, title: "Users", link: "/users" },
    ];
  }
}

function Navbar() {
  const { data: session, status } = useSession();
  const pages = getPages(session);

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { md: "flex", xs: "none" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
            variant="h6"
          >
            StageKeeper
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              aria-controls="menu-appbar"
              aria-haspopup="true"
              aria-label="account of current user"
              color="inherit"
              size="large"
              onClick={handleOpenNavMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              keepMounted
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              id="menu-appbar"
              open={Boolean(anchorElNav)}
              sx={{
                display: { xs: "block", md: "none" },
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              onClose={handleCloseNavMenu}
            >
              {pages.map((page) => (
                <MenuItem key={page.id} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">
                    <a href={page.link}>{page.title}</a>
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page.id}
                sx={{ my: 2, color: "white", display: "block" }}
                onClick={handleCloseNavMenu}
              >
                <a href={page.link}>{page.title}</a>
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;
