import { Typography, Container } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import ApiHelper from "../../ApiHelper";
import Checkbox from "@material-ui/core/Checkbox";
import Alert from "@material-ui/lab/Alert";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Settings from "../../Settings";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputAdornment from "@material-ui/core/InputAdornment";
import GetAppIcon from "@material-ui/icons/GetApp";

import {
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  ListItemIcon,
  IconButton,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from "@material-ui/core";
import FormatQuoteIcon from "@material-ui/icons/FormatQuote";
import Dialog from "@material-ui/core/Dialog";

export default function CitationPage() {
  console.dir(Settings.bibliography);
  // Initialized default checked bibliography items
  //
  const defaultChecked = Settings.bibliography.reduce((aliases, bibSection) => {
    if (bibSection.title !== "Preamble") return aliases;
    bibSection.items.forEach((i) => {
      aliases.push(i.alias);
    });
    return aliases;
  }, []);
  console.log(defaultChecked);
  const [checked, setChecked] = React.useState(defaultChecked);
  const [openDialog, setOpenDialog] = useState(false);
  const [singleQuote, setSingleQuote] = useState(undefined);
  const handleToggle = (value) => {
    console.log("Clicking on " + value);
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const download = async (event) => {
    console.log("Download");
    console.dir(event.target.value);
    const aliases = singleQuote !== undefined ? [singleQuote.alias] : checked;
    console.log(aliases);
    const resp = await ApiHelper.request("cite/refs", {
      parameters: { format: event.target.value, aliases },
      mode: "text",
    });
    console.log(resp);

    const blob = new Blob([resp], { type: "text/plain" }); // Create a Blob
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `mad_bibliography.${event.target.value === "bibtex" ? "bib" : "ris"}`; // Set the filename
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    /*
        const blob = await response.blob(); // Get the response as a Blob
        const url = window.URL.createObjectURL(blob); // Create a temporary URL for the Blob

        // Create a temporary anchor element
        const a = document.createElement("a");
        a.href = url;
        a.download = "example.txt"; // Set the filename for the download
        document.body.appendChild(a);
        a.click(); // Trigger the download

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error("Error downloading file:", error);
      }
};
    */
  };
  const handleCloseDialog = () => {};
  const getContentFromAlias = (alias) => {
    for (const sec of Settings.bibliography) {
      console.dir(sec);
      for (const item of sec.items) {
        if (item.alias === alias) return item.content;
      }
    }
    console.error("Cant find alias " + alias);
  };
  const generateShort = () => {
    const oneShort = (content) => {
      const trim = (_) => _.replace(/^{/, "").replace(/}$/, "");
      const au = trim(content.author ?? "");
      const jn = trim(content.journal ?? "");
      const ye = trim(content.year ?? "");
      const pa = trim(content.pages ?? "");
      const doi = trim(content.doi ?? "");
      return `${au} ${jn} ${ye} ${pa} ${doi}`;
    };

    if (singleQuote !== undefined) {
      console.log("SP");
      console.log(singleQuote.content);
      return oneShort(singleQuote.content);
    }
    if (checked.length > 0) {
      console.log("MP");
      console.log(checked);

      return checked.reduce((prev, alias, i) => {
        const _ = getContentFromAlias(alias);
        return `${prev}${i === 0 ? "" : "\n\n"}${i + 1}. ${oneShort(_)}`;
      }, "");
    }
    return "";
  };
  return (
    <Container style={{ paddingTop: 14, width: "66%" }}>
      <Dialog
        open={openDialog}
        onClose={() => {
          setSingleQuote(undefined);
          setOpenDialog(false);
        }}
        aria-labelledby="quote-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Export citation
          {singleQuote === undefined && checked.length > 1 ? "s" : ""}
        </DialogTitle>

        <DialogContent>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1}
          >
            <Grid item xs={8}>
              <TextField
                multiline
                rows={6} // default height
                variant="outlined"
                fullWidth
                value={generateShort()}
                InputProps={{
                  readOnly: true, // makes it non-editable
                  style: {
                    overflowY: "auto", // vertical scroll
                    whiteSpace: "pre-wrap", // preserves line breaks
                    fontFamily: "monospace", // optional: for code/citation style
                  },
                }}
                label="preview"
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="outlined-select">Download</InputLabel>
                <Select
                  native
                  onChange={download}
                  defaultValue=""
                  input={
                    <OutlinedInput
                      id="outlined-select"
                      startAdornment={
                        <InputAdornment position="start"></InputAdornment>
                      }
                      labelWidth={75} // label width must match InputLabel width
                    />
                  }
                >
                  <option disabled value="">
                    BibTeX/RIS
                  </option>
                  <option value={"bibtex"}>BibTeX</option>
                  <option value={"ris"}>RIS</option>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      <Typography variant="h3" className="page-title" align="center">
        Citations
      </Typography>

      <Alert severity="info" style={{ maxWidth: "90%" }}>
        Appropriate references for tools and resources available on the MAD
        server. Select each item individually
        <FormatQuoteIcon
          style={{
            color: "slategray",
            fontSize: "1.0em",
            marginLeft: 2,
            marginRight: 2,
          }}
        />
        , or check all corresponding boxes to download a single bundle of
        copy-ready citation blocks in RIS/BibTeX format.
      </Alert>

      {Settings.bibliography.map((s, i) => {
        return (
          <List
            key={s.title}
            subheader={
              <ListSubheader
                component="div"
                style={{
                  color: "black",
                }}
              >
                {s.title !== "Preamble" ? <> Step {i} -- </> : <>{""}</>}
                {s.title}
              </ListSubheader>
            }
          >
            {s.items.map((item, i) => {
              const labelId = `checkbox-list-label-${item.alias}`;

              return (
                <ListItem
                  style={{
                    display: "flex",
                    marginLeft: "4em",
                    alignItems: "center",
                    cursor: "pointer", // entire list item shows pointer
                    maxWidth: "40%",
                  }}
                  key={`${item.alias}`}
                  role={undefined}
                  dense
                  onClick={() => {
                    console.log("CB click");
                    handleToggle(`${item.alias}`);
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={checked.indexOf(`${item.alias}`) !== -1}
                      tabIndex={-1}
                      disableRipple
                      disableFocusRipple
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                  </ListItemIcon>
                  <ListItemText id={labelId} primary={item.alias} />

                  <IconButton
                    disableRipple
                    aria-label="comments"
                    style={{
                      cursor: "pointer",
                      //backgroundColor: "transparent",
                    }}
                    onClick={(e) => {
                      setSingleQuote(item);
                      e.stopPropagation();
                      setOpenDialog(true);
                    }}
                  >
                    <FormatQuoteIcon style={{ color: "#f50057" }} />
                  </IconButton>
                </ListItem>
              );
            })}
          </List>
        );
      })}

      <Button
        style={{ marginTop: "1em", cursor: "pointer" }}
        variant="contained"
        color="primary"
        startIcon={<FormatQuoteIcon />}
        onClick={() => setOpenDialog(true)}
        disabled={checked.length === 0}
      >
        Cite these papers
      </Button>
    </Container>
  );
}
