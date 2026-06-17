import { debugLog } from '../../../../logger';
import React from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import { FormControl, Box, IconButton } from "@material-ui/core";
import Select from "@material-ui/core/Select";
import InputBase from "@material-ui/core/InputBase";
import CancelIcon from "@mui/icons-material/Cancel";
import { PaddingTwoTone } from "@mui/icons-material";

const BootstrapInput = withStyles((theme) => ({
  root: {
    "label + &": {
      marginTop: theme.spacing(3),
    },
  },
  input: {
    borderRadius: 4,
    position: "relative",
    backgroundColor: theme.palette.background.paper,
    border: "1px solid #ced4da",
    fontSize: 16,
    padding: "10px 26px 10px 12px",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    "&:focus": {
      borderRadius: 4,
      borderColor: "#80bdff",
      boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
    },
  },
}))(InputBase);

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
}));

interface IdpSelectorProps {
  atoms: { [key: string]: string[] };
  onValueChange: (
    uid: string,
    chain: string,
    start: string,
    stop: string,
  ) => void;
  onCancelRegion: (uid: string) => void;
  uid: string;
  start: string;
  stop: string;
  chain: string;
  conflict: boolean;
  fieldWith?: number;
}

export default function IdpSelector(props: IdpSelectorProps) {
  const classes = useStyles();

  const uid = props.uid;

  const [start, setStart] = React.useState(props.start);
  const [stop, setStop] = React.useState(props.stop);
  const [chain, setChain] = React.useState(props.chain); // ""by default already

  const selMinWidth = props.fieldWith ? `${props.fieldWith}em` : "3em";

  const onValueChange = (_start: string, _stop: string) => {
    //debugLog("[IdpSelector:onValueChange]");
    if (chain !== "" && _start !== "" && _stop !== "") {
      console.error("[IdpSetter:IdpSelector] Theme error of field");
    }
    props.onValueChange(uid, chain, _start, _stop);
  };

  const startIndex = React.useRef(-1);
  const stopIndex = React.useRef(-1);

  const handleChainChange = (event: any) => {
    //debugLog("Chain change reseting start/stops");

    setChain(event.target.value);
    setStart("");
    setStop("");
    stopIndex.current = -1;
    startIndex.current = -1;
    props.onValueChange(uid, chain, "", "");
  };

  const handleStartChange = (event: any) => {
    // Make sure start index is before stop index
    const aaPosNewStart = event.target.value;
    //debugLog(`[handleStartChange] ${aaPosNewStart}`);
    setStart(aaPosNewStart);
    // chainState is guaranteed to be updated here
    startIndex.current = props.atoms[chain].findIndex((i) => {
      //debugLog(`${aaPosNewStart} === ${i}`);
      return i === aaPosNewStart;
    }) as number;
    // debugLog(startIndex.current);
    // Call the change hook
    onValueChange(event.target.value, stop);
  };
  const handleStopChange = (event: any) => {
    // Not much to do here
    setStop(event.target.value);
    stopIndex.current = props.atoms[chain].findIndex((i) => {
      //  debugLog(`${event.target.value} === ${i}`);
      return i === event.target.value;
    }) as number;

    onValueChange(start, event.target.value);
  };
  const stopPastStart = (aaName: string, aaIndex: number) => {
    /*   debugLog(
      `[stopPastStart] ${aaName}, ${aaIndex} :: ${startIndex.current}`,
    );
    */
    //check relative position start/stop
    return aaIndex > startIndex.current;
  };

  const startBeforeStop = (aaName: string, aaIndex: number) => {
    if (stopIndex.current === -1) return true;
    return aaIndex < stopIndex.current;
  };

  const cancelSelection = () => {
    props.onCancelRegion(uid);
  };
  return (
    <Box display="flex" alignItems="flex-end">
      <FormControl className={classes.margin} error={props.conflict}>
        <InputLabel id="chain-sel-input-label">Chain</InputLabel>
        <Select
          key="chain-sel"
          labelId="chain-sel-label"
          id="chain-sel-select"
          value={chain}
          onChange={handleChainChange}
          input={<BootstrapInput />}
          placeholder="Chain"
        >
          {Object.keys(props.atoms).map((c) => (
            <MenuItem key={"chain_" + c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl className={classes.margin} error={props.conflict}>
        <InputLabel id="start-sel-input">Start</InputLabel>
        <Select
          key="start-sel"
          labelId="start-sel-label"
          id="start-sel-select"
          value={start}
          onChange={handleStartChange}
          input={<BootstrapInput />}
          placeholder="Start"
          disabled={chain === ""}
          style={{ minWidth: selMinWidth }}
        >
          {chain !== "" &&
            props.atoms[chain].filter(startBeforeStop).map((s) => (
              <MenuItem key={"start_" + s} value={s}>
                {s}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <FormControl className={classes.margin} error={props.conflict}>
        <InputLabel id="stop-sel-input-stop">Stop</InputLabel>
        <Select
          key="stop-sel"
          labelId="stop-sel-label"
          id="stop-sel-select"
          value={stop}
          onChange={handleStopChange}
          input={<BootstrapInput />}
          placeholder="Stop"
          style={{ minWidth: selMinWidth }}
          disabled={start === ""}
        >
          {chain !== "" &&
            props.atoms[chain].filter(stopPastStart).map((s) => (
              <MenuItem key={"stop_" + s} value={s}>
                {s}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <Box ml={1} height={58} display="flex" alignItems="right">
        <IconButton
          size="medium"
          style={{ color: "firebrick" }}
          onClick={cancelSelection}
        >
          <CancelIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
