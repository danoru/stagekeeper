import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

import AdminGuard from "../../src/components/admin/AdminGuard";
import ResetUserPasswordDialog from "../../src/components/admin/ResetUserPasswordDialog";

type AdminUser = {
  id: number;
  username: string;
  email: string;
  badge: "ADMIN" | "PATRON" | "USER";
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
  _count: { attendance: number };
};

const BADGE_COLORS: Record<string, "error" | "warning" | "default"> = {
  ADMIN: "error",
  PATRON: "warning",
  USER: "default",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [resetTarget, setResetTarget] = useState<{ id: number; username: string } | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers);
  }, []);

  function showSnackbar(message: string, severity: "success" | "error") {
    setSnackbar({ open: true, message, severity });
  }

  async function handleBadgeChange(userId: number, badge: string) {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, badge }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, badge: data.badge } : u)));
      showSnackbar(`${data.username} updated to ${data.badge}.`, "success");
    } else {
      showSnackbar(data.error || "Failed to update badge.", "error");
    }
  }

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminGuard>
      <Head>
        <title>Users • Admin • StageKeeper</title>
      </Head>
      <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, px: 2 }}>
        <Stack alignItems="center" direction="row" justifyContent="space-between" mb={2}>
          <Typography variant="h5">
            <Link href="/admin" style={{ textDecoration: "none", color: "inherit" }}>
              Admin
            </Link>
            {" / Users"}
          </Typography>
          <Chip label={`${users.length} users`} size="small" />
        </Stack>

        <Paper sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="Search users…"
            size="small"
            sx={{ mb: 3 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Stack spacing={2}>
            {filtered.map((user) => (
              <Stack
                key={user.id}
                alignItems="center"
                direction="row"
                justifyContent="space-between"
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box>
                  <Stack alignItems="center" direction="row" spacing={1}>
                    <Typography fontWeight={500} variant="body1">
                      {user.username}
                    </Typography>
                    <Chip color={BADGE_COLORS[user.badge]} label={user.badge} size="small" />
                  </Stack>
                  <Typography color="text.secondary" variant="caption">
                    {user.email}
                  </Typography>
                  <br />
                  <Typography color="text.secondary" variant="caption">
                    {user._count.attendance} shows logged · joined{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Stack alignItems="center" direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setResetTarget({ id: user.id, username: user.username })}
                  >
                    Reset password
                  </Button>
                  <Select
                    size="small"
                    sx={{ minWidth: 110 }}
                    value={user.badge}
                    onChange={(e) => handleBadgeChange(user.id, e.target.value)}
                  >
                    <MenuItem value="USER">User</MenuItem>
                    <MenuItem value="PATRON">Patron</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                  </Select>
                </Stack>
              </Stack>
            ))}
            {filtered.length === 0 && (
              <Typography color="text.secondary" py={2} textAlign="center" variant="body2">
                No users found.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>

      <ResetUserPasswordDialog
        open={!!resetTarget}
        user={resetTarget}
        onClose={() => setResetTarget(null)}
        onError={(message) => showSnackbar(message, "error")}
        onSuccess={(username) => showSnackbar(`Password updated for ${username}.`, "success")}
      />

      <Snackbar
        autoHideDuration={4000}
        open={snackbar.open}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminGuard>
  );
}
