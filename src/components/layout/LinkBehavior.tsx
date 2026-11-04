import NextLink from "next/link";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

type Props = Omit<ComponentPropsWithoutRef<"a">, "href"> & { href?: string };

// The theme makes this the default for MUI links and buttons, so in-app links navigate on the
// client instead of reloading the whole app. External links, mail links and API routes (like the
// data download) still need a real request. Prefetching waits for hover: a page full of links
// shouldn't download every list page they point to.
const LinkBehavior = forwardRef<HTMLAnchorElement, Props>(function LinkBehavior(
  { href, ...props },
  ref
) {
  const isInternalPage =
    href !== undefined &&
    href.startsWith("/") &&
    !href.startsWith("//") &&
    !href.startsWith("/api/");
  if (!isInternalPage || props.target === "_blank" || props.download !== undefined) {
    return <a ref={ref} href={href} {...props} />;
  }
  return <NextLink ref={ref} href={href} prefetch={false} {...props} />;
});

export default LinkBehavior;
