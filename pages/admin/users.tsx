import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

import AdminGuard from "../../src/components/admin/AdminGuard";

type AdminUser = {
  id: number;
  username: string;
  email: string;
  badge: "ADMIN" | "PATRON" | "USER";
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
  _count: { attendance: number; logs: number };
};

const BADGE_COLORS: Record<string, "error" | "warning" | "default"> = {
  ADMIN: "error",
  PATRON: "warning",
  USER: "default",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
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
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
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
            size="small"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Stack spacing={2}>
            {filtered.map((user) => (
              <Stack
                key={user.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body1" fontWeight={500}>
                      {user.username}
                    </Typography>
                    <Chip label={user.badge} size="small" color={BADGE_COLORS[user.badge]} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    {user._count.attendance + user._count.logs} shows logged · joined{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Select
                  size="small"
                  value={user.badge}
                  onChange={(e) => handleBadgeChange(user.id, e.target.value)}
                  sx={{ minWidth: 110 }}
                >
                  <MenuItem value="USER">User</MenuItem>
                  <MenuItem value="PATRON">Patron</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </Select>
              </Stack>
            ))}
            {filtered.length === 0 && (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                No users found.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
