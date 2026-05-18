import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  DialogContentText,
  Input,
  TextField,
  Typography,
} from "@material-ui/core";
import Grid from "@mui/material/Grid";
import { Marger } from "../../../helpers";
import { Alert } from "@mui/material";
import { FileFromHttp } from "../../../types/entities";

interface props {
  open: boolean;
  close: () => void;
  submitBundleGRO_ITP: (gro: FileFromHttp, itps: FileFromHttp[]) => void;
}

interface state {
  itps?: FileFromHttp[];
  gro?: FileFromHttp;
  ok_gro: boolean;
  itp_error_log?: string;
  give2files: boolean;
}

export class ImportProtein extends React.Component<props, state> {
  constructor(props: props) {
    // Required step: always call the parent class' constructor
    super(props);

    // Set the state directly. Use props if necessary.
    this.state = {
      itps: undefined,
      gro: undefined,
      ok_gro: false,
      itp_error_log: undefined,
      give2files: false,
    };
  }

  // files are guaranteed to be .itp extension
  // We require:
  // - at least one molecule_0.itp file
  // - Any itp must feature at least one of the following line
  handleITPS = async (selectorFiles: FileList): Promise<FileFromHttp[]> => {
    const moleculeItpNameCheck = /^molecule_([0-9]+)\.itp$/;
    const moleculeElasticNameCheck = /^molecule_[0-9]+_rubber_band\.itp$/;
    const goNameCheck = /^go_(atomtypes|nbparams)\.itp$/;
    const itpFieldCheck = [
      /\[\s*nonbond_params\s*]/,
      /\[\s*moleculetype\s*]/,
      /\[\s*atomtypes\s*]/,
      /\[\s*nonbond_params\s*]/,
      /; Rubber band/,
    ];
    //            '[ moleculetype ]', '[ atomtypes ]', '; Rubber band' ]
    const readerProms: Promise<FileFromHttp>[] = [];
    let elasticCount = 0;
    for (let i = 0; i < selectorFiles.length; i++) {
      const selectorFile = selectorFiles[i];
      readerProms.push(
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            if (
              moleculeItpNameCheck.test(selectorFile.name) &&
              moleculeElasticNameCheck.test(selectorFile.name) &&
              goNameCheck.test(selectorFile.name)
            ) {
              reject(`Invalid file name ${selectorFile.name}.`);
              return;
            }
            if (moleculeElasticNameCheck.test(selectorFile.name))
              elasticCount++;
            if (elasticCount > 1) {
              reject(
                `Only one elastic constraint ITP is allowed (you may regenerate with the --merge option).`,
              );
              return;
            }
            /* TO UNCOMMENT -- FABIAN
                        if(goNameCheck.test(selectorFile.name)){
                            reject(`Model with Go Potential are not yet supported, but we are working on it!`);
                            return
                        }
                        */
            let notValidContent = true;
            itpFieldCheck.forEach((fieldCheck) => {
              if (!notValidContent) return;
              if (fieldCheck.test(event.target.result)) {
                notValidContent = false;
                return;
              }
            });
            if (notValidContent) {
              reject(
                `Invalid file: ${selectorFile.name} features unrecognized fields.`,
              );
              return;
            }

            resolve({
              name: selectorFile.name,
              content: event.target.result,
              type: "itp",
            });
          };
          reader.readAsText(selectorFile);
        }),
      );
    }

    const itps = await Promise.all(readerProms);
    // Check at least one molecule_0.itp
    if (itps.filter((itp) => itp.name === "molecule_0.itp").length === 0)
      throw "At least one molecule_0.itp file is required";
    if (itps.filter((itp) => itp.name === "go_nbparams.itp").length === 1)
      if (itps.filter((itp) => itp.name === "go_atomtypes.itp").length === 0)
        throw "A go_atomtypes.itp is required";
    if (itps.filter((itp) => itp.name === "go_atomtypes.itp").length === 1)
      if (itps.filter((itp) => itp.name === "go_nbparams.itp").length === 0)
        throw "A go_nbparams.itp is required";

    const molCount = itps.reduce((acc, itp) => {
      const m = itp.name.match(moleculeItpNameCheck);
      if (m === null) return acc;
      const _ = parseInt(m[1]);
      return _ > acc ? _ : acc;
    }, 0);
    // Check at least one molecule_0_elastic.itp
    for (let i = molCount; i >= 0; i--)
      if (itps.filter((itp) => itp.name === `molecule_${i}.itp`).length === 0)
        throw `molecule_${i}.itp file is required`;

    return itps;
  };

  // guaranted to be one file with gro ext
  handleGRO = async (selectorFiles: FileList): Promise<FileFromHttp> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        if (event.target.result.includes("nan")) {
          reject(event.target.result);
          return;
        }
        resolve({
          name: selectorFiles[0].name,
          content: event.target.result,
          type: "gro",
        });
      };
      reader.readAsText(selectorFiles[0]);
    });
    /*
        if (selectorFiles.length === 1) {
            let file = selectorFiles[0]
            const ext = file.name.split('.').slice(-1)[0]
            if (ext === 'gro') {
                let file = selectorFiles[0]
                let reader = new FileReader();
                reader.onload = (event: any) => {
                    if (event.target.result.includes("nan")) {
                        this.setState({ ok_gro: true })
                        this.setState({ gro: event.target.result })
                    }
                    else {
                        this.setState({ ok_gro: false })
                        this.setState({ gro: event.target.result })
                    }

                }
                reader.readAsText(file);
            }
        }*/
  };

  load = () => {
    if (this.state.gro === undefined || this.state.itps === undefined) {
      this.setState({ give2files: true });
    } else {
      this.props.submitBundleGRO_ITP(this.state.gro, this.state.itps);
      //this.props.addprotcoord(this.state.gro)
      //this.props.submitCustomITP(this.state.itp)
      /*
            const itp = ItpFile.readFromString(this.state.itp);
            let molname = ""
            for (let l of itp.getField('moleculetype')) {
                if (!l.startsWith(";")) {
                    molname = l.split(" ")[0]
                }
            }
            //this.props.addCustomitp(molname, this.state.itp)
            */
      this.props.close();
    }

    return;
  };

  render() {
    return (
      <div>
        <Dialog
          onClose={this.props.close}
          aria-describedby="alert-dialog-slide-description"
          open={this.props.open}
        >
          <DialogTitle>
            Choose your molecule model and structure files
          </DialogTitle>

          <DialogContent>
            {this.state.ok_gro && (
              <Alert severity="warning">
                Missing some coordinates in your gromacs file!
              </Alert>
            )}
            {this.state.itp_error_log !== undefined && (
              <Alert severity="error">{this.state.itp_error_log}</Alert>
            )}
            {this.state.give2files && (
              <Alert severity="error">
                Missing file(s). Please provide one or more itp files and a
                single gro file.
              </Alert>
            )}
            {!this.state.ok_gro &&
              this.state.itp_error_log === undefined &&
              !this.state.give2files && (
                <Alert severity="info">
                  If you want to edit a molecule processed by
                  MAD:MoleculeBuilder, it is easier to load it from your
                  MAD:History. If you really want to provide your own files, you
                  should include for best results: "molecule_[0-9]+.itp" and all
                  the eventual elastic or go potentials ITP files.
                </Alert>
              )}
            <Marger size="1rem" />
            <Grid
              container
              component="main"
              style={{
                textAlign: "left",
                alignItems: "center",
                justifyContent: "left",
              }}
            >
              <Grid item xs={5}>
                <Typography variant="button">
                  Topology file(s) (.itp)
                </Typography>
              </Grid>
              <Grid item xs={7}>
                <Input
                  inputProps={{ accept: ".itp", multiple: true }}
                  color="primary"
                  onChange={(e: any) => {
                    this.handleITPS(e.target.files)
                      .then((itps) => {
                        this.setState({ itps: itps });
                        this.setState({ itp_error_log: undefined });
                      })
                      .catch((err) => {
                        console.error("handleITPS error", err);
                        this.setState({ itp_error_log: err });
                      });
                  }}
                  type="file"
                />
              </Grid>

              <Marger size="1rem" />

              <Grid item xs={5}>
                <Typography variant="button">Coordinate file (.gro)</Typography>
              </Grid>
              <Grid item xs={7}>
                <Input
                  inputProps={{ accept: ".gro" }}
                  color="primary"
                  onChange={(e: any) => {
                    this.handleGRO(e.target.files)
                      .then((gro) => {
                        this.setState({ gro: gro });
                      })
                      .catch((err) => {
                        this.setState({ ok_gro: true });
                      });
                  }}
                  type="file"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <Grid
            container
            component="main"
            style={{
              textAlign: "left",
              alignItems: "center",
              justifyContent: "left",
            }}
          >
            <Grid item xs={2}></Grid>

            <Grid item xs={3}>
              <Button color="secondary" onClick={this.props.close}>
                Cancel
              </Button>
            </Grid>

            <Grid item xs={3}></Grid>

            <Grid item xs={3}>
              <Button color="primary" onClick={this.load}>
                Load
              </Button>
            </Grid>
          </Grid>

          <Marger size="1rem" />
        </Dialog>
      </div>
    );
  }
}
