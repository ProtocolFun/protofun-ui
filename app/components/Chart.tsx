"use client";

import { Box, useTheme } from "@mui/material";
import { createChart, CrosshairMode, IChartApi } from "lightweight-charts";
import React, { memo, MutableRefObject, useEffect, useRef } from "react";

import { $timeframe } from "../stores/metrics";
import { createPriceFormatter } from "../utils/chart";
import { isMobile } from "../utils/client-utils";
import { RobotoMonoFF } from "./Theme/fonts";

export type ChartProps = {
  allowCompactPriceScale?: boolean;
  chartRef: MutableRefObject<IChartApi | undefined>;
  significantDigits: number;
  unitLabel: string;
};

function Chart(props: ChartProps) {
  const { chartRef, unitLabel, significantDigits, allowCompactPriceScale } =
    props;

  const theme = useTheme();
  const containerRef = useRef<HTMLElement>();

  useEffect(() => {
    if (!containerRef.current) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({
        height: containerRef.current?.clientHeight,
        width: containerRef.current?.clientWidth,
      });
    };
    const primaryColor = theme.palette.primary.main;
    const textColor = theme.palette.text.primary;
    const borderColor = theme.palette.divider;

    chartRef.current = createChart(containerRef.current, {
      crosshair: {
        horzLine: {
          labelBackgroundColor: primaryColor,
        },
        mode: CrosshairMode.Normal,
        vertLine: {
          labelBackgroundColor: primaryColor,
        },
      },
      grid: {
        horzLines: {
          color: borderColor,
        },
        vertLines: {
          color: borderColor,
        },
      },
      // handleScroll: {
      //   mouseWheel: false,
      // },
      layout: {
        background: { color: "transparent" },
        fontFamily: RobotoMonoFF,
        textColor,
      },
      localization: {
        priceFormatter: createPriceFormatter(
          significantDigits,
          unitLabel,
          allowCompactPriceScale
        ),
      },
      width: containerRef.current.clientWidth,
    });

    chartRef.current.timeScale().applyOptions({
      borderVisible: false,
      rightOffset: isMobile ? 4 : 8,
      secondsVisible: ["Block"].includes($timeframe.get()),
      timeVisible: ["Hour", "Minute", "Block"].includes($timeframe.get()),
    });

    chartRef.current.priceScale("right").applyOptions({
      borderVisible: false,
    });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      chartRef.current?.remove();
    };
  }, [
    chartRef,
    theme,
    containerRef,
    unitLabel,
    significantDigits,
    allowCompactPriceScale,
  ]);

  return (
    <Box
      sx={{
        "& tr:first-child td": { cursor: "crosshair" },
        height: "100%",
        width: "100%",
      }}
      ref={containerRef}
    />
  );
}

export const MemoChart = memo(Chart, () => true);
