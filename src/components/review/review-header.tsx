import { useRouter } from "next/router";

function ReviewHeader(context: any) {
  const router = useRouter();
  const year = router.query.year;
  const userId = router.query.userId;

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
      <h1>{humanReadableUsername()}</h1>
      <h2>{humanReadableYear()}</h2>
    </div>
  );
}

export default ReviewHeader;
