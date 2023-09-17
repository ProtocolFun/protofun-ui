import { Dialog } from "@mui/material"
import React from "react"

import { PopoverToggleProps } from "../../../utils/client-utils"
import { PopoverPaper, PopoverPaperProps } from "../../PopoverPaper"
import { NotifContents } from "../Notifications/NotifContents"

const DIALOG_WIDTH = 380
const DIALOG_HEIGHT = 600

export default function NotificationsDialog({
  anchorEl,
  open,
  toggleOpen,
}: { anchorEl: any } & PopoverToggleProps) {
  return (
    <>
      <Dialog
        keepMounted
        open={open}
        onClose={toggleOpen}
        aria-labelledby="notif-dialog-title"
        aria-describedby="notif-dialog-description"
        sx={{
          zIndex: "var(--mui-zIndex-popover)",
        }}
        slotProps={{
          backdrop: {
            className: "blurred",
          },
        }}
        PaperProps={
          {
            popoverProps: {
              anchorEl,
              anchorOrigin: {
                horizontal: "right",
                vertical: "bottom",
              },
              keepMounted: true,
              onClose: toggleOpen,
              open,
              sx: {
                zIndex: "var(--mui-zIndex-popover)",
              },
            },
            sx: {
              background: "var(--mui-palette-secondary-main)",
              border: "1px solid var(--mui-palette-TableCell-border)",
              height: DIALOG_HEIGHT,
              margin: 0,
              marginTop: 2,
              width: `min(calc(100vw - 32px), ${DIALOG_WIDTH}px) !important`,
            },
          } as PopoverPaperProps
        }
        PaperComponent={PopoverPaper as never}
      >
        <NotifContents toggleOpen={toggleOpen} />
      </Dialog>
    </>
  )
}