import React from "react";
import { debugLog } from "src/logger";
import { IconButton, SxProps, Theme } from "@mui/material";
import { GridOn, GridOff } from "@mui/icons-material";

export interface GridButtonProps {
  /** Called whenever the button is clicked, with the new grid state. */
  onClick: (active: boolean) => void;
  /** Optional controlled state; when omitted the button manages its own. */
  active?: boolean;
  /** Style overrides passed straight to the underlying IconButton. */
  sx?: SxProps<Theme>;
}

export default function GridButton(props: GridButtonProps) {
  //const isControlled = props.active !== undefined;
  const [internalActive, setInternalActive] = React.useState(
    props.active ?? true,
  );
  //  const active = isControlled ? (props.active as boolean) : internalActive;

  //const active = props.active as boolean;
  debugLog("Grid init state is " + internalActive);
  const handleClick = () => {
    const next = !internalActive;
    debugLog("Click next is " + next);
    props.onClick(next);

    /*if (!isControlled)*/
    setInternalActive(next);
  };

  return (
    <IconButton onClick={handleClick} size="large" sx={props.sx}>
      {internalActive ? (
        <GridOff sx={{ fontSize: "inherit" }} />
      ) : (
        <GridOn sx={{ fontSize: "inherit" }} />
      )}
    </IconButton>
  );
}
