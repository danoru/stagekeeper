import { GetServerSideProps } from "next";
import Head from "next/head";

import ResetPasswordForm from "../src/components/account/ResetPasswordForm";

interface Props {
  token: string;
}

function ResetPasswordPage({ token }: Props) {
  return (
    <>
      <Head>
        <title>Reset Password • StageKeeper</title>
      </Head>
      <ResetPasswordForm token={token} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const token = context.query.token;
  if (typeof token !== "string" || token.length < 32) {
    return { redirect: { destination: "/forgot-password", permanent: false } };
  }
  return { props: { token } };
};

export default ResetPasswordPage;
