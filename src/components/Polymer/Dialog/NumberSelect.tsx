import { debugLog } from '../../../logger';
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useState, useEffect } from "react";

interface NumberSelectProps {
  adorned: boolean;
  title: string;
  max: number;
  min: number;
  step: number;
  default: number;
  onChange: (selectValue: number) => void;
  width?: string;
}
/* Numeric selector with some settings
  typical usage:

  <NumberSelect
    title="test"
    adorned={true}
    max={2}
    min={-2}
    step={0.1}
    default={0.0}
    width={"8.5em"}
    onChange={(x) => debugLog("kikoi " + x)}
  />

*/

const safeAddition = (a: number, b: number) => {
  const FACTOR = 1000;
  return (a * FACTOR + b * FACTOR) / FACTOR;
};
const safeSoustraction = (a: number, b: number) => {
  const FACTOR = 1000;
  return (a * FACTOR - b * FACTOR) / FACTOR;
};
export function NumberSelect(props: NumberSelectProps) {
  const [value, setValue] = useState(props.default);
  useEffect(() => {
    // So different initial value can be specified at any render times
    setValue(props.default);
  }, [props.default]);

  const handleIncrement = () => {
    const _ = safeAddition(value, props.step);
    if (_ > props.max) return;
    setValue(_);
    props.onChange(_);
  };
  const handleDecrement = () => {
    const _ = safeSoustraction(value, props.step);
    if (_ < props.min) return;
    setValue(_);
    props.onChange(_);
  };

  const validator = Number.isInteger(props.step) ? parseInt : parseFloat;

  return (
    <TextField
      type="number"
      sx={{ maxWidth: props.width ?? "100%" }}
      value={value}
      onChange={(e) => {
        if (!props.adorned) {
          const _ = validator(e.target.value, 10);
          setValue(_ || props.default);
          //debugLog(e.target.value);
          props.onChange(_);
        }
        //setValue(validator(e.target.value, 10) || props.default);
      }}
      label={props.title}
      InputProps={
        !props.adorned
          ? {
              inputProps: { min: props.min, max: props.max, step: props.step }, // Required for spinner to work, but we override the behavior
            }
          : {
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton
                    onClick={handleDecrement}
                    edge="start"
                    sx={{ color: "red" }}
                  >
                    <RemoveIcon
                      fontSize="small"
                      sx={{ padding: "2px", transform: "scale(1.0)" }}
                    />
                  </IconButton>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleIncrement}
                    edge="end"
                    sx={{ color: "red" }}
                  >
                    <AddIcon sx={{ padding: "2px", transform: "scale(1.)" }} />
                  </IconButton>
                </InputAdornment>
              ),
              inputMode: "numeric",
              // Hide spinner in Chrome, Safari, Edge, etc.
              sx: {
                "& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button":
                  {
                    "-webkit-appearance": "none",
                    margin: 0,
                  },
                // Hide spinner in Firefox
                "& input[type=number]": {
                  "-moz-appearance": "textfield",
                },
              },
            }
      }
    />
  );
}
