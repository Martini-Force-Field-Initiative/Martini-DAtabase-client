import { debugLog } from '../../../../logger';
import React from "react";
import { Badge, Button } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";

import DialogContentText from "@material-ui/core/DialogContentText";
import Alert from "@material-ui/lab/Alert";

import IdpForm, { IdpRegion } from "./IdpForm";
import { Box } from "@material-ui/core";
export interface IdpMarinizeSel {
  chain: string;
  start: string;
  stop: string;
}

interface IdpSetterProps {
  atoms: { [key: string]: [string, string][] };
  onValidate: (content: IdpMarinizeSel[]) => void;
}

export default function IdpSetter(props: IdpSetterProps) {
  const [open, setOpen] = React.useState(false);
  const [alert, setAlert] = React.useState(false);
  const [regionCount, setRegionCount] = React.useState(0);
  const idpRegionRef = React.useRef<IdpRegion[]>([]);
  //const currentSelections = React.useRef;
  const handleClose = () => {
    setAlert(false);
    setOpen(false);
  };
  const handleClickOpen = () => {
    setOpen(true);
  };
  const onFormChange = (
    content: IdpRegion[],
    error: boolean,
    completed: boolean,
  ) => {
    /*
    debugLog("IdpSetter::onFormChange");
    debugLog(content);
    debugLog(error);
    debugLog(completed);
    */
    setAlert(error);
  };
  const onFormValidation = (content: IdpRegion[]) => {
    // Emit

    // Emit selection as native atom.resname, a
    //debugLog("Validating");
    setRegionCount(content.length);
    //debugLog(content);
    setOpen(false);

    const idpMartinizeSel: IdpMarinizeSel[] = content.map((idpRegion) => {
      const [uid, chain, startSymb, stopSymb] = idpRegion;
      const translateIdx = uni2propAtoms[chain];
      // Get index of start in props.atoms[chain]
      const i = translateIdx[startSymb];
      const j = translateIdx[stopSymb];
      return {
        chain,
        start: props.atoms[chain][i][1],
        stop: props.atoms[chain][j][1],
      };
    });
    /*
    debugLog("IdpSetter:onValidate");
    debugLog(idpMartinizeSel);
    */
    idpRegionRef.current = content;
    props.onValidate(idpMartinizeSel);
  };

  const uniAtoms: { [chain: string]: string[] } = {};
  const uni2propAtoms: {
    [chain: string]: { [aaSymb: string]: number };
  } = {};
  /*
  debugLog("IdpSetter starting");
  debugLog(props.atoms);
  */
  // Computing max string length and set index converter
  let longestExpr = 0;
  for (const [chain, resArr] of Object.entries(props.atoms)) {
    //debugLog(`${chain}: ${resArr}`);
    uni2propAtoms[chain] = {};
    const _ = resArr.map((aaResNaNo, i) => {
      const aaSymb = aaResNaNo.join("");
      uni2propAtoms[chain][aaSymb] = i;
      return aaSymb;
    });
    longestExpr = _.reduce(
      (prev, value) => (value.length > prev ? value.length : prev),
      longestExpr,
    );
    uniAtoms[chain] = _;
  }

  return (
    <div>
      <Badge
        badgeContent={regionCount}
        invisible={regionCount === 0}
        color="secondary"
        overlap="rectangular"
      >
        <Button variant="outlined" color="primary" onClick={handleClickOpen}>
          Define disordered region
        </Button>
      </Badge>
      <Dialog
        onClose={handleClose}
        aria-labelledby="idp-setter-dialog"
        open={open}
      >
        <DialogTitle id="idp-setter-dialog-title">
          Define disordered regions
          <Box style={{ maxWidth: "20em", textAlign: "justify" }}>
            <DialogContentText
              id="alert-dialog-description"
              variant="subtitle1"
              style={{ fontSize: "0.7em" }}
            >
              Specify the chain identifier and the amino acid sequence range of
              each Intriscically Disordered Protein regions.
            </DialogContentText>
            <Alert
              severity="error"
              style={{ visibility: alert ? "visible" : "hidden" }}
            >
              IDP regions are overlaping!
            </Alert>
          </Box>
        </DialogTitle>

        <DialogContent>
          <IdpForm
            previousContent={idpRegionRef.current}
            atoms={uniAtoms}
            onChange={onFormChange}
            onClose={handleClose}
            fieldWith={longestExpr}
            onFormValidation={onFormValidation}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
