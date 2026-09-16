import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { getSession } from "next-auth/react";
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
        setSnackbar({ message: "Password updated.", severity: "success" });
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
        </Stack>
      </Container>
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
