import { useRouter } from "next/router";

function ProfilePage() {
  const humanReadableUsername = () => {
    const router = useRouter();
    const userId = router.query.userId;

    if (userId === "musicalsandmayhem") {
      return "Musicals and Mayhem";
    } else if (userId === "all") {
      return "Everyone";
    } else {
      return userId;
    }
  };

  return (
    <div>
      <h1>Hello, {humanReadableUsername()}!</h1>
      <p>
        This page is under construction. Know what you'd want to see here?
        Contact the administrator with your ideas!
      </p>
    </div>
  );
}

export default ProfilePage;
