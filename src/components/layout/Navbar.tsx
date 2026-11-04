import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Alert,
  AppBar,
  Badge,
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

import type { AccountStatus } from "../../data/emailVerification";
import LogShowDialog, { type PresetShow } from "../shows/LogShowDialog";

import LinkBehavior from "./LinkBehavior";
import NavSearch from "./NavSearch";
import VerifyEmailBanner from "./VerifyEmailBanner";

interface NavPage {
  id: number;
  title: string;
  link: string;
  /** Shown as a small pill next to the title, e.g. pending group invites. */
  count?: number;
}

function getPages(session: any, inviteCount: number): NavPage[] {
  if (session) {
    const pages: NavPage[] = [
      { id: 1, title: session.user.username, link: `/users/${session.user.username}` },
      { id: 2, title: "Groups", link: "/groups", count: inviteCount },
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

const ACCOUNT_PAGES = /^\/(groups|settings|verify-email)/;

// The width where the logo, every link (admin and invite count included) and Log a show all fit.
// Narrower screens get the menu.
const DESKTOP_NAV = "@media (min-width: 1320px)";

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

function CountPill({ count }: { count?: number }) {
  if (!count) return null;
  return (
    <Box
      aria-label={`${count} pending ${count === 1 ? "invite" : "invites"}`}
      component="span"
      sx={{
        ml: 0.75,
        px: 0.75,
        minWidth: 18,
        lineHeight: "18px",
        borderRadius: 9,
        fontSize: "0.65rem",
        fontWeight: 600,
        letterSpacing: 0,
        textAlign: "center",
        color: "#080C14",
        background: "#D4AF55",
      }}
    >
      {count}
    </Box>
  );
}

function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [account, setAccount] = React.useState<AccountStatus | null>(null);
  const inviteCount = account?.pendingInvites ?? 0;
  // While the session loads, show the frame without links rather than a blank bar.
  const pages = status === "loading" ? [] : getPages(session, inviteCount);
  const userId = session?.user?.id;
  const [accountVersion, setAccountVersion] = React.useState(0);

  // Invites and email status only change on these pages, so other clicks don't refetch them.
  // Includes refreshes in place (declining an invite) and leaving (after confirming an email).
  React.useEffect(() => {
    let lastUrl = window.location.pathname;
    const onRouteChange = (url: string) => {
      if (ACCOUNT_PAGES.test(url) || ACCOUNT_PAGES.test(lastUrl)) {
        setAccountVersion((version) => version + 1);
      }
      lastUrl = url;
    };
    router.events.on("routeChangeComplete", onRouteChange);
    return () => router.events.off("routeChangeComplete", onRouteChange);
  }, [router.events]);

  React.useEffect(() => {
    if (!userId) {
      setAccount(null);
      return;
    }
    let cancelled = false;
    fetch("/api/user/account-status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AccountStatus | null) => {
        if (!cancelled) setAccount(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId, accountVersion]);
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

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 56, md: 60 } }}>
            {/* Logo desktop */}
            <Typography
              noWrap
              component={LinkBehavior}
              href="/"
              sx={{
                mr: 4,
                flexShrink: 0,
                display: "none",
                [DESKTOP_NAV]: { display: "flex" },
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
            <Box sx={{ flexGrow: 1, display: "flex", [DESKTOP_NAV]: { display: "none" } }}>
              <IconButton
                aria-label={inviteCount ? "Open menu (you have group invites)" : "Open menu"}
                color="inherit"
                size="large"
                onClick={handleOpenNavMenu}
              >
                <Badge color="primary" invisible={!inviteCount} variant="dot">
                  <MenuIcon />
                </Badge>
              </IconButton>
              <Menu
                anchorEl={anchorElNav}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                open={Boolean(anchorElNav)}
                sx={{ display: "block", [DESKTOP_NAV]: { display: "none" } }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                onClose={handleCloseNavMenu}
              >
                {pages.map((page) => (
                  <MenuItem key={page.id} onClick={handleCloseNavMenu}>
                    <Typography
                      component={LinkBehavior}
                      href={page.link}
                      sx={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: "0.85rem",
                        color: "text.primary",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      {page.title}
                      <CountPill count={page.count} />
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
              component={LinkBehavior}
              href="/"
              sx={{
                flexGrow: 1,
                display: "flex",
                [DESKTOP_NAV]: { display: "none" },
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
            <Box sx={{ flexGrow: 1, display: "none", gap: 0.5, [DESKTOP_NAV]: { display: "flex" } }}>
              {pages.map((page) => (
                <Button
                  key={page.id}
                  href={page.link}
                  sx={{
                    ...navLinkSx,
                    color: page.title === session?.user?.username ? "#D4AF55" : navLinkSx.color,
                    fontWeight: page.title === session?.user?.username ? 600 : 400,
                  }}
                  onClick={handleCloseNavMenu}
                >
                  {page.title}
                  <CountPill count={page.count} />
                </Button>
              ))}
              {session && (
                <Button sx={navLinkSx} onClick={handleLogout}>
                  Logout
                </Button>
              )}
            </Box>

            <NavSearch />

            {session && (
              <Button
                aria-label="Log a show"
                size="small"
                startIcon={<AddIcon />}
                sx={{
                  ml: 1,
                  flexShrink: 0,
                  minWidth: { xs: 36, sm: 64 },
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#D4AF55",
                  borderColor: "rgba(212,175,85,0.4)",
                  whiteSpace: "nowrap",
                  "&:hover": { borderColor: "#D4AF55", background: "rgba(212,175,85,0.08)" },
                  // Phones only have room for the plus.
                  "& .MuiButton-startIcon": { mx: { xs: 0, sm: undefined } },
                }}
                variant="outlined"
                onClick={() => setLogOpen(true)}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Log a show
                </Box>
              </Button>
            )}
          </Toolbar>
        </Container>
        {session && (
          <LogShowDialog open={logOpen} onClose={() => setLogOpen(false)} onLogged={handleLogged} />
        )}
        <Snackbar
          autoHideDuration={5000}
          open={snackbar !== null}
          onClose={() => setSnackbar(null)}
        >
          <Alert severity="success" onClose={() => setSnackbar(null)}>
            {snackbar}
          </Alert>
        </Snackbar>
      </AppBar>
      <VerifyEmailBanner status={account} />
    </>
  );
}

export default Navbar;
