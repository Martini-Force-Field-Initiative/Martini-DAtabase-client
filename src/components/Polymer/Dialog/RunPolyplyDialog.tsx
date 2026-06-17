import { debugLog } from '../../../logger';
import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import { Marger } from "../../../helpers";
import Icon from "@mui/material/Icon";
import JSZip from "jszip";
import ResultViewer from "./ResultViewer";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { Grid, LinearProgress, Link } from "@mui/material";
import { ClientPipeLineFinalFilesBundle } from "../pipeline/dto";
import { FileFromHttp } from "../../../types/entities";

interface props {
  send: (arg1: string, arg2: string, number: string) => Promise<void>;
  currentStep: number;
  getResultFilesContent: () => ClientPipeLineFinalFilesBundle;
  warning: string;
  close: () => void;
  redirectToViewer: () => void;
  add_to_history: () => void;
  add_to_history_redirect: () => void;
  jobid: string | undefined;
  forcefield: string;
  save_is_accessible: boolean;
}

interface state {
  box: string;
  name: string;
  numberpolymer: string;
  jobid: string;
}

export default class RunPolyplyDialog extends React.Component<props, state> {
  constructor(props: props) {
    // Required step: always call the parent class' constructor
    super(props);

    // Set the state directly. Use props if necessary.
    this.state = {
      box: "10",
      name: "polymol",
      numberpolymer: "1",
      jobid: "",
    };
  }

  steps = [
    "Set parameters",
    "Generate ITP",
    "Generate GRO",
    "Generate visualisation",
  ];

  dl(f: FileFromHttp) {
    const blob = new Blob([f.content], { type: f.type });
    const a = document.createElement("a");
    a.download = f.name;
    a.href = window.URL.createObjectURL(blob);
    const clickEvt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    a.dispatchEvent(clickEvt);
    a.remove();
  }

  handlehistory = async () => {
    this.props.add_to_history();
    this.props.close();
  };

  handlehistoryandredirect = async () => {
    this.props.add_to_history_redirect();
    this.props.close();
  };

  async dlzip(archName: string, ...files: FileFromHttp[]) {
    const zip = new JSZip();
    files.forEach((f) => {
      zip.file(f.name, f.content);
    });
    /*
        zip.file("out.itp", itp);
        zip.file("out.pdb", pdb);
        zip.file("out.gro", gro);
        */
    const blob = zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const a = document.createElement("a");
    a.download = archName;
    a.href = window.URL.createObjectURL(await blob);
    const clickEvt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    a.dispatchEvent(clickEvt);
    a.remove();
  }
  renderDownloadOptions = () => {
    const { pdb, gro, top, itps, json } = this.props.getResultFilesContent();

    return (
      <DialogTitle>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item xs>
            <Button
              onClick={() => {
                this.dl(itps[0]);
              }}
            >
              <Icon className={"fas fa-download"} />
              .ITP
            </Button>
          </Grid>
          <Grid item xs>
            <Button
              onClick={() => {
                this.dl(gro);
              }}
            >
              <Icon className={"fas fa-download"} />
              .GRO
            </Button>
          </Grid>
          <Grid item xs>
            <Button
              onClick={() => {
                this.dl(pdb);
              }}
            >
              <Icon className={"fas fa-download"} />
              .PDB
            </Button>
          </Grid>
          <Grid item xs>
            <Button
              onClick={() => {
                this.dl(json);
              }}
            >
              <Icon className={"fas fa-download"} />
              .JSON
            </Button>
          </Grid>
          <Grid item xs>
            <Button
              onClick={() => {
                this.dlzip("polymer_editor.zip", ...itps, gro, pdb, top, json);
              }}
            >
              <Icon className={"fas fa-download"} />
              .ZIP
            </Button>
          </Grid>
          <Grid item xs>
            <Button
              size="medium"
              style={{ textTransform: "none" }}
              onClick={this.props.close}
            >
              Close &nbsp;
              <Icon className={"fas fa-times-circle"} />
            </Button>
          </Grid>
        </Grid>
      </DialogTitle>
    );
  };
  renderResultViewer = () => {
    const { itps, gro, pdb, top, json } = this.props.getResultFilesContent();
    /*
    debugLog("PDB to view");
    debugLog(pdb);
    */
    return (
      <ResultViewer
        top={top.content}
        pdb={pdb.content}
        itp={itps[0].content}
        currentforcefield={this.props.forcefield}
      />
    );
  };
  render() {
    let show = false;
    if (this.props.currentStep !== undefined) {
      show = true;
    }

    return show ? (
      <Dialog maxWidth="sm" fullWidth open={true}>
        {this.props.currentStep === 4 && this.renderDownloadOptions()}

        <DialogContent>
          {this.props.currentStep < 4 && (
            <Stepper
              activeStep={this.props.currentStep!}
              orientation="vertical"
            >
              {this.steps.map((label) => (
                <Step key={label}>
                  <Marger size="1rem" />
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}

              {this.props.warning ? (
                <Typography> {this.props.warning} </Typography>
              ) : (
                <></>
              )}
            </Stepper>
          )}
          {this.props.currentStep ? (
            <></>
          ) : (
            <>
              <FormControl sx={{ m: 1, width: "12ch" }} variant="outlined">
                <TextField
                  id="outlined-number"
                  label="box size"
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={this.state.box}
                  onChange={(e) => this.setState({ box: e.target.value })}
                />
              </FormControl>

              <FormControl sx={{ m: 1, width: "16ch" }} variant="outlined">
                <TextField
                  id="outlined-number"
                  label="polymer copy"
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={this.state.numberpolymer}
                  onChange={(e) =>
                    this.setState({ numberpolymer: e.target.value })
                  }
                />
              </FormControl>

              <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
                <OutlinedInput
                  id="outlined-adornment-weight"
                  value={this.state.name}
                  onChange={(e) => this.setState({ name: e.target.value })}
                  endAdornment={
                    <InputAdornment position="end">name</InputAdornment>
                  }
                  aria-describedby="outlined-weight-helper-text"
                />
              </FormControl>
            </>
          )}
          {
            /*
                        this.props.pdb &&
                            <ResultViewer top={this.props.top} pdb={this.props.pdb} itp={this.props.itp} currentforcefield={this.props.forcefield} />
                        */
            this.props.currentStep === 4 && this.renderResultViewer()
          }
        </DialogContent>

        {/* ------- Dialog actions logic ---------*/}
        {/* Initial state */}
        {this.props.currentStep === 0 && (
          <DialogActions>
            <Button color="warning" onClick={this.props.close}>
              Close it
            </Button>
            <Button
              onClick={() => {
                this.props.send(
                  this.state.box,
                  this.state.name,
                  this.state.numberpolymer,
                );
              }}
            >
              Submit
            </Button>
          </DialogActions>
        )}

        {/* Final state */}
        {this.props.currentStep === 4 /*&& this.props.save_is_accessible)*/ && (
          <DialogActions>
            <Grid
              container
              component="main"
              justifyContent={"space-around"}
              paddingBottom={2}
            >
              <Grid item xs={6} style={{ textAlign: "center" }}>
                <Button color="success" onClick={this.handlehistory}>
                  Save to history
                </Button>
              </Grid>
              <Grid item xs={6} style={{ textAlign: "left" }}>
                <Button onClick={this.handlehistoryandredirect}>
                  Save/Open in Molecule Builder
                </Button>
              </Grid>
              {/*
              <Grid
                container
                style={{
                  backgroundColor: "whiteSmoke",
                  padding: "0.5rem",
                  marginLeft: "0.75rem",
                  marginRight: "0.75rem",
                  borderRadius: 8,
                }}
              >
                <Grid item xs={12}>
                  <Typography variant="caption" component="div">
                    Grünewald, F., Alessandri, R., Kroon, P.C. et al. Polyply; a
                    python suite for facilitating simulations of macromolecules
                    and nanomaterials. Nat Commun. 2022
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" component="div">
                    Romuald Marin, Cécile Hilpert et al. Extending the MAD
                    Toolbox: New Polymer Builder and Enhanced Martini Database.
                    BioRxiv{" "}
                    <a
                      href="https://doi.org/10.64898/2026.01.23.700524"
                      target="_blank"
                    >
                      https://doi.org/10.64898/2026.01.23.700524
                    </a>
                  </Typography>
                </Grid>
              </Grid>
              */}
            </Grid>
          </DialogActions>
        )}

        {/* Tmp/loader state */}
        {this.props.currentStep > 0 && this.props.currentStep < 4 && (
          <>
            <Marger size="1rem" />
            <LinearProgress />
          </>
        )}
      </Dialog>
    ) : (
      <></>
    );
  }
}
