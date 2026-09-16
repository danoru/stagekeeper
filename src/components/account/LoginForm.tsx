import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { useState } from "react";
import * as Yup from "yup";

import AuthCard, { authFooterLinkSx, authFooterSx } from "./AuthCard";

// Only follow same-origin redirects so a crafted link can't bounce users off-site.
export function safeCallbackUrl(raw: unknown, fallback = "/") {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const callbackUrl = safeCallbackUrl(router.query.callbackUrl);
  const initialValues = { username: "", password: "" };
  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required."),
    password: Yup.string().required("Password is required."),
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  async function handleSubmit(
    values: { username: string; password: string },
    { setSubmitting }: { setSubmitting: (b: boolean) => void }
  ) {
    const response = await signIn("credentials", {
      username: values.username.trim(),
      password: values.password,
      redirect: false,
    });

    if (response?.error) {
      setSnackbarMessage(
        response.error === "CredentialsSignin"
          ? "Login failed. Your credentials do not match."
          : response.error
      );
      setSnackbarOpen(true);
      setSubmitting(false);
      return;
    }
    router.push(callbackUrl);
  }

  return (
    <AuthCard subtitle="Sign in to your archive" title="Welcome Back">
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
              autoComplete="username"
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
            <Button
              fullWidth
              disabled={isSubmitting}
              sx={{ mt: 2, mb: 2.5, py: 1.25, fontSize: "0.75rem", letterSpacing: "0.1em" }}
              type="submit"
              variant="contained"
            >
              {isSubmitting ? "Signing in…" : "Sign In"}
            </Button>
            <Box sx={authFooterSx}>
              <Link
                href={`/register${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
                sx={authFooterLinkSx}
                underline="none"
              >
                Don&apos;t have an account?{" "}
                <Box component="span" sx={{ color: "#D4AF55", fontWeight: 500 }}>
                  Create one
                </Box>
              </Link>
              <Link href="/forgot-password" sx={authFooterLinkSx} underline="none">
                Forgot your password?
              </Link>
            </Box>
          </Form>
        )}
      </Formik>

      <Snackbar autoHideDuration={6000} open={snackbarOpen} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </AuthCard>
  );
}

export default LoginForm;
