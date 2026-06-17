import * as React from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { Typography } from "@mui/material";

/**
 * Shown in place of the editable menu once the polymer has been generated (the
 * final/locked step). Same style as PolyplyDisclaimer (Welcome alert) but with
 * no close button — the editing tools stay hidden until a new session.
 */
export default function PolyplyFinalStep() {
  return (
    <Box sx={{ width: "100%", padding: "0 1rem" }}>
      <Alert sx={{ mb: 2 }}>
        <AlertTitle>Thank you for using the Polymer Editor</AlertTitle>
        <Typography variant="body2">
          You may prolongate your work by restarting the editor and upload the
          files you just generated
        </Typography>
      </Alert>
    </Box>
  );
}
