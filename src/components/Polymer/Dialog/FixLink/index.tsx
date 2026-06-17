import { debugLog, debugDir } from "../../../../logger";
import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { NumberSelect } from "../NumberSelect";
import HandymanIcon from "@mui/icons-material/Handyman";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
// v5 Box (the file's other Box is the @material-ui/core v4 one, which lacks `sx`).
import MuiBox from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

import {
  FormControl,
  FormControlLabel,
  Box,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import Alert from "@mui/material/Alert";
//import ItpFile from 'itp-parser-forked';
import ItpFile from "itp_mad_parser";
import Grid from "@mui/material/Grid";
import { Marger } from "../../../../helpers";
import {
  tweakBead,
  beadslist,
  BeadType,
  cloneAtomRecord,
  equalItpAtomRecords,
  stringifyAtomRecord,
} from "./bead_itp_tweaker";
import ItpMadWrapper, { ItpAtomRecord } from "itp_mad_parser_ext";
import { ErrorFix } from "./utils";

interface props {
  send: (itp: ItpFile, customLinks: string[]) => Promise<void>;
  getLackBondDefITP: () => string;
  close: () => void;
  current_position?: number;
  error_registry: ErrorFix[];
  update_error: (e: any) => void;
  //is_fixed: (id: number) => void;
  onUpdateFixingPlan: (ids: number[]) => void;
  // Just call above many times ^^
  // Except if the re state rendering many times is costly
  //  onManyFixApply: (ids: number[]) => void;

  toToaster: (msg: string) => void;
}

interface state {
  currLinkDisplayIdx: number;
  curStartBeadName: string;
  curStartBeadType: string;
  curStartBeadCharge?: number; // 2 check
  curEndBeadName: string;
  curEndBeadType: string;
  curEndBeadCharge?: number;
  cForce: string;
  cDist: string;
  nLeft: number;
}

interface LinkFixer {
  isFixed: boolean;
  curStartIdx: number;
  curEndIdx: number;
  distance: string;
  force: string;
  startChoices: ItpAtomRecord[];
  endChoices: ItpAtomRecord[];
}

export class FixLink extends React.Component<props, state> {
  linkFixers: LinkFixer[] = [];
  itpObj: ItpFile;
  static DEFAULT_DISTANCE = "0.336";
  static DEFAULT_FORCE = "1200";
  static isChargeable = (beadName: string) => {
    return (
      beadName.includes("Q") || beadName.includes("Q") || beadName.endsWith("q")
    );
  };
  constructor(props: props) {
    // Required step: always call the parent class' constructor
    super(props);

    this.itpObj = ItpFile.readFromString(this.props.getLackBondDefITP());
    // Set the state directly. Use props if necessary.

    /*
    debugLog("FIX LINK BUILDER");
    debugLog(this.props.fixing_error);
    */
    const baseItp = ItpMadWrapper.wrap(this.itpObj);

    // `idbead` is the atom number (ITP [atoms] first column, `num`). Resolve the
    // record by matching `num`, NOT by array position: atomRecords[idbead - 1]
    // assumes the records are dense and numbered from 1, which the missing-link
    // ITP fragment does not guarantee. A positional miss returns a neighbouring
    // atom with a different cgnr, which later makes equalItpAtomRecords() fail in
    // ApplyFix (records collide on `num` but differ on `cgnr`).
    const recordByNum = (idbead: string): ItpAtomRecord => {
      const num = parseInt(idbead);
      const rec = baseItp.atomRecords.find((r) => r.num === num);
      if (rec === undefined)
        console.error(
          `[FixLink] no atom record with num=${num} in the missing-link ITP`,
        );
      return rec as ItpAtomRecord;
    };

    this.linkFixers = this.props.error_registry.map((d) => {
      return {
        isFixed: false,
        startChoices: d.startchoice.map((b: any) => recordByNum(b.idbead)),
        endChoices: d.endchoice.map((b: any) => recordByNum(b.idbead)),
        distance: FixLink.DEFAULT_DISTANCE,
        force: FixLink.DEFAULT_FORCE,
        curStartIdx: 0,
        curEndIdx: 0,
      };
    });

    debugLog(`FixLink::initialPosition: ${this.props.current_position}`);
    /*
    debugLog("linkFixers::");
    debugLog(this.linkFixers);

    debugLog("Provided ITP");
    debugLog(this.itpObj.toString());
 */
    this.state = this.getInitialState();
  }

  getInitialState = (): state => {
    const dfLinkIdx = this.props.current_position ?? 0;
    const startDfltBead = this.linkFixers[dfLinkIdx].startChoices[0];
    const endDfltBead = this.linkFixers[dfLinkIdx].endChoices[0];

    return {
      currLinkDisplayIdx: dfLinkIdx,
      curStartBeadName: startDfltBead.segid,
      curStartBeadType: startDfltBead.name,
      curStartBeadCharge: FixLink.isChargeable(startDfltBead.name)
        ? startDfltBead.charge
        : undefined,
      curEndBeadName: endDfltBead.segid,
      curEndBeadType: endDfltBead.name,
      curEndBeadCharge: FixLink.isChargeable(endDfltBead.name)
        ? endDfltBead.charge
        : undefined,
      cDist: this.linkFixers[dfLinkIdx].distance,
      cForce: this.linkFixers[dfLinkIdx].force,
      nLeft: this.props.error_registry.length,
    };
  };
  updateBeadType = (newType: string, pos: "start" | "end") => {
    /* updates bead type in currently selected choice,
      eventually toggle charge setter
    */
    //debugLog("Updating Start bead type w/ " + newType);
    let _ = this.linkFixers[this.state.currLinkDisplayIdx];
    if (pos === "start") {
      _.startChoices[_.curStartIdx].name = newType;
      this.setState({ curStartBeadType: newType });
      if (FixLink.isChargeable(newType))
        this.setState({
          curStartBeadCharge: _.startChoices[_.curStartIdx].charge,
        });
      else {
        this.setState({ curStartBeadCharge: undefined });
        _.startChoices[_.curStartIdx].charge = 0; // We set atom charge to zero as bead type is neutral
      }
      return;
    }
    // pos == "end"
    _.endChoices[_.curEndIdx].name = newType;
    this.setState({ curEndBeadType: newType });
    if (FixLink.isChargeable(newType))
      this.setState({
        curEndBeadCharge: _.endChoices[_.curEndIdx].charge,
      });
    else {
      this.setState({ curEndBeadCharge: undefined });
      _.endChoices[_.curEndIdx].charge = 0; // We set atom charge to zero as bead type is neutral
    }
  };

  updateBeadCharge = (newCharge: number | undefined, pos: "start" | "end") => {
    //debugLog("Update bead charge");
    let _ = this.linkFixers[this.state.currLinkDisplayIdx];
    if (newCharge === undefined) {
      //debugLog("Reseting charge");
      newCharge = _.startChoices[_.curStartIdx].charge;
    }
    //debugLog("Updating charge");
    //debugLog(newCharge);

    if (pos === "start") {
      _.startChoices[_.curStartIdx].charge = newCharge;
      this.setState({ curStartBeadCharge: newCharge });
      return;
    }
    _.endChoices[_.curEndIdx].charge = newCharge;
    this.setState({ curEndBeadCharge: newCharge });
  };

  updateBeadName = (newName: string, pos: "start" | "end") => {
    debugLog("updateBeadName");
    let _ = this.linkFixers[this.state.currLinkDisplayIdx];
    const choices = pos === "start" ? _.startChoices : _.endChoices;
    const newChoiceIdx = choices.findIndex((a) => a.segid === newName);

    if (pos === "start") {
      _.curStartIdx = newChoiceIdx;
      const bdt = _.startChoices[_.curStartIdx];
      const bdc = bdt.charge;
      this.setState({
        curStartBeadName: newName,
        curStartBeadCharge: FixLink.isChargeable(bdt.name) ? bdc : undefined,
      });
      return;
    }
    _.curEndIdx = newChoiceIdx;
    const bdt = _.endChoices[_.curEndIdx];
    const bdc = bdt.charge;

    this.setState({
      curEndBeadName: newName,
      curEndBeadCharge: FixLink.isChargeable(bdt.name) ? bdc : undefined,
    });
  };

  componentDidMount(): void {
    debugLog("FixLink:ComponentDidMount state.currLinkDispalyIdx");
    debugDir(this.state.currLinkDisplayIdx);
    debugLog("FixLink:ComponentDidMount state.linkFixer");
    debugDir(this.linkFixers);
    this.setState({ nLeft: this.props.error_registry.length });
    // Mark the initially displayed link as fixed. Done here (not in render) so
    // the parent's setState runs after commit, not during our render.
    //this.props.is_fixed(this.state.currLinkDisplayIdx);
  }

  componentDidUpdate(
    prevProps: Readonly<props>,
    prevState: Readonly<state>,
    snapshot?: any,
  ): void {
    const nLeft = this.props.error_registry.reduce(
      (acc, lf) => (lf.is_fixed ? acc - 1 : acc),
      this.props.error_registry.length,
    );
    debugLog(">>>" + this.state.nLeft);
    if (nLeft !== this.state.nLeft) this.setState({ nLeft });
    // Notify the parent only when the displayed link actually changes, again
    // outside of render to avoid "update during render" warnings and to avoid
    // re-appending the same corrected link on every re-render.
    /*
    if (prevState.currLinkDisplayIdx !== this.state.currLinkDisplayIdx) {
      this.props.is_fixed(this.state.currLinkDisplayIdx);
    }*/
  }

  ApplyFixToITP = () => {
    // One and only (final) modification of the ITP record
    const customLinks: string[] = [];
    const newItpAtomRecords: { [key: string]: ItpAtomRecord } = {};
    // Set a warning if the same bead is defined mutlile times
    let conflict = false;
    this.linkFixers.forEach((lf) => {
      const modRecord1 = lf.startChoices[lf.curStartIdx];
      const modRecord2 = lf.endChoices[lf.curEndIdx];
      debugLog("Dispalying all newItpAtomRecords");
      debugDir(newItpAtomRecords);

      if (modRecord1.num in newItpAtomRecords) {
        /*
        console.error("Followoing record(1) aloready loaded");
        console.error(modRecord1);
        */
        // Below should never happen as all ItpAtomRecord got a single ref
        if (
          !equalItpAtomRecords(newItpAtomRecords[modRecord1.num], modRecord1)
        ) {
          debugLog(
            `ERROR: Following Itp record  (curStartIdx:${lf.curStartIdx}) are unequal`,
          );
          debugLog(newItpAtomRecords[modRecord1.num]);
          debugLog("offset wd be next");
          debugLog(newItpAtomRecords[modRecord1.num - 1]);
          debugLog(modRecord1);
          this.conflictingDefsToaster(
            newItpAtomRecords[modRecord1.num],
            modRecord1,
          );
          conflict = true;
        }
      }
      newItpAtomRecords[modRecord1.num] = modRecord1;
      if (modRecord2.num in newItpAtomRecords) {
        /*
        console.error("Followoing record(2) aloready loaded");
        console.error(modRecord2);
        */
        // Below should never happen as all ItpAtomRecord got a single ref
        if (
          !equalItpAtomRecords(newItpAtomRecords[modRecord2.num], modRecord2)
        ) {
          debugLog(
            `ERROR: Following Itp record  (curEndIdx:${lf.curEndIdx} are unequal`,
          );
          debugLog(newItpAtomRecords[modRecord2.num]);
          debugLog(modRecord2);

          this.conflictingDefsToaster(
            newItpAtomRecords[modRecord2.num],
            modRecord2,
          );
          conflict = true;
        }
      }
      newItpAtomRecords[modRecord2.num] = modRecord2;
      customLinks.push(
        `${modRecord1.num} ${modRecord2.num} 1 ${lf.distance} ${lf.force}`,
      );
    });
    if (conflict) {
      return;
    }
    tweakBead(this.itpObj, Object.values(newItpAtomRecords)); // this.itpObj in-place mod

    debugLog("[FixLink::Apply_fix] final output ITP");
    debugLog(this.itpObj.toString());
    this.props.send(this.itpObj, customLinks).finally(() => this.props.close());
  };

  conflictingDefsToaster = (def1: ItpAtomRecord, def2: ItpAtomRecord) => {
    this.props.toToaster(
      `Conflicting bead definitions (${stringifyAtomRecord(def1)}) and (${stringifyAtomRecord(def2)})`,
    );
  };
  updateFixingPlan = (self: boolean) => {
    const currLinkIdx = this.state.currLinkDisplayIdx;
    const templateLinkFix = this.linkFixers[currLinkIdx];

    const lfFilter: (lf: LinkFixer, idx: number) => boolean = self
      ? (lf, lf_idx) => lf_idx === currLinkIdx
      : (lf, lf_idx) => true; /*lf_idx !== currLinkIdx*/

    this.linkFixers.filter(lfFilter).forEach((lf, i) => {
      let startIdx: number = 0;
      let endIdx: number = 0;
      let startChoices: ItpAtomRecord[] = [];
      let endChoices: ItpAtomRecord[] = [];

      if (
        lf.startChoices[0].resname ===
          templateLinkFix.startChoices[0].resname &&
        lf.endChoices[0].resname === templateLinkFix.endChoices[0].resname
      ) {
        startIdx = templateLinkFix.curStartIdx;
        endIdx = templateLinkFix.curEndIdx;
        startChoices = templateLinkFix.startChoices;
        endChoices = templateLinkFix.endChoices;
      } else if (
        lf.startChoices[0].resname === templateLinkFix.endChoices[0].resname &&
        lf.endChoices[0].resname === templateLinkFix.startChoices[0].resname
      ) {
        startIdx = templateLinkFix.curEndIdx;
        endIdx = templateLinkFix.curStartIdx;
        startChoices = templateLinkFix.endChoices;
        endChoices = templateLinkFix.startChoices;
      } else {
        return;
      }
      lf.curStartIdx = startIdx;
      lf.curEndIdx = endIdx;
      lf.startChoices = startChoices.map((_, i) => {
        debugLog("Cloning x -> Y");
        debugDir(_);
        const t = cloneAtomRecord(_, {
          num: lf.startChoices[i].num,
          resnum: lf.startChoices[i].resnum,
          cgnr: lf.startChoices[i].cgnr,
        });
        debugLog(t);
        return t;
      });
      lf.endChoices = endChoices.map((_, i) =>
        cloneAtomRecord(_, {
          num: lf.endChoices[i].num,
          resnum: lf.endChoices[i].resnum,
          cgnr: lf.endChoices[i].cgnr,
        }),
      );
      lf.distance = templateLinkFix.distance;
      lf.force = templateLinkFix.force;
      lf.isFixed = true;
    });

    // Collect the ORIGINAL indices of the links the plan touched. Reducing over
    // the already-filtered array used the filtered-array index, so self=true
    // always yielded [0]; apply lfFilter against the full array so lf_idx is the
    // real index in this.linkFixers.
    const lfs_idx = this.linkFixers.reduce(
      (acc: number[], lf: LinkFixer, lf_idx: number) =>
        lfFilter(lf, lf_idx) ? [...acc, lf_idx] : acc,
      [] as number[],
    );
    debugLog("FixLink:onUpdateFixingPlan fires with");
    debugLog(lfs_idx);
    this.props.onUpdateFixingPlan(lfs_idx);
    /*
    debugLog("replicateFix: outpout");
    debugLog(this.linkFixers);
    */
    // Refresh rendering
    this.setState({ currLinkDisplayIdx: this.state.currLinkDisplayIdx });
  };

  currentResInfo = () => {
    debugLog(
      `FixLink::currentResInfo uses idx ${this.state.currLinkDisplayIdx}`,
    );
    const _ = this.linkFixers[this.state.currLinkDisplayIdx];
    return [
      _.startChoices[_.curStartIdx].resname,
      _.startChoices[_.curStartIdx].resnum,
      _.endChoices[_.curEndIdx].resname,
      _.endChoices[_.curEndIdx].resnum,
    ];
  };

  nativeBeadTypes = () => {
    const _ = this.linkFixers[this.state.currLinkDisplayIdx];
    return [_.startChoices[_.curStartIdx].name, _.endChoices[_.curEndIdx].name];
  };
  beadNameInfo = () => {
    const _ = this.linkFixers[this.state.currLinkDisplayIdx];
    return [
      _.startChoices[_.curStartIdx].segid,
      _.startChoices.map((b) => b.segid),
      _.endChoices[_.curEndIdx].segid,
      _.endChoices.map((b) => b.segid),
    ];
  };

  similarResPairLinkIdx = (): number[] => {
    const _ = this.linkFixers[this.state.currLinkDisplayIdx];
    // All possible choices share same resname, resnum
    const r1 = _.startChoices[0].resname;
    const r2 = _.endChoices[0].resname;

    return this.linkFixers
      .map((lf, i) => [lf, i])
      .filter((_) => {
        const lf = _[0] as LinkFixer;
        return (
          (lf.startChoices[0].resname === r1 &&
            lf.endChoices[0].resname === r2) ||
          (lf.startChoices[0].resname === r2 && lf.endChoices[0].resname === r1)
        );
      })
      .map((_) => _[1] as number);
  };
  updateFixStatus = () => {
    this.linkFixers[this.state.currLinkDisplayIdx].isFixed = true;
    return this.linkFixers.reduce(
      (prev, curr) => (curr.isFixed ? prev : prev + 1),
      0,
    );
  };

  updateForce = (f: string) => {
    this.linkFixers[this.state.currLinkDisplayIdx].force = f;
    this.setState({ cForce: f });
  };

  updateDistance = (d: string) => {
    this.linkFixers[this.state.currLinkDisplayIdx].distance = d;
    this.setState({ cDist: d });
  };

  displayedBondParams = () => {
    /*
  debugLog("displayedBondParams");
  debugLog(this.state.currLinkDisplayIdx);
  debugLog(this.linkFixers[this.state.currLinkDisplayIdx]);
  */
    return [
      this.linkFixers[this.state.currLinkDisplayIdx].force,
      this.linkFixers[this.state.currLinkDisplayIdx].distance,
    ];
  };

  // Drives the centered bond-status indicator. Tied to isFixed for now (to be
  // corrected later with a real validity check).
  get currentLinkOk(): boolean {
    return this.linkFixers[this.state.currLinkDisplayIdx].isFixed;
  }

  render() {
    const nTotal = this.linkFixers.length;

    const [curStartResName, curStartResNum, curEndResName, curEndResNum] =
      this.currentResInfo();
    const [startNativeBeadType, endNativeBeadType] = this.nativeBeadTypes();
    const _ = this.beadNameInfo();
    const [
      curStartBeadName,
      startBeadNameAvailable,
      curEndBeadName,
      endBeadNameAvailable,
    ] = _;

    const [cForce, cDist] = this.displayedBondParams();
    const similarResPairLinkIdx: number[] = this.similarResPairLinkIdx();

    return (
      <Dialog
        open={true}
        PaperProps={{
          sx: {
            width: "60%", // Set width to 80% of the viewport
            maxWidth: "none", // Remove default max-width
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
            color: "rgb(25, 118, 210)",
            alignItems: "center",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          <HandymanIcon sx={{ mr: 1, fontSize: "1.8rem" }} />
          PolymerEditor Bond Quick Fixer
        </DialogTitle>
        <DialogContent style={{ paddingBottom: "0.1rem" }}>
          <Box sx={{ marginBottom: "1rem" }}>
            <Alert severity="info">
              {`The Polyply engine could not guess parameters for ${this.props.error_registry.length} of` +
                ` your polymer bond${this.props.error_registry.length > 1 ? "s" : ""}
              , you can define them here.`}
            </Alert>
          </Box>
          <Grid
            container
            component="main"
            spacing={2}
            sx={{ position: "relative" }}
          >
            {/* Centered bond-status indicator, foreground, straddling the top
                edge between the start/end bead panels. */}
            <MuiBox
              sx={{
                position: "absolute",
                top: "1rem",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 10,
                bgcolor: "background.paper",
                borderRadius: "50%",
                lineHeight: 0,
              }}
            >
              <Tooltip
                title={
                  this.currentLinkOk
                    ? "This fix can be edited"
                    : "This bond requires fixing"
                }
              >
                {this.currentLinkOk ? (
                  <CheckCircleIcon
                    sx={{ fontSize: "3rem", color: "success.main" }}
                  />
                ) : (
                  <CancelIcon sx={{ fontSize: "3rem", color: "error.main" }} />
                )}
              </Tooltip>
            </MuiBox>
            {/*set papers intenal margin*/}
            {/* First Bead parameter "start" */}
            <Grid item xs={6} sm={6} md={6}>
              <Paper
                elevation={3} // Adds shadow
                style={{
                  padding: 2, // Padding
                  height: "100%", // Ensures consistent height
                  display: "flex",
                  flexDirection: "column",
                  // justifyContent: "flex-end", // Aligns content to the bottom
                  paddingRight: "2em",
                }}
              >
                <Box
                  display="flex"
                  alignItems="flex-end"
                  justifyContent="center"
                >
                  <Typography
                    variant="subtitle1"
                    align="center"
                    display="inline"
                  >
                    {"Residue#" + curStartResNum}
                  </Typography>
                  <Box ml={2}>
                    <Typography variant="h6" align="center" display="inline">
                      {curStartResName}
                    </Typography>
                  </Box>
                </Box>
                <Grid
                  item
                  xs={12}
                  container
                  alignItems="flex-start" // Aligns items to the top vertically
                  display="flex"
                  flexDirection="row"
                >
                  {/* Left sub-panel (vertical wrapper)"bead type -- bead charge"*/}
                  <Grid
                    item
                    container
                    direction="column"
                    justifyContent="center" // Centers vertically (if direction="column")
                    xs={8}
                    sx={{ paddingTop: "2em", paddingLeft: "2em" }}
                  >
                    <Grid item container direction="row" xs={12}>
                      <Grid item xs={6}>
                        <TextField
                          id="outlined-select-currency"
                          select
                          label="Bead Type"
                          value={startNativeBeadType}
                          onChange={(event: any) => {
                            this.updateBeadType(event.target.value, "start");
                          }}
                          helperText="Optional choice"
                          FormHelperTextProps={{
                            style: {
                              color: "#f50057",
                              fontWeight: "200", // Replace with your desired color
                            },
                          }}
                          style={{ minWidth: "9em" }}
                          InputLabelProps={{
                            style: {
                              fontSize: "1.2rem", // Increase font size
                            },
                          }}
                        >
                          {beadslist.map((cat, i) => (
                            <MenuItem key={i} value={cat}>
                              {cat}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={6}>
                        {this.state.curStartBeadCharge !== undefined && (
                          <NumberSelect
                            title="Bead charge"
                            adorned={true}
                            max={2}
                            min={-2}
                            step={0.1}
                            default={this.state.curStartBeadCharge}
                            width={"9em"}
                            onChange={(x) => {
                              this.updateBeadCharge(x, "start");
                            }}
                          />
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    item
                    xs={4}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <Grid
                      item
                      xs={12}
                      textAlign="right"
                      width="100%"
                      maxHeight="1.5em"
                    >
                      <Typography> Bead name</Typography>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      style={{
                        display: "flex",
                        justifyContent: "flex-end", // Right-align horizontally
                        alignItems: "center", // Middle-align vertically
                        width: "100%",
                      }}
                    >
                      <FormControl style={{ width: "auto" }}>
                        <RadioGroup
                          aria-labelledby="demo-radio-buttons-group-label"
                          value={curStartBeadName}
                          name="radio-buttons-group"
                          onChange={(e) => {
                            this.updateBeadName(e.target.value, "start");
                          }}
                        >
                          {(startBeadNameAvailable as string[]).map(
                            (e: any, i: number) => {
                              return (
                                <FormControlLabel
                                  labelPlacement="start"
                                  key={i}
                                  value={e}
                                  control={<Radio />}
                                  label={e}
                                />
                              );
                            },
                          )}
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            {/* Second Bead parameter "end" */}
            <Grid item xs={6} sm={6} md={6}>
              <Paper
                elevation={3} // Adds shadow
                style={{
                  padding: 2, // Padding
                  height: "100%", // Ensures consistent height
                  display: "flex",
                  flexDirection: "column",
                  // justifyContent: "flex-end", // Aligns content to the bottom
                  paddingRight: "2em",
                }}
              >
                <Box
                  display="flex"
                  alignItems="flex-end"
                  justifyContent="center"
                >
                  <Typography
                    variant="subtitle1"
                    align="center"
                    display="inline"
                  >
                    {"Residue#" + curEndResNum}
                  </Typography>
                  <Box ml={2}>
                    <Typography variant="h6" align="center" display="inline">
                      {curEndResName}
                    </Typography>
                  </Box>
                </Box>
                <Grid
                  item
                  xs={12}
                  container
                  alignItems="flex-start" // Aligns items to the top vertically
                  display="flex"
                  flexDirection="row"
                >
                  <Grid
                    item
                    xs={4}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <Grid
                      item
                      xs={12}
                      textAlign="left"
                      width="100%"
                      maxHeight="1.5em"
                      paddingLeft="1rem"
                    >
                      <Typography> Bead name</Typography>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      style={{
                        display: "flex",
                        justifyContent: "flex-start", // Right-align horizontally
                        alignItems: "center", // Middle-align vertically
                        width: "100%",
                        paddingLeft: "1rem",
                      }}
                    >
                      <FormControl style={{ width: "auto" }}>
                        <RadioGroup
                          aria-labelledby="demo-radio-buttons-group-label"
                          value={curEndBeadName}
                          name="radio-buttons-group"
                          onChange={(e) => {
                            this.updateBeadName(e.target.value, "end");
                          }}
                        >
                          {(endBeadNameAvailable as string[]).map(
                            (e: any, i: number) => {
                              return (
                                <FormControlLabel
                                  labelPlacement="end"
                                  key={i}
                                  value={e}
                                  control={<Radio />}
                                  label={e}
                                />
                              );
                            },
                          )}
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                  </Grid>
                  {/* Left sub-panel (vertical wrapper)"bead type -- bead charge"*/}
                  <Grid
                    item
                    container
                    direction="column"
                    justifyContent="center" // Centers vertically (if direction="column")
                    xs={8}
                    sx={{ paddingTop: "2em", paddingLeft: "2em" }}
                  >
                    <Grid item container direction="row" xs={12}>
                      <Grid item xs={6}>
                        <TextField
                          id="outlined-select-currency"
                          select
                          label="Bead Type"
                          value={endNativeBeadType}
                          onChange={(event: any) => {
                            this.updateBeadType(event.target.value, "end");
                          }}
                          helperText="Optional choice"
                          FormHelperTextProps={{
                            style: {
                              color: "#f50057",
                              fontWeight: "200", // Replace with your desired color
                            },
                          }}
                          style={{ minWidth: "9em" }}
                          InputLabelProps={{
                            style: {
                              fontSize: "1.2rem", // Increase font size
                            },
                          }}
                        >
                          {beadslist.map((cat, i) => (
                            <MenuItem key={i} value={cat}>
                              {cat}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={6}>
                        {this.state.curEndBeadCharge !== undefined && (
                          <NumberSelect
                            title="Bead charge"
                            adorned={true}
                            max={2}
                            min={-2}
                            step={0.1}
                            default={this.state.curEndBeadCharge}
                            width={"9em"}
                            onChange={(x) => {
                              this.updateBeadCharge(x, "end");
                            }}
                          />
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                elevation={3} // Adds shadow
                style={{
                  padding: 2, // Padding
                  height: "100%", // Ensures consistent height
                  display: "flex",
                  flexDirection: "row",
                  // justifyContent: "flex-end", // Aligns content to the bottom
                  paddingRight: "2em",
                  paddingBottom: "1.5em",
                  paddingLeft: "2rem",
                  paddingTop: "1rem",
                  marginTop: "-0.5rem",
                }}
              >
                <Grid
                  item
                  xs={4}
                  style={{
                    textAlign: "left",
                    alignItems: "center",
                    justifyContent: "left",
                    display: "flex",
                    height: "100%",
                  }}
                >
                  <Typography variant="subtitle1">Bond parameters</Typography>
                </Grid>
                <Grid
                  item
                  xs={4}
                  style={{
                    textAlign: "right",
                    alignItems: "right",
                    justifyContent: "center",
                  }}
                >
                  <TextField
                    id="outlined-number"
                    label="distance"
                    type="number"
                    inputProps={{ step: "0.1" }}
                    value={cDist}
                    onChange={(v) => {
                      this.updateDistance(v.target.value);
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={4}
                  style={{
                    textAlign: "right",
                    alignItems: "right",
                    justifyContent: "center",
                  }}
                >
                  <TextField
                    id="outlined-number"
                    label="force"
                    type="number"
                    inputProps={{ step: "100" }}
                    value={cForce}
                    onChange={(v) => {
                      this.updateForce(v.target.value);
                    }}
                  />
                </Grid>
              </Paper>
            </Grid>
            <Marger size="1rem" />
            <Grid item xs={12} style={{ marginTop: "-1.5rem" }}>
              <Paper
                elevation={3} // Adds shadow
                style={{
                  padding: 2, // Padding
                  height: "100%", // Ensures consistent height
                  display: "flex",
                  flexDirection: "row",
                  paddingRight: "2em",
                  paddingBottom: "1em",
                  paddingLeft: "2rem",
                  paddingTop: "1rem",
                }}
              >
                {/* Left half: always-active single-fix apply. */}
                <MuiBox
                  sx={{ flex: 1, display: "flex", justifyContent: "center" }}
                >
                  <Button
                    variant="contained"
                    onClick={() => {
                      debugLog("Dialog:FixLink:: APPLY_FIX click");
                      this.updateFixingPlan(true);
                    }}
                  >
                    Apply fix to this bond
                  </Button>
                </MuiBox>

                {/* Right half: replicate to all similar bonds. Disabled (with a
                    tooltip) when no other link of the same type exists. The
                    <span> wrapper lets the tooltip fire over a disabled button. */}
                <MuiBox
                  sx={{ flex: 1, display: "flex", justifyContent: "center" }}
                >
                  <Tooltip
                    title={
                      similarResPairLinkIdx.length > 1
                        ? ""
                        : "No other link of the same type exist in your molecule"
                    }
                  >
                    <span>
                      <Button
                        variant="contained"
                        disabled={similarResPairLinkIdx.length <= 1}
                        onClick={() => {
                          this.updateFixingPlan(false);
                          debugLog("Dialog:FixLink:: REPLICATE_FIX click");
                        }}
                      >
                        Apply fix to all {curStartResName} {curEndResName} bonds
                      </Button>
                    </span>
                  </Tooltip>
                </MuiBox>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          {this.state.currLinkDisplayIdx === 0 ? null : (
            <div>
              <Button
                onClick={() => {
                  this.setState({
                    currLinkDisplayIdx: this.state.currLinkDisplayIdx - 1,
                  });
                }}
              >
                Previous Link
              </Button>
            </div>
          )}
          {this.state.currLinkDisplayIdx + 1 < nTotal && (
            <Button
              onClick={() => {
                this.setState({
                  currLinkDisplayIdx: this.state.currLinkDisplayIdx + 1,
                });
                debugLog("Dialog:FixLink:: NEXT click");
              }}
            >
              Next Link
            </Button>
          )}

          {/* SUBMIT is enabled only once every link is resolved (nLeft === 0).
              While unresolved, show a disabled button wrapped in a tooltip (the
              <span> lets the tooltip fire over the disabled button); the tooltip
              is not rendered at all once everything is resolved. */}
          {this.state.nLeft !== 0 ? (
            <Tooltip title="you still have unresolved link">
              <span>
                <Button color="success" disabled>
                  SUBMIT
                </Button>
              </span>
            </Tooltip>
          ) : (
            <Button
              color="success"
              onClick={() => {
                this.ApplyFixToITP();
              }}
            >
              SUBMIT
            </Button>
          )}

          <Button
            color="warning"
            onClick={() => {
              debugLog("Dialog:FixLink:: CLOSE click");
              this.props.close();
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
