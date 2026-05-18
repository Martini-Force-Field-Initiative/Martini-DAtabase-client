import React, { useState } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Grid,
} from "@mui/material";

interface adProps {
  title: string;
  options: string[];
  onChange: (value: string) => void;
}
export function AdornedSelect(props: adProps) {
  const [textValue, setTextValue] = useState(props.title);
  const [selectValue, setSelectValue] = useState("");

  const handleTextChange = (event: any) => {
    setTextValue(event.target.value);
  };

  const handleSelectChange = (event: any) => {
    setSelectValue(event.target.value);
    props.onChange(event.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <form>
        <Grid container spacing={2} alignItems="center">
          {/* Fixed Text Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fixed Text"
              value={textValue}
              onChange={handleTextChange}
              variant="outlined"
            />
          </Grid>

          {/* Select Dropdown */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Select Option</InputLabel>
              <Select
                value={selectValue}
                label="Select Option"
                onChange={handleSelectChange}
                variant="outlined"
              >
                {props.options.map((o) => (
                  <MenuItem value={o}>{o}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
