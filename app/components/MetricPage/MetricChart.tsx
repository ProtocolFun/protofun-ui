import { useTheme } from "@mui/material";
import { useStore } from "@nanostores/react";
import { captureException } from "@sentry/nextjs";
import { motion } from "framer-motion";
import {
  IChartApi,
  ISeriesApi,
  MouseEventHandler,
  MouseEventParams,
  Time,
} from "lightweight-charts";
import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  $entries,
  $entryMap,
  $legendTimestamp,
  $loading,
  $scaleMode,
  $seriesType,
  $timeframe,
  candleStickOptions,
  EntryMap,
} from "../../stores/metric-page";
import {
  createBlockMapper,
  isBlockArray,
  queryBlocks,
  SimpleBlock,
} from "../../utils/block-utils";
import {
  Candle,
  createCandleMapper,
  createLineMapper,
  isCandleArray,
  queryCandles,
} from "../../utils/candle-utils";
import { TZ_OFFSET } from "../../utils/client-utils";
import { MemoChart } from "../Chart";
import { ErrorOverlay } from "../ErrorOverlay";
import { Progress } from "../Progress";
import { BlockChartLegend } from "./BlockChartLegend";
import { CandleChartLegend } from "./CandleChartLegend";

const mapCandleToCandleData = createCandleMapper(1e9);
const mapCandleToLineData = createLineMapper(1e9);
const mapBlockToLine = createBlockMapper("baseFeePerGas", 1e9);

export function MetricChart() {
  const theme = useTheme();
  const crosshairSubRef = useRef<MouseEventHandler>();
  const chartRef = useRef<IChartApi>();
  const mainSeries = useRef<ISeriesApi<"Candlestick" | "Line">>();
  const loading = useStore($loading);

  const timeframe = useStore($timeframe);
  const data = useStore($entries);
  const seriesType = useStore($seriesType);

  const [error, setError] = useState<string>("");

  console.log("📜 LOG > MetricChart render", data.length, loading);
  useEffect(() => {
    if ($loading.get()) return;
    console.log("📜 LOG > MetricChart > fetching");

    $loading.set(true);
    setError("");

    const fetchPromise =
      timeframe === "Block" ? queryBlocks() : queryCandles(timeframe);

    fetchPromise
      .then((data) => {
        const map = (data as Array<Candle | SimpleBlock>).reduce(
          (acc, curr) => {
            acc[curr.timestamp] = curr;
            return acc;
          },
          {} as EntryMap
        );

        $entryMap.set(map);
        $entries.set(data);
        console.log("📜 LOG > MetricChart > fetching finished");
      })
      .then(() => {
        $loading.set(false);
      })
      .catch((error) => {
        console.error(error);
        captureException(error);
        setError(`${error.name}: ${error.message}`);
        $loading.set(false);
      });
  }, [timeframe]);

  const mainSeriesData = useMemo(() => {
    if (data.length === 0) return [];

    if (isBlockArray(data)) {
      return data.map(mapBlockToLine);
    }

    if (!isCandleArray(data)) {
      throw new Error("This should never happen!");
    }

    return seriesType === "Candlestick"
      ? data.map(mapCandleToCandleData)
      : data.map(mapCandleToLineData);
  }, [data, seriesType]);

  useEffect(() => {
    $scaleMode.subscribe((mode) => {
      chartRef.current?.priceScale("right").applyOptions({
        mode,
      });
    });
  }, []);

  useEffect(() => {
    $legendTimestamp.set(data[data.length - 1]?.timestamp);
  }, [data]);

  useEffect(() => {
    console.log(
      "📜 LOG > MetricChart > useEffect > createSeries:",
      // !!mainSeries.current,
      !!chartRef.current,
      mainSeriesData.length
    );
    if (mainSeriesData.length === 0) return;
    if (mainSeries.current) {
      try {
        chartRef.current?.removeSeries(mainSeries.current);
      } catch (e) {}
    }

    if (seriesType === "Candlestick") {
      mainSeries.current =
        chartRef.current?.addCandlestickSeries(candleStickOptions);
    } else {
      const primaryColor = theme.palette.primary.main;
      mainSeries.current = chartRef.current?.addLineSeries({
        color: primaryColor,
        lineType: 2,
      });
    }

    mainSeries.current?.setData(mainSeriesData);
    chartRef.current?.priceScale("right").applyOptions({
      mode: $scaleMode.get(),
    });
  }, [mainSeriesData, theme, seriesType]);

  useEffect(() => {
    if (crosshairSubRef.current) {
      chartRef.current?.unsubscribeCrosshairMove(crosshairSubRef.current);
    }

    const subRef = ({ time, point }: MouseEventParams) => {
      const validCrosshairPoint = !(
        !time ||
        !point?.x ||
        !point?.y ||
        point.x < 0 ||
        point.y < 0
      );

      if (!validCrosshairPoint) {
        const lastBar = mainSeries.current?.dataByIndex(Infinity, -1);
        time = lastBar?.time as Time;
      }

      $legendTimestamp.set(String((time as number) + TZ_OFFSET)); // TODO: looks like legend it's behind 1hr
    };
    chartRef.current?.subscribeCrosshairMove(subRef);

    crosshairSubRef.current = subRef;

    const chart = chartRef.current;
    return function cleanup() {
      chart?.unsubscribeCrosshairMove(subRef);
    };
  }, [mainSeriesData]);

  // const handleNewCandle = useCallback((candle: Candle) => {
  //   $candles.get().push(candle);
  //   $candleMap.setKey(candle.timestamp, candle);
  //   $legendTimestamp.set(candle.timestamp);
  //   mainSeries.current?.update(mapCandleToCandleData(candle));
  // }, []);

  // useNewCandlesSub(data[data.length - 1]?.timestamp, handleNewCandle, !error);

  // const handleNewBlock = useCallback((block: SimpleBlock) => {
  //   $blockMap.setKey(block.timestamp, block);
  //   $blocks.get().push(block);
  //   $legendTimestamp.set(block.timestamp);
  //   mainSeries.current?.update(mapBlockToLine(block));
  // }, []);

  // useNewBlocksSub(data[data.length - 1]?.timestamp, handleNewBlock, !error);
  // console.log("📜 LOG > BlockChart > data.length:", data.length);

  return (
    <>
      <Progress loading={loading} />
      <ErrorOverlay errorMessage={error} />
      {!loading && timeframe === "Block" && <BlockChartLegend />}
      {!loading && timeframe !== "Block" && <CandleChartLegend />}
      <motion.div
        style={{
          height: "100%",
          width: "100%",
        }}
        animate={error ? "errored" : loading ? "loading" : "ready"}
        variants={{
          errored: {
            opacity: 0,
          },
          loading: {
            opacity: 0.25,
          },
          ready: {
            opacity: 1,
          },
        }}
      >
        <MemoChart chartRef={chartRef} />
      </motion.div>
    </>
  );
}
