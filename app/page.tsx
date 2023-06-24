import { captureException } from "@sentry/nextjs";
import React from "react";

import { GasPage } from "./components/HomePage/GasPage";
import { PageWrapper } from "./components/RootLayout/PageWrapper";
import { queryBlocks } from "./utils/block-utils";
import { queryCandles } from "./utils/candle-utils";

export default async function HomePage() {
  const [candles, blocks] = await Promise.all([
    queryCandles("Minute").catch((error) => {
      console.error(error);
      captureException(error);
      return [];
    }),
    queryBlocks().catch((error) => {
      console.error(error);
      captureException(error);
      return [];
    }),
  ]);

  return (
    <PageWrapper>
      <GasPage blocks={blocks} candles={candles} />
    </PageWrapper>
  );
}
