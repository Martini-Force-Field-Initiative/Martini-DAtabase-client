import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Alert, Divider } from "@mui/material";

//WIP
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Switch from "@mui/material/Switch";
//import WifiIcon from '@mui/icons-material/Wifi';
import LocalBar from "@mui/icons-material/LocalBar";

import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import ListItemButton from "@mui/material/ListItemButton";
import Tooltip from "@mui/material/Tooltip";
import { Marger } from "../../../helpers";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import { MetadataCollection, Metadata } from "../../../types/entities";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";

interface FFCProps {
  onValidate: (activeLib: string, envOpts: string[]) => void; // to rename as Onvalidate
  environments: Record<string, string[]>;
  documentation: MetadataCollection;
}

export default function ForceFieldChooser(props: FFCProps) {
  const defaultTargetLib = Object.keys(props.environments).at(-1) as string;
  const [activeLib, setActiveLib] = React.useState(defaultTargetLib);
  //console.log("FFC props", props.environments, "active is ", activeLib);

  const [options, setOptions] = React.useState([] as string[]);
  const handleToggle = (value: string) => () => {
    //console.log("FFC toggle " + value);
    setActiveLib(value);
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="center">
      <List
        sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        subheader={
          <ListSubheader sx={{ fontSize: "1.25em", fontWeight: "bold" }}>
            Set your forcefield parameters
          </ListSubheader>
        }
      >
        {Object.entries(props.environments).map((e, i) => {
          // [targetLib:string, symbol:string[]]
          return (
            <React.Fragment key={e[0]}>
              <ListItem>
                <ListItemIcon>
                  <LocalBar
                    color={e[0] === activeLib ? "primary" : "inherit"}
                  />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    fontSize: "1.5em",
                    fontWeight: "bold",
                    color: e[0] === activeLib ? "primary" : "inherit",
                  }}
                  id={e[0]}
                  primary={e[0]}
                />
                <Switch
                  edge="end"
                  onChange={handleToggle(e[0])}
                  checked={e[0] === activeLib /*checked.indexOf(e[0]) !== -1*/}
                  inputProps={{
                    "aria-labelledby": `switch-list-${e[0]}`,
                  }}
                />
              </ListItem>
              {e[1].length > 1 &&
                CheckboxList({
                  parameters: e[1].slice(1),
                  active: activeLib,
                  name: e[0],
                  onChange: (values) => {
                    setOptions(values);
                  },
                  documentation: props.documentation,
                })}
              {i < Object.keys(props.environments).length - 1 ? (
                <Divider />
              ) : (
                <></>
              )}
            </React.Fragment>
          );
        })}
      </List>
      <Marger size="1em" />

      <Button
        sx={{ width: "75%" }}
        variant="contained"
        endIcon={<SendIcon />}
        onClick={() => {
          /*console.log("FFC fires", activeLib, [
            props.environments[activeLib][0],
            ...options,
          ]);*/
          props.onValidate(activeLib, [
            props.environments[activeLib][0],
            ...options,
          ]);
        }}
      >
        Start Polymer Editor
      </Button>
    </Box>
  );
}

interface CBLprops {
  parameters: string[];
  name: string;
  active: string;
  onChange: (values: string[]) => void;
  documentation: MetadataCollection;
}

function CheckboxList(props: CBLprops) {
  const [checked, setChecked] = React.useState([] as string[]);

  const handleToggle = (value: string) => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
    props.onChange(newChecked);
  };

  return (
    <List
      sx={{
        paddingLeft: "2em",
        width: "100%",
        maxWidth: 360,
        bgcolor: "background.paper",
      }}
    >
      {props.parameters.map((value) => {
        const labelId = `checkbox-list-label-${value}`;

        return (
          <ListItem
            //sx={{ marginTop: '-1.5em' }}
            sx={{ paddingTop: 0, paddingBottom: 0, margin: 0 }}
            key={value}
            secondaryAction={
              value in props.documentation && (
                <Tooltip
                  title={generateTooltip(value, props.documentation[value])}
                  placement="right"
                  arrow
                >
                  <span>
                    <IconButton edge="end" aria-label="comments" disabled>
                      <HelpCenterIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              )
            }
            disablePadding
          >
            <ListItemButton
              role={undefined}
              onClick={() => {
                //console.log(props.active, props.name, value);
                if (props.active !== props.name) return;
                handleToggle(value);
              }}
              dense
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={checked.includes(value)}
                  tabIndex={-1}
                  disabled={props.active !== props.name}
                  inputProps={{ "aria-labelledby": labelId }}
                />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  color: props.active === props.name ? "inherit" : "disabled",
                }}
                id={labelId}
                primary={value}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}

const generateTooltip = (title: string, data: Metadata) => {
  return (
    <>
      {data.comments}{" "}
      <a href={data.cite} target="_blank">
        |cite
      </a>
    </>
  );
};

/*
 <React.Fragment>
            <Typography color="inherit">Tooltip with HTML</Typography>
            <em>{"And here's"}</em> <b>{'some'}</b> <u>{'amazing content'}</u>.{' '}
            {"It's very engaging. Right?"}
          </React.Fragment>
*/
