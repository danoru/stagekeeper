import Head from "next/head";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface Props {
  title: string;
  description: string;
  /** Path on this site, e.g. "/musicals/rent". */
  path: string;
}

// Overrides the defaults in _app (matched by `key`) so shared links preview the page itself.
function PageMeta({ title, description, path }: Props) {
  const url = `${SITE_URL}${path}`;
  return (
    <Head>
      <title>{`${title} • StageKeeper`}</title>
      <meta key="description" content={description} name="description" />
      <meta key="og:title" content={title} property="og:title" />
      <meta key="og:description" content={description} property="og:description" />
      <meta key="og:url" content={url} property="og:url" />
      <meta key="twitter:title" content={title} name="twitter:title" />
      <meta key="twitter:description" content={description} name="twitter:description" />
      <link key="canonical" href={url} rel="canonical" />
    </Head>
  );
}

export default PageMeta;
