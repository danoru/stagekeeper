import Typography from "@mui/material/Typography";

interface Props {
  sessionUser: string;
}

function LoggedInHomePage({ sessionUser }: Props) {
  return (
    <main>
      <Typography variant="body1">
        Welcome back, {sessionUser}. Here's where your homepage information will
        be.
      </Typography>
    </main>
  );
}

export default LoggedInHomePage;
