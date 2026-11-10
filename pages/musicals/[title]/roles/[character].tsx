import type { GetServerSidePropsContext } from "next";

import RolePage from "../../../../src/components/people/RolePage";
import { getRolePageProps } from "../../../../src/data/rolePage";

export function getServerSideProps(context: GetServerSidePropsContext) {
  return getRolePageProps("musicals", context);
}

export default RolePage;
