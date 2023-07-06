import {
  Animation,
  DisplaySettings,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import { Button, ButtonGroup } from "@mui/material";
import { useStore } from "@nanostores/react";
import React, { useEffect } from "react";

import { $reducedMotion, ReducedMotionConfig } from "../../../stores/app";

export function ReducedMotion() {
  const reducedMotion = useStore($reducedMotion);
  console.log("📜 LOG > ReducedMotion > reducedMotion:", reducedMotion);

  useEffect(() => {
    const preferred = localStorage.getItem("reduced-motion");
    console.log("📜 LOG > useEffect > preferred:", preferred);
    if (preferred) {
      $reducedMotion.set(preferred as ReducedMotionConfig);
    }
  }, []);

  return (
    <ButtonGroup variant="outlined" size="large">
      <Button
        className={reducedMotion === "always" ? "active" : ""}
        startIcon={
          <RadioButtonUnchecked
            sx={{
              fontSize: "16px !important",
            }}
          />
        }
        onClick={() => {
          $reducedMotion.set("always");
          localStorage.setItem("reduced-motion", "always");
        }}
      >
        Fewer
      </Button>
      <Button
        className={reducedMotion === "user" ? "active" : ""}
        startIcon={<DisplaySettings />}
        onClick={() => {
          $reducedMotion.set("user");
          localStorage.setItem("reduced-motion", "user");
        }}
      >
        System
      </Button>
      <Button
        className={reducedMotion === "never" ? "active" : ""}
        startIcon={<Animation />}
        onClick={() => {
          $reducedMotion.set("never");
          localStorage.setItem("reduced-motion", "never");
        }}
      >
        More
      </Button>
    </ButtonGroup>
  );
}
