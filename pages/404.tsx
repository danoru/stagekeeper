import Head from "next/head";
import Link from "next/link";
import { Fragment } from "react";

function ErrorPage() {
  return (
    <Fragment>
      <Head>
        <title>StageKeeper: 404</title>
      </Head>
      <blockquote cite="https://genius.com/Jonathan-groff-lost-in-the-woods-lyrics">
        Now I turn around and find I am lost in the woods, <br />
        North is south, right is left, when you&apos;re gone.
      </blockquote>
      <p>
        Are you lost? Let&apos;s get you back on <Link href="/">track</Link>.
      </p>
      <p>404 | This page could not be found.</p>
    </Fragment>
  );
}

export default ErrorPage;
