"use client"

import { Box, useTheme } from "@mui/material"
import { createChart, CrosshairMode, IChartApi } from "lightweight-charts"
import React, { memo, MutableRefObject, useEffect, useRef } from "react"

import { $timeframe } from "../stores/metric-page"
import { createPriceFormatter } from "../utils/chart"
import { isMobile } from "../utils/client-utils"
import { RobotoMonoFF } from "./Theme/fonts"

export type ChartProps = {
  allowCompactPriceScale?: boolean
  chartRef: MutableRefObject<IChartApi | undefined>
  significantDigits: number
  unitLabel: string
}

function Chart(props: ChartProps) {
  const { chartRef, unitLabel, significantDigits, allowCompactPriceScale } = props

  const theme = useTheme()
  const containerRef = useRef<HTMLElement>()

  useEffect(() => {
    if (!containerRef.current) return

    const handleResize = () => {
      chartRef.current?.applyOptions({
        height: containerRef.current?.clientHeight,
        width: containerRef.current?.clientWidth,
      })
    }
    const primaryColor = theme.palette.primary.main
    const textColor = theme.palette.text.primary
    const borderColor = theme.palette.divider
    const bgColor = theme.palette.background.default

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
        background: { color: bgColor },
        fontFamily: RobotoMonoFF,
        textColor,
      },
      localization: {
        priceFormatter: createPriceFormatter(significantDigits, unitLabel, allowCompactPriceScale),
      },
      width: containerRef.current.clientWidth,
    })

    chartRef.current.timeScale().applyOptions({
      borderVisible: false,
      rightOffset: isMobile || window.location.toString().includes("machine=true") ? 4 : 8,
      secondsVisible: ["Block"].includes($timeframe.get()),
      timeVisible: ["Hour", "Minute", "Block"].includes($timeframe.get()),
    })

    chartRef.current.priceScale("right").applyOptions({
      borderVisible: false,
      // entireTextOnly: true,
    })

    window.addEventListener("resize", handleResize)

    return function cleanup() {
      window.removeEventListener("resize", handleResize)

      chartRef.current?.remove()
    }
  }, [chartRef, theme, containerRef, unitLabel, significantDigits, allowCompactPriceScale])

  return (
    <Box
      sx={{
        "& tr:first-child td": { cursor: "crosshair" },
        height: "100%",
        width: "100%",
      }}
      ref={containerRef}
    />
  )
}

export const MemoChart = memo(Chart, () => true)
