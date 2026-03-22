import Box from "@mui/material/Box";
import Head from "next/head";

import ProfileLinkBar from "./ProfileLinkBar";

interface Props {
  username: string;
  title: string;
  children: React.ReactNode;
}

export default function ProfilePageWrapper({ username, title, children }: Props) {
  return (
    <Box sx={{ background: "#080C14", minHeight: "100vh" }}>
      <Head>
        <title>{title}</title>
      </Head>
      <ProfileLinkBar username={username} />
      {children}
    </Box>
  );
}
