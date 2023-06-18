import { useCallback, useRef } from "react";
import { useInterval } from "usehooks-ts";

import { getBuiltGraphSDK } from "../../.graphclient";
import { SimpleBlock } from "../utils/client-utils";

export function useNewBlocksSub(
  initialTimestamp: string,
  onNewBlock: (block: SimpleBlock) => void
) {
  const lastTimestamp = useRef<string>(initialTimestamp);

  const tryFetch = useCallback(async () => {
    console.log("📜 LOG > useLatestBlocks > since", lastTimestamp.current);
    const sdk = getBuiltGraphSDK();
    const { blocks } = await sdk.FetchBlocksSince({
      since: lastTimestamp.current,
    });
    console.log("📜 LOG > useLatestBlocks > response", blocks);

    if (blocks.length) {
      lastTimestamp.current = blocks[blocks.length - 1].timestamp;
      blocks.forEach(onNewBlock);
    }
  }, [onNewBlock]);

  useInterval(
    tryFetch,
    // Delay in milliseconds or null to stop it
    // 12 * 1000
    1000 // TODO
  );
}