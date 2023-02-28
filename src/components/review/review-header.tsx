import { useRouter } from "next/router";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

function ReviewHeader() {
  const router = useRouter();
  const year = router.query.year;
  const userId = router.query.userId;

  const previousYear = Number(year) - 1;
  const prevYearURL = "/users/musicalsandmayhem/review/" + [previousYear];

  const nextYear = Number(year) + 1;
  const nextYearURL = "/users/musicalsandmayhem/review/" + [nextYear];

  function musicalScopeHandler() {
    if (userId === "all") {
      return router.push("/users/musicalsandmayhem/review/" + [year]);
    } else {
      return router.push("/users/all/review/" + [year]);
    }
  }

  const humanReadableUsername = () => {
    if (userId === "musicalsandmayhem") {
      return "Musicals and Mayhem";
    } else if (userId === "all") {
      return "All Musicals";
    } else {
      return userId;
    }
  };

  const humanReadableYear = () => {
    if (!year) {
      return "All Time Statistics";
    } else {
      return year + " Year in Review";
    }
  };

  return (
    <div>
      <h1 onClick={musicalScopeHandler}>{humanReadableUsername()}</h1>
      <h2>
        <a href={prevYearURL}>
          <ArrowBackIosIcon />
        </a>
        {humanReadableYear()}
        <a href={nextYearURL}>
          <ArrowForwardIosIcon />
        </a>
      </h2>
    </div>
  );
}

export default ReviewHeader;
