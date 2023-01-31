import { Fragment } from "react";
import Head from "next/head";

function ErrorPage() {
  return (
    <Fragment>
      <Head>
        <title>StageKeeper: 404</title>
      </Head>
      <blockquote cite="https://genius.com/Jonathan-groff-lost-in-the-woods-lyrics">
        Now I turn around and find I am lost in the woods, <br />
        North is south, right is left, when you're gone.
      </blockquote>
      <p>
        Are you lost? Let's get you back on <a href="/">track</a>.
      </p>
      <p>404 | This page could not be found.</p>
    </Fragment>
  );
}

export default ErrorPage;
