import type { GetServerSidePropsContext } from "next";

import ProductionPage from "../../../src/components/people/ProductionPage";
import { getProductionPageProps } from "../../../src/data/productionPage";

export function getServerSideProps(context: GetServerSidePropsContext) {
  return getProductionPageProps("musicals", context);
}

export default ProductionPage;
