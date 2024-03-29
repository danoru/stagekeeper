import { useRouter } from "next/router";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

function ReviewHeader() {
  const router = useRouter();
  const year = router.query.year;
  const userId = router.query.userId;

  const previousYear = Number(year) - 1;
  const prevYearURL = "/users/" + userId + "/review/" + [previousYear];

  const nextYear = Number(year) + 1;
  const nextYearURL = "/users/" + userId + "/review/" + [nextYear];

  function musicalScopeHandler() {
    if (userId === "all") {
      return router.push("/users/" + userId + "/review/" + [year]);
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

  const prevYearCheck = () => {
    if (!previousYear || previousYear < 2022) {
      return;
    } else {
      return (
        <a href={prevYearURL}>
          <ArrowBackIosIcon />
        </a>
      );
    }
  };

  console.log(year);
  console.log(nextYear);

  const nextYearCheck = () => {
    if (!nextYear || nextYear > 2024) {
      return;
    } else {
      return (
        <a href={nextYearURL}>
          <ArrowForwardIosIcon />
        </a>
      );
    }
  };

  return (
    <div>
      <h1 onClick={musicalScopeHandler}>{humanReadableUsername()}</h1>
      <h2>
        {prevYearCheck()}
        {humanReadableYear()}
        {nextYearCheck()}
      </h2>
    </div>
  );
}

export default ReviewHeader;
