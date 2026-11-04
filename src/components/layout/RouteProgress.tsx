import { LinearProgress } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const SHOW_AFTER_MS = 150;

// A slim bar while the next page loads, so a slow request reads as progress rather than a dead
// click. Skipped for navigations quick enough not to need it.
function RouteProgress() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setLoading(true), SHOW_AFTER_MS);
    };
    const stop = () => {
      clearTimeout(timer);
      setLoading(false);
    };
    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", stop);
    router.events.on("routeChangeError", stop);
    return () => {
      clearTimeout(timer);
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", stop);
      router.events.off("routeChangeError", stop);
    };
  }, [router.events]);

  if (!loading) return null;
  return (
    <LinearProgress
      aria-label="Loading page"
      sx={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 2000 }}
    />
  );
}

export default RouteProgress;
