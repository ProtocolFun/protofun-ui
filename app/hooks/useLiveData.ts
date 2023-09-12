import { useStore } from "@nanostores/react"
import { useCallback, useEffect, useRef } from "react"
import { useInterval } from "usehooks-ts"

import { $liveMode, $timeframe, PriceUnit, QueryFn } from "../stores/metrics"
import { SimpleBlock } from "../utils/block-utils"
import { Candle } from "../utils/candle-utils"

export function useLiveData(
  initialTimestamp: string,
  queryFn: QueryFn,
  priceUnit: PriceUnit,
  handleNewData: (data: Candle | SimpleBlock) => void,
  active: boolean
) {
  const lastTimestamp = useRef<string>(initialTimestamp)
  const liveMode = useStore($liveMode)

  useEffect(() => {
    lastTimestamp.current = initialTimestamp
  }, [initialTimestamp])

  const tryFetch = useCallback(async () => {
    const timeframe = $timeframe.get()
    // console.log(
    //   "📜 LOG > useLiveData > since",
    //   lastTimestamp.current,
    //   timeframe
    // );

    const data = await queryFn(timeframe, lastTimestamp.current, priceUnit)
    // console.log("📜 LOG > useLiveData > response", timeframe, data);

    if (data.length) {
      lastTimestamp.current = data[data.length - 1].timestamp
      data.forEach(handleNewData)
    }
  }, [queryFn, priceUnit, handleNewData])

  useInterval(
    tryFetch,
    // Delay in milliseconds or null to stop it
    // 12 * 1000
    liveMode && active ? 3 * 1000 : null // TODO
  )
}
