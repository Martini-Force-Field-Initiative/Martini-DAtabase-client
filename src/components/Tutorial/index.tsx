import { debugLog } from "../../logger";
import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button } from "@material-ui/core";
import { Link } from "react-router-dom";
import {
  makeStyles,
  useTheme,
  Theme,
  createStyles,
} from "@material-ui/core/styles";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";

import Intro from "./Intro";
import Database from "./Database";
import Molecule from "./Molecule";
import Polymer from "./Polymer";
import System from "./System";
import Api from "./Api";
import Architecture from "./Architecture";
import { Sections } from "./types";
const useStyles = makeStyles({
  toolbar: {
    display: "flex",
    justifyContent: "flex-start", // 👈 evenly spaced
  },
  button: {
    marginRight: 26, // 👈 spacing between buttons
  },
});

const Tutorial = () => {
  const [section, setSection] = useState("home");

  useEffect(() => {
    document.title = "MAD - Tutorials";
    if (window.location.hash) {
      window.history.replaceState(
        null,
        document.title,
        window.location.pathname,
      );
    }
  }, []);
  //const theme = useTheme();
  const updateDisplaySection = (section: Sections) => {
    debugLog(`updateDisplaySection '${section}'`);
    setSection(section);
    window.history.replaceState(
      null,
      document.title,
      window.location.pathname + "#" + section,
    );
  };
  const classes = useStyles();
  return (
    <>
      <AppBar
        position="static"
        style={{
          backgroundColor: "whitesmoke",
          color: "black",
        }}
      >
        <Toolbar className={classes.toolbar}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            className={classes.button}
            startIcon={<KeyboardBackspaceIcon />}
          >
            Go back to MAD Server
          </Button>
          <Button
            color="inherit"
            onClick={() => updateDisplaySection("home")}
            className={classes.button}
          >
            What is MAD
          </Button>

          <Button
            color="inherit"
            className={classes.button}
            onClick={() => {
              updateDisplaySection("database");
            }}
          >
            Database
          </Button>
          <Button
            color="inherit"
            className={classes.button}
            onClick={() => updateDisplaySection("molecule")}
          >
            Molecule Builder
          </Button>
          <Button
            color="inherit"
            className={classes.button}
            onClick={() => updateDisplaySection("polymer")}
          >
            Polymer Builder
          </Button>
          <Button
            color="inherit"
            className={classes.button}
            onClick={() => updateDisplaySection("system")}
          >
            System Builder
          </Button>
          <Button
            color="inherit"
            className={classes.button}
            onClick={() => updateDisplaySection("api")}
          >
            API
          </Button>
          <Button
            color="inherit"
            className={classes.button}
            onClick={() => updateDisplaySection("architecture")}
          >
            Architecture
          </Button>
        </Toolbar>
      </AppBar>
      <div style={{ padding: 20 }}>
        {section === "home" && (
          <Intro
            onClick={(section) => {
              updateDisplaySection(section);
            }}
          />
        )}
        {section === "database" && (
          <Database
            onClick={(section) => {
              setSection(section);
            }}
          />
        )}
        {section === "molecule" && (
          <Molecule
            onClick={(section) => {
              setSection(section);
            }}
          />
        )}
        {section === "polymer" && (
          <Polymer
            onClick={(section) => {
              setSection(section);
            }}
          />
        )}
        {section === "system" && (
          <System
            onClick={(section) => {
              setSection(section);
            }}
          />
        )}
        {section === "api" && (
          <Api
            onClick={(section) => {
              setSection(section);
            }}
          />
        )}
        {section === "architecture" && (
          <Architecture
            onClick={(section) => {
              setSection(section);
            }}
          />
        )}
      </div>
    </>
  );
};

export default Tutorial;
