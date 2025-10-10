import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Head from "next/head";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";

function SettingsPage({ session }: any) {
  const username = session?.user?.username;
  const router = useRouter();

  const [userData, setUserData] = useState({
    username: username,
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    website: "",
    bio: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    if (username) {
      fetch(`/api/user/${username}`)
        .then((response) => response.json())
        .then((data) => {
          setUserData(data);
          setLoading(false);
        });
    }
  }, [username]);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { id, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const response = await fetch(`/api/user/${username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      setSnackbarMessage("User data updated successfully!");
      setSnackbarOpen(true);
      router.reload();
    } else {
      console.error("Failed to update user data.");
    }

    setSaving(false);
  }

  return (
    <div>
      <Head>
        <title>Account Settings • StageKeeper</title>
      </Head>
      <Stack direction="row" sx={{ justifyContent: "center" }}>
        <form onSubmit={handleSubmit}>
          <TextField
            disabled
            fullWidth
            id="username"
            InputLabelProps={{ shrink: true }}
            label="Username"
            sx={{ margin: "10px 0" }}
            value={username}
            variant="outlined"
          />
          <Stack direction="row">
            <TextField
              id="firstName"
              InputLabelProps={{ shrink: true }}
              label="Given Name"
              sx={{ marginBottom: "10px" }}
              value={userData.firstName}
              variant="outlined"
              onChange={handleChange}
            />
            <TextField
              id="lastName"
              InputLabelProps={{ shrink: true }}
              label="Family Name"
              sx={{ marginBottom: "10px" }}
              value={userData.lastName}
              variant="outlined"
              onChange={handleChange}
            />
          </Stack>
          <TextField
            fullWidth
            id="email"
            InputLabelProps={{ shrink: true }}
            label="Email Address"
            sx={{ marginBottom: "10px" }}
            value={userData.email}
            variant="outlined"
            onChange={handleChange}
          />
          <Stack direction="row">
            <TextField
              id="location"
              InputLabelProps={{ shrink: true }}
              label="Location"
              sx={{ marginBottom: "10px" }}
              value={userData.location}
              variant="outlined"
              onChange={handleChange}
            />
            <TextField
              id="website"
              InputLabelProps={{ shrink: true }}
              label="Website"
              sx={{ marginBottom: "10px" }}
              value={userData.website}
              variant="outlined"
              onChange={handleChange}
            />
          </Stack>
          <TextField
            fullWidth
            multiline
            id="bio"
            InputLabelProps={{ shrink: true }}
            label="Bio"
            rows={4}
            sx={{ marginBottom: "10px" }}
            value={userData.bio}
            variant="outlined"
            onChange={handleChange}
          />
          <Button disabled={saving} type="submit" variant="contained">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Stack>
      <Snackbar autoHideDuration={6000} open={snackbarOpen} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="success" sx={{ width: "100%" }} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}

export default SettingsPage;
