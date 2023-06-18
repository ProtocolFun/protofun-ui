"use client";

import { Box, useTheme } from "@mui/material";
import { createChart, ISeriesApi, MouseEventParams } from "lightweight-charts";
import React, { useCallback, useEffect, useMemo, useRef } from "react";

import { useBlockMap } from "../../hooks/useBlockMapContext";
import { useLegend } from "../../hooks/useLegendContext";
import { useNewBlocksSub } from "../../hooks/useNewBlocksSub";
import {
  mapBlockToLineData,
  SimpleBlock,
  timezoneOffset,
} from "../../utils/client-utils";
import { RobotoMonoFF } from "../Theme/fonts";

interface GasChartProps {
  initialData: SimpleBlock[];
}

export function GasChart(props: GasChartProps) {
  const { initialData } = props;

  const data = useMemo(
    () => initialData.map(mapBlockToLineData),
    [initialData]
  );

  const theme = useTheme();

  const containerRef = useRef<HTMLElement>();
  const lineSeries = useRef<ISeriesApi<"Line">>();
  const { setTimestamp: setLegendTimestamp } = useLegend();
  const { setItem } = useBlockMap();

  const handleNewBlock = useCallback(
    (data: SimpleBlock) => {
      setItem(data);
      lineSeries.current?.update(mapBlockToLineData(data));
    },
    [setItem]
  );

  useNewBlocksSub(
    initialData[initialData.length - 1].timestamp,
    handleNewBlock
  );

  useEffect(() => {
    if (!containerRef.current) return;
    console.log("📜 LOG > useEffect");

    const handleResize = () => {
      chart.applyOptions({
        width: containerRef.current?.clientWidth,
      });
    };
    const lineColor = theme.palette.primary.main;
    const textColor = theme.palette.text.primary;
    const borderColor = theme.palette.secondary.main;

    const chart = createChart(containerRef.current, {
      crosshair: {
        mode: 0,
      },
      grid: {
        horzLines: {
          color: borderColor,
        },
        vertLines: {
          color: borderColor,
        },
      },
      height: 400,
      layout: {
        background: { color: "transparent" },
        fontFamily: RobotoMonoFF,
        textColor,
      },
      localization: {
        priceFormatter: (x: number) => `${x.toFixed(2)} Gwei`,
      },
      width: containerRef.current.clientWidth,
    });
    chart.timeScale().applyOptions({
      // barSpacing: 10,
      borderVisible: false,
      // borderColor,

      secondsVisible: true,
      timeVisible: true,
    });
    // chart.timeScale().fitContent();

    lineSeries.current = chart.addLineSeries({
      color: lineColor,
    });
    lineSeries.current.setData(data);

    chart.priceScale("right").applyOptions({
      // mode: 1, // LOG
      // autoScale: true,
      // borderColor,
      borderVisible: false,
    });

    // const secondLine = chart.addLineSeries({
    //   color: lineColor,
    // });
    // secondLine.setData(data.map((x) => ({ time: x.time, value: x.value - 5 })));
    // chart.priceScale("right2").applyOptions({
    //   // mode: 1, // LOG
    //   // autoScale: false,
    //   visible: true,
    // });

    const updateLegend = ({ time, point }: MouseEventParams) => {
      const validCrosshairPoint = !(
        !time ||
        !point?.x ||
        !point?.y ||
        point.x < 0 ||
        point.y < 0
      );

      if (validCrosshairPoint) {
        setLegendTimestamp(String((time as number) + timezoneOffset));
      } else {
        setLegendTimestamp(undefined);
      }
    };

    chart.subscribeCrosshairMove(updateLegend);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      chart.remove();
    };
  }, [data, theme, setLegendTimestamp, containerRef]);

  return <Box ref={containerRef} />;
}
