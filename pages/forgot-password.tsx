import Head from "next/head";

import ForgotPasswordForm from "../src/components/account/ForgotPasswordForm";

function ForgotPasswordPage() {
  return (
    <>
      <Head>
        <title>Forgot Password • StageKeeper</title>
      </Head>
      <ForgotPasswordForm />
    </>
  );
}

export default ForgotPasswordPage;
