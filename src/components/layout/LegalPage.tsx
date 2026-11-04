import { Box, Container, Typography } from "@mui/material";
import type { ReactNode } from "react";

import PageMeta from "./PageMeta";

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

interface Props {
  title: string;
  description: string;
  path: string;
  updated: string;
  children: ReactNode;
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <Box component="section" sx={{ mt: 3 }}>
      <Typography
        component="h2"
        sx={{ fontSize: "1.05rem", fontWeight: 600, color: "#E8DCC8", mb: 1 }}
      >
        {heading}
      </Typography>
      <Box
        sx={{
          color: "rgba(232,220,200,0.75)",
          fontSize: "0.92rem",
          lineHeight: 1.65,
          "& p": { m: 0, mb: 1 },
          "& ul": { m: 0, mb: 1, pl: 2.5 },
          "& a": { color: "#D4AF55" },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

/** How to reach us; shows a real address once NEXT_PUBLIC_CONTACT_EMAIL is set. */
export function ContactLine() {
  return CONTACT ? (
    <p>
      Questions? Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
    </p>
  ) : (
    <p>Questions? Use &ldquo;Report a problem&rdquo; on any page while signed in.</p>
  );
}

function LegalPage({ title, description, path, updated, children }: Props) {
  return (
    <Box sx={{ background: "#080C14", minHeight: "70vh" }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <PageMeta description={description} path={path} title={title} />
        <Typography color="secondary" component="h1" variant="h4">
          {title}
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: "rgba(232,220,200,0.45)", mt: 0.5 }}>
          Last updated {updated}
        </Typography>
        {children}
      </Container>
    </Box>
  );
}

export default LegalPage;
