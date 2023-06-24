"use client";
import { KeyboardBackspace } from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";
import { motion, Variants } from "framer-motion";
import React from "react";

import { $blockMap, $blocks, BlockMap } from "../../stores/block-data";
import {
  $minCandleMap,
  $minCandles,
  CandleMap,
} from "../../stores/candle-data";
import { SimpleBlock } from "../../utils/block-utils";
import { Candle } from "../../utils/candle-utils";
import { RobotoSerifFF } from "../Theme/fonts";
import { ChartGroup } from "./ChartGroup";

const variants: Variants = {
  closed: {
    opacity: 0,
    transition: {
      // duration: 0.25,
      // ease: "easeInOut",
      damping: 40,
      stiffness: 240,
      type: "spring",
    },
    y: 50,
  },
  open: {
    opacity: 1,
    transition: {
      // duration: 0.25,
      // ease: "easeInOut",
      damping: 40,
      stiffness: 240,
      type: "spring",
    },
    y: 0,
  },
};

export interface GasPageProps {
  blocks: SimpleBlock[];
  candles: Candle[];
}

export function GasPage(props: GasPageProps) {
  const { blocks, candles } = props;
  // console.log("📜 LOG > GasPage render");

  const blockMap = blocks.reduce((acc, curr) => {
    acc[curr.timestamp] = curr;
    return acc;
  }, {} as BlockMap);

  $blocks.set(blocks);
  $blockMap.set(blockMap);

  const candleMap = candles.reduce((acc, curr) => {
    acc[curr.timestamp] = curr;
    return acc;
  }, {} as CandleMap);

  $minCandles.set(candles);
  $minCandleMap.set(candleMap);

  return (
    <Stack
      alignItems={"flex-start"}
      gap={0}
      component={motion.div}
      initial={"closed"}
      animate={"open"}
      variants={{
        closed: {
          // transition: { staggerChildren: 0.05, staggerDirection: -1 },
        },
        open: {
          transition: { staggerChildren: 0.15 },
        },
      }}
      transition={{ duration: 5 }}
    >
      <motion.div variants={variants}>
        <Button
          size="small"
          sx={{ borderRadius: 16, paddingLeft: 1, paddingRight: 2 }}
          startIcon={<KeyboardBackspace />}
        >
          Ethereum
        </Button>
      </motion.div>
      <motion.div
        variants={variants}
        style={{
          marginBottom: 32,
          marginTop: 16,
          position: "relative",
        }}
      >
        <Typography variant="h4" fontWeight={500} fontFamily={RobotoSerifFF}>
          Base fee per gas
        </Typography>
        <motion.div
          style={{
            background: "var(--mui-palette-secondary-main)",
            bottom: 0,
            content: '""',
            height: 16,
            left: 0,
            opacity: 1,
            position: "absolute",
            transform: "skew(-12deg) translateX(12px)",
            zIndex: -1,
          }}
          animate={{
            marginLeft: [0, 0, 280],
            width: [0, 280, 0],
          }}
          transition={{
            delay: 0.2,
            duration: 1,
            ease: "easeInOut",
          }}
        ></motion.div>
      </motion.div>
      <motion.div style={{ width: "100%" }} variants={variants}>
        <ChartGroup />
      </motion.div>
    </Stack>
  );
}
