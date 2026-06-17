import * as React from "react";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import UndoIcon from "@mui/icons-material/Undo";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import HandymanIcon from "@mui/icons-material/Handyman";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { styled } from "@mui/system";
import {
  makeStyles,
  useTheme,
  Theme,
  createStyles,
} from "@material-ui/core/styles";
interface PCProps {
  onUndo: () => void;
  onSubmit: () => void;
  onError: boolean;
  onRepairClick: () => void;
}
// Does not work, must look into dom
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    controls: {
      // Vertical padding gives the buttons their height; the ButtonGroup's
      // align-items:stretch then equalises both buttons so the divider is full.
      paddingTop: "0.5em",
      paddingBottom: "0.5em",
    },
    leftControls: {
      paddingLeft: "0.em",
      paddingRight: "30px",
    },
    rightControls: {
      paddingLeft: "1rem",
      paddingRight: "0rem",
    },
  }),
);

const MuiButton = styled(Button)({
  // Space the icon from the "Fix a bond" label (button is inline-flex).
  gap: "0.4rem",
  "&.Mui-disabled": {
    borderColor:
      "rgba(25, 118, 210, 0.5) transparent rgba(25, 118, 210, 0.5) rgba(25, 118, 210, 0.5)",
  },
  "&.MuiButton-outlined.Mui-disabled": {
    borderColor:
      "rgba(25, 118, 210, 0.5) transparent rgba(25, 118, 210, 0.5) rgba(25, 118, 210, 0.5)",
  },
  "&.MuiButton-contained.Mui-disabled": {
    borderColor:
      "rgba(25, 118, 210, 0.5) transparent rgba(25, 118, 210, 0.5) rgba(25, 118, 210, 0.5)",
  },
});

export default function PolyplyControls(props: PCProps) {
  const classes = useStyles();

  return (
    <ButtonGroup
      size="large"
      variant="text"
      fullWidth
      aria-label="Disabled button group"
      // stretch so both buttons share the tallest height -> the divider spans
      // the full height and each button's content stays vertically centered.
      sx={{ width: "100%", alignItems: "stretch" }}
    >
      {/*
        <Button
            onClick={props.onUndo}
            style={{paddingLeft:'1em', paddingRight:'1em',  paddingTop:'1em'}}
        >
            Cancel <UndoIcon/>
        </Button>
        */}
      {props.onError ? (
        <Button
          className={`${classes.controls} ${classes.leftControls}`}
          onClick={props.onRepairClick}
        >
          Bond Fixer <HandymanIcon />
        </Button>
      ) : (
        <MuiButton
          className={`${classes.controls} ${classes.leftControls}`}
          disabled
        >
          <HandymanIcon /> Fix a bond
        </MuiButton>
      )}

      <Button
        className={`${classes.controls} ${classes.rightControls}`}
        onClick={() => {
          props.onSubmit();
        }}
      >
        Create Polymer <PlayCircleIcon fontSize="large" />
      </Button>
    </ButtonGroup>
  );
}
