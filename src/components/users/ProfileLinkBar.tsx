import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Grid from "@mui/material/Grid";
import moment from "moment";

interface Props {
  username: string;
}

function ProfileLinkBar({ username }: Props) {
  const currentYear = moment().format("YYYY");
  return (
    <Grid
      container
      item
      xs={12}
      style={{ justifyContent: "center", margin: "10px 0" }}
    >
      <ButtonGroup
        variant="outlined"
        aria-label="Button Group"
        sx={{ flexWrap: "wrap" }}
      >
        <Button href={`/users/${username}`}>Profile</Button>
        {/* <Button href={`/users/${username}/activity`}>Activity</Button> */}
        {/* <Button href={`/users/${username}/activity`}>Activity</Button> */}
        <Button href={`/users/${username}/musicals`}>Musicals</Button>
        <Button href={`/users/${username}/review/${currentYear}`}>
          Year-in-Review
        </Button>
        {/* <Button href={`/users/${username}/musicals/reviews`}>Reviews</Button> */}
        <Button href={`/users/${username}/watchlist`}>Watchlist</Button>
        {/* <Button disabled href={`/users/${username}/lists`}>
          Lists
        </Button> */}
        <Button href={`/users/${username}/likes`}>Likes</Button>
        {/* <Button disabled href={`/users/${username}/tags`}>
          Tags
        </Button> */}
        <Button href={`/users/${username}/following`}>Network</Button>
      </ButtonGroup>
    </Grid>
  );
}

export default ProfileLinkBar;
