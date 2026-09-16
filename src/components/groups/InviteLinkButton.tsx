import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Button, Snackbar } from "@mui/material";
import { useState } from "react";

interface Props {
  inviteToken: string;
}

// Copies the group's invite URL; the full link lives in group settings.
function InviteLinkButton({ inviteToken }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/groups/join/${inviteToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt("Copy this invite link:", url);
    }
  }

  return (
    <>
      <Button
        size="small"
        startIcon={<ContentCopyIcon fontSize="small" />}
        sx={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#D4AF55",
          borderColor: "rgba(212,175,85,0.4)",
          "&:hover": { borderColor: "#D4AF55", background: "rgba(212,175,85,0.08)" },
        }}
        variant="outlined"
        onClick={copy}
      >
        Invite
      </Button>
      <Snackbar
        autoHideDuration={3000}
        message="Invite link copied — paste it in your group chat."
        open={copied}
        onClose={() => setCopied(false)}
      />
    </>
  );
}

export default InviteLinkButton;
