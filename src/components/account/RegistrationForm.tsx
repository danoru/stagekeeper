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

import {
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from "../../utils/validation";

import AuthCard, { authFooterLinkSx, authFooterSx } from "./AuthCard";
import { safeCallbackUrl } from "./LoginForm";

const validationSchema = Yup.object({
  email: Yup.string().trim().email("Enter a valid email.").required("Email is required."),
  username: Yup.string()
    .trim()
    .min(USERNAME_MIN_LENGTH, `At least ${USERNAME_MIN_LENGTH} characters.`)
    .max(USERNAME_MAX_LENGTH, `At most ${USERNAME_MAX_LENGTH} characters.`)
    .matches(USERNAME_PATTERN, "Letters, numbers, . _ and - only.")
    .required("Username is required."),
  password: Yup.string()
    .min(PASSWORD_MIN_LENGTH, `At least ${PASSWORD_MIN_LENGTH} characters.`)
    .required("Password is required."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match.")
    .required("Confirm your password."),
});

interface FormValues {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

function RegistrationForm() {
  const router = useRouter();
  // New accounts go through onboarding unless they arrived via an invite link.
  const callbackUrl = safeCallbackUrl(router.query.callbackUrl, "/welcome");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  async function handleSubmit(
    values: FormValues,
    { setSubmitting }: { setSubmitting: (b: boolean) => void }
  ) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.email.trim(),
        username: values.username.trim(),
        password: values.password,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSnackbarMessage(data.error ?? "Could not create your account.");
      setSnackbarOpen(true);
      setSubmitting(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      username: values.username.trim(),
      password: values.password,
      redirect: false,
    });
    if (signInResult?.error) {
      // Account exists; let them sign in manually.
      router.push("/login");
      return;
    }
    router.push(callbackUrl);
  }

  const initialValues: FormValues = { email: "", username: "", password: "", confirmPassword: "" };

  return (
    <AuthCard subtitle="Start your theatre logbook" title="Create an Account">
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
              autoComplete="email"
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
              id="email"
              label="Email"
              margin="normal"
              name="email"
              type="email"
              value={values.email}
              variant="outlined"
              onBlur={handleBlur}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              required
              autoComplete="username"
              error={touched.username && !!errors.username}
              helperText={(touched.username && errors.username) || "This is how friends find you."}
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
              autoComplete="new-password"
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
            <TextField
              fullWidth
              required
              autoComplete="new-password"
              error={touched.confirmPassword && !!errors.confirmPassword}
              helperText={touched.confirmPassword && errors.confirmPassword}
              id="confirmPassword"
              label="Confirm Password"
              margin="normal"
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
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
              {isSubmitting ? "Creating…" : "Create Account"}
            </Button>
            <Box sx={authFooterSx}>
              <Link href="/login" sx={authFooterLinkSx} underline="none">
                Already have an account?{" "}
                <Box component="span" sx={{ color: "#D4AF55", fontWeight: 500 }}>
                  Sign in
                </Box>
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

export default RegistrationForm;
