"use client";
import { Box } from "@mui/material";
import { HTMLMotionProps, motion } from "framer-motion";
import React from "react";

export function PageWrapper(props: HTMLMotionProps<"div">) {
  return (
    <Box
      component={motion.div}
      sx={{ paddingX: 2, width: "100%" }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{
        duration: 0.25,
        // damping: 20,
        // stiffness: 160,
        // type: "spring",
      }}
      {...props}
    />
  );
}
