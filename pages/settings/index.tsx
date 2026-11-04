import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { getSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import superjson from "superjson";

import prisma from "../../src/data/db";
import { PASSWORD_MIN_LENGTH } from "../../src/utils/validation";

interface ProfileFields {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  website: string;
  bio: string;
}

interface Props {
  username: string;
  profile: ProfileFields;
}

const sectionLabelSx = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#D4AF55",
  mb: 2,
};

function SettingsPage({ username, profile }: Props) {
  const [userData, setUserData] = useState<ProfileFields>(profile);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setDeleteError(data.error ?? "Couldn't delete your account.");
        return;
      }
      await signOut({ callbackUrl: "/" });
    } finally {
      setDeleting(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { id, value } = e.target;
    setUserData((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/user/${username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSnackbar({ message: "Profile saved.", severity: "success" });
      } else {
        setSnackbar({ message: data.error ?? "Failed to save profile.", severity: "error" });
      }
    } finally {
      setSaving(false);
    }
  }

  const passwordMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;
  const passwordTooShort = newPassword.length > 0 && newPassword.length < PASSWORD_MIN_LENGTH;

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (passwordMismatch || passwordTooShort) return;
    setChangingPassword(true);
    try {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        // The change revokes every session, this one included, so get a fresh one.
        await signIn("credentials", { redirect: false, username, password: newPassword });
        setSnackbar({
          message: "Password updated. Other devices will be signed out.",
          severity: "success",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setSnackbar({ message: data.error ?? "Failed to update password.", severity: "error" });
      }
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>Account Settings • StageKeeper</title>
      </Head>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Stack
          divider={<Divider sx={{ borderColor: "rgba(212,175,85,0.08)" }} />}
          spacing={4}
          sx={{
            border: "1px solid rgba(212,175,85,0.1)",
            borderRadius: 1,
            p: { xs: 2.5, sm: 4 },
            background: "rgba(212,175,85,0.02)",
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            <Typography sx={sectionLabelSx}>Profile</Typography>
            <TextField
              disabled
              fullWidth
              id="username"
              InputLabelProps={{ shrink: true }}
              label="Username"
              margin="dense"
              value={username}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0, sm: 1.5 }}>
              <TextField
                fullWidth
                id="firstName"
                InputLabelProps={{ shrink: true }}
                label="Given Name"
                margin="dense"
                value={userData.firstName}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                id="lastName"
                InputLabelProps={{ shrink: true }}
                label="Family Name"
                margin="dense"
                value={userData.lastName}
                onChange={handleChange}
              />
            </Stack>
            <TextField
              fullWidth
              required
              id="email"
              InputLabelProps={{ shrink: true }}
              label="Email Address"
              margin="dense"
              type="email"
              value={userData.email}
              onChange={handleChange}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0, sm: 1.5 }}>
              <TextField
                fullWidth
                id="location"
                InputLabelProps={{ shrink: true }}
                label="Location"
                margin="dense"
                value={userData.location}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                id="website"
                InputLabelProps={{ shrink: true }}
                label="Website"
                margin="dense"
                placeholder="https://"
                value={userData.website}
                onChange={handleChange}
              />
            </Stack>
            <TextField
              fullWidth
              multiline
              id="bio"
              InputLabelProps={{ shrink: true }}
              label="Bio"
              margin="dense"
              rows={3}
              value={userData.bio}
              onChange={handleChange}
            />
            <Button disabled={saving} sx={{ mt: 2 }} type="submit" variant="contained">
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </Box>

          <Box component="form" onSubmit={handlePasswordChange}>
            <Typography sx={sectionLabelSx}>Change Password</Typography>
            <TextField
              fullWidth
              required
              autoComplete="current-password"
              label="Current password"
              margin="dense"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
              fullWidth
              required
              autoComplete="new-password"
              error={passwordTooShort}
              helperText={passwordTooShort ? `At least ${PASSWORD_MIN_LENGTH} characters.` : " "}
              label="New password"
              margin="dense"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              fullWidth
              required
              autoComplete="new-password"
              error={passwordMismatch}
              helperText={passwordMismatch ? "Passwords must match." : " "}
              label="Confirm new password"
              margin="dense"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              disabled={
                changingPassword ||
                !currentPassword ||
                !newPassword ||
                passwordMismatch ||
                passwordTooShort
              }
              sx={{ mt: 1 }}
              type="submit"
              variant="outlined"
            >
              {changingPassword ? "Updating…" : "Update Password"}
            </Button>
          </Box>

          <Box>
            <Typography sx={sectionLabelSx}>Your Data</Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "rgba(232,220,200,0.6)", mb: 1.5 }}>
              Download your profile, visits, ratings, lists and groups as a JSON file.
            </Typography>
            <Button component="a" href="/api/user/account" variant="outlined">
              Download My Data
            </Button>
          </Box>

          <Box>
            <Typography sx={{ ...sectionLabelSx, color: "#CF4444" }}>Delete Account</Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "rgba(232,220,200,0.6)", mb: 1.5 }}>
              This permanently removes your profile, visits, ratings, lists and follows. Groups you
              share carry on without you, and shows or credits you added stay in the catalog with
              your name removed. This can&apos;t be undone.
            </Typography>
            <Button color="error" variant="outlined" onClick={() => setDeleteOpen(true)}>
              Delete My Account
            </Button>
          </Box>
        </Stack>
      </Container>
      <Dialog
        fullWidth
        maxWidth="xs"
        open={deleteOpen}
        onClose={() => {
          if (!deleting) setDeleteOpen(false);
        }}
      >
        <Box component="form" onSubmit={handleDeleteAccount}>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogContent>
            <Typography sx={{ fontSize: "0.9rem", mb: 2 }}>
              Everything personal to {username} will be gone for good. Enter your password to
              confirm.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              required
              autoComplete="current-password"
              label="Password"
              margin="dense"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
            {deleteError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {deleteError}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button disabled={deleting} onClick={() => setDeleteOpen(false)}>
              Keep My Account
            </Button>
            <Button
              color="error"
              disabled={deleting || !deletePassword}
              type="submit"
              variant="contained"
            >
              {deleting ? "Deleting…" : "Delete Forever"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Snackbar autoHideDuration={6000} open={snackbar !== null} onClose={() => setSnackbar(null)}>
        <Alert
          severity={snackbar?.severity ?? "success"}
          sx={{ width: "100%" }}
          onClose={() => setSnackbar(null)}
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: "/login?callbackUrl=/settings", permanent: false } };
  }

  const user = await prisma.users.findUnique({
    where: { id: Number(session.user.id) },
    select: {
      username: true,
      firstName: true,
      lastName: true,
      email: true,
      location: true,
      website: true,
      bio: true,
    },
  });
  if (!user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  return {
    props: superjson.serialize({
      username: user.username,
      profile: {
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email,
        location: user.location ?? "",
        website: user.website ?? "",
        bio: user.bio ?? "",
      },
    }).json,
  };
}

export default SettingsPage;
