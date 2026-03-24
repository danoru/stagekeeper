import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { Formik, Form } from "formik";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import * as Yup from "yup";

function LoginForm() {
  const router = useRouter();
  const initialValues = { username: "", password: "", rememberMe: false };
  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required."),
    password: Yup.string().required("Password is required."),
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  async function handleSubmit(
    values: { username: string; password: string; rememberMe: boolean },
    { setSubmitting, setErrors }: any
  ) {
    const response = await signIn("credentials", {
      username: values.username,
      password: values.password,
      remember: values.rememberMe,
      redirect: false,
    });

    if (response?.error) {
      setErrors({ submit: response.error });
      setSnackbarMessage("Login failed. Your credentials do not match.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage("Login successful. Redirecting…");
      setSnackbarOpen(true);
      setSnackbarSeverity("success");
      router.push("/");
      router.refresh();
    }

    setSubmitting(false);
  }

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
        {/* Header */}
        <Box
          sx={{
            borderBottom: "1px solid rgba(212,175,85,0.12)",
            background: "linear-gradient(180deg, #0F1A28 0%, #0D1520 100%)",
            px: 4,
            py: 3,
            textAlign: "center",
          }}
        >
          {/* Gold rule + eyebrow */}
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
            Welcome Back
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
            Sign in to your archive
          </Typography>
        </Box>

        {/* Form */}
        <Box sx={{ px: 4, py: 4 }}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched, handleChange, handleBlur, values }) => (
              <Form>
                <TextField
                  autoFocus
                  fullWidth
                  required
                  error={touched.username && !!errors.username}
                  helperText={touched.username && errors.username}
                  id="username"
                  label="Username"
                  margin="normal"
                  name="username"
                  value={values.username}
                  variant="outlined"
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  required
                  autoComplete="current-password"
                  error={touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                  id="password"
                  label="Password"
                  margin="normal"
                  name="password"
                  type="password"
                  value={values.password}
                  variant="outlined"
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.rememberMe}
                      color="primary"
                      name="rememberMe"
                      onChange={handleChange}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: "0.82rem", color: "rgba(232,220,200,0.6)" }}>
                      Remember me
                    </Typography>
                  }
                />
                <Button
                  fullWidth
                  disabled={isSubmitting}
                  type="submit"
                  variant="contained"
                  sx={{ mt: 1, mb: 2.5, py: 1.25, fontSize: "0.75rem", letterSpacing: "0.1em" }}
                >
                  {isSubmitting ? "Signing in…" : "Sign In"}
                </Button>
                <Box
                  sx={{ textAlign: "center", borderTop: "1px solid rgba(212,175,85,0.1)", pt: 2.5 }}
                >
                  <Link
                    href="/register"
                    underline="none"
                    sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.78rem",
                      color: "rgba(232,220,200,0.5)",
                      transition: "color 0.2s",
                      "&:hover": { color: "#D4AF55" },
                    }}
                  >
                    Don&apos;t have an account?{" "}
                    <Box component="span" sx={{ color: "#D4AF55", fontWeight: 500 }}>
                      Create one
                    </Box>
                  </Link>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </Box>

      <Snackbar autoHideDuration={6000} open={snackbarOpen} onClose={() => setSnackbarOpen(false)}>
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default LoginForm;
