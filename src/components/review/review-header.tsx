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
    }
  };

  return (
    <div>
      <h1>{humanReadableUsername()}</h1>
      <h2>{year} Year in Review</h2>
    </div>
  );
}

export default ReviewHeader;
