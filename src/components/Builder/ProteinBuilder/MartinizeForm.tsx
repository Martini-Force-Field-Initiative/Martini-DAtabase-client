import React from "react";
import { Marger, FaIcon } from "../../../helpers";
import MartinizeError, { MZError } from "./MartinizeError";
import {
  Typography,
  Grid,
  Box,
  Button,
  makeStyles,
  TextField,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  IconButton,
  SvgIcon,
  Snackbar,
  Switch,
} from "@material-ui/core";
import { SimpleSelect } from "../../../Shared";
import Settings from "../../../Settings";
import IdpSetter from "./IdpSetter";
import { NglComponent } from "../NglWrapper";
const TERMINI = ["charged", "neutral", "capped"] as const;

const useStyles = makeStyles((theme) => ({
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  formContainer: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  textField: {
    width: "100%",
  },
}));

type ElasticParam =
  | "builder_ef"
  | "builder_el"
  | "builder_eu"
  | "builder_ea"
  | "builder_ep"
  | "builder_em"
  | "nTer"
  | "cTer"
  | "sc_fix"
  | "cystein_bridge";

export interface MartinizeFormProps {
  martinizeError?: MZError;
  onMartinizeBegin(e: React.FormEvent<HTMLFormElement>): any;
  builderForceField: string;
  onForceFieldChange(value: string): any;
  builderPosition: string;
  onBuilderPositionChange(value: string): any;
  builderMode: string;
  onBuilderModeChange(value: string): any;
  onReset(): any;
  builderEf: string;
  builderEl: string;
  builderEu: string;
  builderEa: string;
  builderEp: string;
  builderEm: string;
  builderwaterBias: [number, number, number];
  cTer: string;
  nTer: string;
  sc_fix: string;
  cystein_bridge: string;
  nglAllAtomWrapper?: NglComponent;
  advanced: string;
  commandline: string;
  onElasticChange(type: ElasticParam, value: string): any;
  onWaterBiasChange(index: number, value: number): void;
  onAdvancedChange(value: string): any;
  advancedActivate(): any;
  doSendMail(bool: boolean): any;
  polymerNumber: number;
  chainList: string[];
  nglAllAtomAminoAcidsView?: { [c: string]: [string, string][] };
  onIdpSetting: (vfs: string) => void;
}

export default function MartinizeForm(props: MartinizeFormProps) {
  const force_fields = Settings.martinize_variables.force_fields
    .filter(
      (ff: string) =>
        Settings.martinize_variables.force_fields_info[ff].martinize2_support,
    )
    .map((e) => ({ id: e, name: e }));
  const classes = useStyles();

  function getAvailableModes() {
    if (props.builderForceField.includes("martini3")) {
      // if (props.polymerNumber === 1){
      return [
        { id: "classic", name: "Classic" },
        { id: "elastic", name: "Elastic" },
        { id: "go", name: "Virtual Go Sites" },
      ];
      /* }
      else {
        return [
          { id: 'classic', name: 'Classic' }, { id: 'elastic', name: 'Elastic' }
        ];
      }*/
    }

    return [
      { id: "classic", name: "Classic" },
      { id: "elastic", name: "Elastic" },
    ];
  }

  return (
    <div>
      <Marger size="1rem" />
      {props.martinizeError && <MartinizeError error={props.martinizeError} />}

      <Marger size="1rem" />

      <Typography variant="h6" align="center">
        Select your coarse graining settings
      </Typography>

      <Marger size="1rem" />

      <Grid component="form" container onSubmit={props.onMartinizeBegin}>
        <Grid item sm={12}>
          <SimpleSelect
            formControlClass={classes.form}
            label="Force field"
            values={force_fields}
            id="builder_ff"
            disabled={props.advanced === "true"}
            value={props.builderForceField}
            onChange={props.onForceFieldChange}
          />
        </Grid>

        <Marger size="1rem" />

        <Grid item sm={12}>
          <SimpleSelect
            formControlClass={classes.form}
            label="Position restrains"
            values={[
              { id: "none", name: "None" },
              { id: "all", name: "All" },
              { id: "backbone", name: "Backbone" },
            ]}
            id="builder_position_restrains"
            disabled={props.advanced === "true"}
            value={props.builderPosition}
            onChange={props.onBuilderPositionChange}
          />
        </Grid>

        <Marger size="1rem" />

        <Grid item sm={12}>
          <SimpleSelect
            formControlClass={classes.form}
            label="Mode"
            values={getAvailableModes()}
            id="builder_mode"
            disabled={props.advanced === "true"}
            value={props.builderMode}
            onChange={props.onBuilderModeChange}
          />
        </Grid>
        {
          /*props.polymerNumber !== 1 ||*/ !props.builderForceField.includes(
            "martini3",
          ) && (
            <Grid item sm={12}>
              <Typography align="center" variant="caption" color="error">
                {
                  `Virtual Go Sites mode is only available for martini3 force field`
                  /*! props.builderForceField.includes('martini3') ? `Virtual Go Sites mode is only available for martini3 force field` : `Virtual Go Sites mode is only available for molecules with 1 polymer. Yours have ${props.polymerNumber}.`*/
                }
              </Typography>
            </Grid>
          )
        }

        {props.builderMode !== "advanced" && (
          <React.Fragment>
            <Grid item xs={12} sm={6} className={classes.formContainer}>
              <SimpleSelect
                label="C-terminal"
                variant="standard"
                id="cTer"
                disabled={props.advanced === "true"}
                values={TERMINI.map((e) => ({ id: e, name: e }))}
                value={props.cTer}
                onChange={(val) => {
                  props.onElasticChange("cTer", val);
                }}
                noMinWidth
                formControlClass={classes.textField}
              />
            </Grid>

            <Grid item xs={12} sm={6} className={classes.formContainer}>
              <SimpleSelect
                label="N-terminal"
                variant="standard"
                id="nTer"
                disabled={props.advanced === "true"}
                values={TERMINI.map((e) => ({ id: e, name: e }))}
                value={props.nTer}
                onChange={(val) => {
                  props.onElasticChange("nTer", val);
                }}
                default={true}
                noMinWidth
                formControlClass={classes.textField}
              />
            </Grid>

            <Grid item xs={12} sm={6} className={classes.formContainer}>
              <FormLabel component="legend">Side-Chain fix</FormLabel>
              <RadioGroup
                row
                name="scfix"
                value={props.sc_fix}
                onChange={(e) => {
                  props.onElasticChange("sc_fix", e.target.value);
                }}
              >
                <FormControlLabel
                  value="false"
                  disabled={props.advanced === "true"}
                  control={<Radio />}
                  label="no"
                />
                <FormControlLabel
                  value="true"
                  disabled={props.advanced === "true"}
                  control={<Radio />}
                  label="yes"
                />
              </RadioGroup>
            </Grid>

            <Grid item xs={12} sm={6} className={classes.formContainer}>
              <FormLabel component="legend">Cystein Bridge</FormLabel>
              <RadioGroup
                row
                name="cys"
                value={props.cystein_bridge}
                onChange={(e) => {
                  props.onElasticChange("cystein_bridge", e.target.value);
                }}
              >
                <FormControlLabel
                  value="none"
                  disabled={props.advanced === "true"}
                  control={<Radio />}
                  label="none"
                />
                <FormControlLabel
                  value="auto"
                  disabled={props.advanced === "true"}
                  control={<Radio />}
                  label="auto"
                />
              </RadioGroup>
            </Grid>
          </React.Fragment>
        )}
        {(props.builderMode === "elastic" || props.builderMode === "go") && (
          <React.Fragment>
            <Marger size="0.5em" />

            <Box style={{ paddingLeft: "0.5em", justifyContent: "center" }}>
              <Typography variant="body1" style={{ color: "gray" }}>
                Define Water biaises for:
              </Typography>
            </Box>
            <Marger size="0.em" />
            <Grid item xs={4} sm={4} className={classes.formContainer}>
              <TextField
                variant="outlined"
                className={classes.textField}
                label="&#946;-strand/extended"
                type="number"
                inputProps={{ step: 0.01 }}
                disabled={props.advanced === "true"}
                value={props.builderwaterBias[0]}
                onChange={(e) =>
                  props.onWaterBiasChange(0, parseFloat(e.target.value))
                }
              />
            </Grid>
            <Grid item xs={6} sm={4} className={classes.formContainer}>
              <TextField
                variant="outlined"
                className={classes.textField}
                label="Coil/disorder"
                type="number"
                inputProps={{ step: 0.01 }}
                disabled={props.advanced === "true"}
                value={props.builderwaterBias[1]}
                onChange={(e) =>
                  props.onWaterBiasChange(1, parseFloat(e.target.value))
                }
              />
            </Grid>
            <Grid item xs={6} sm={4} className={classes.formContainer}>
              <TextField
                variant="outlined"
                className={classes.textField}
                label="&alpha;-helix"
                type="number"
                inputProps={{ step: 0.01 }}
                disabled={props.advanced === "true"}
                value={props.builderwaterBias[2]}
                onChange={(e) =>
                  props.onWaterBiasChange(2, parseFloat(e.target.value))
                }
              />
            </Grid>
            <Marger size="05.em" />
          </React.Fragment>
        )}
        {props.builderMode === "elastic" && (
          <React.Fragment>
            <Grid item xs={12} sm={6} className={classes.formContainer}>
              <TextField
                variant="outlined"
                className={classes.textField}
                label="Force constant"
                type="number"
                disabled={props.advanced === "true"}
                value={props.builderEf}
                onChange={(e) => {
                  props.onElasticChange("builder_ef", e.target.value);
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} className={classes.formContainer}>
              <TextField
                variant="outlined"
                className={classes.textField}
                label="Lower cutoff"
                type="number"
                disabled={props.advanced === "true"}
                value={props.builderEl}
                onChange={(e) => {
                  props.onElasticChange("builder_el", e.target.value);
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} className={classes.formContainer}>
              <TextField
                variant="outlined"
                className={classes.textField}
                label="Upper cutoff"
                type="number"
                disabled={props.advanced === "true"}
                value={props.builderEu}
                onChange={(e) => {
                  props.onElasticChange("builder_eu", e.target.value);
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} className={classes.formContainer}>
              <TextField
                variant="outlined"
                className={classes.textField}
                label="Decay factor a"
                type="number"
                disabled={props.advanced === "true"}
                value={props.builderEa}
                onChange={(e) => {
                  props.onElasticChange("builder_ea", e.target.value);
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} className={classes.formContainer}>
              <TextField
                variant="outlined"
                className={classes.textField}
                label="Decay power p"
                type="number"
                disabled={props.advanced === "true"}
                value={props.builderEp}
                onChange={(e) => {
                  props.onElasticChange("builder_ep", e.target.value);
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} className={classes.formContainer}>
              <TextField
                variant="outlined"
                className={classes.textField}
                label="Minimum force"
                type="number"
                disabled={props.advanced === "true"}
                value={props.builderEm}
                onChange={(e) => {
                  props.onElasticChange("builder_em", e.target.value);
                }}
              />
            </Grid>
          </React.Fragment>
        )}
        {props.builderForceField === "martini3IDP" && (
          <Grid item xs={12} sm={12} className={classes.formContainer}>
            <IdpSetter
              atoms={props?.nglAllAtomAminoAcidsView ?? {}}
              // atoms={{ A: ["A1", "C2", "D3"], B: ["V1", "T2", "G3s"] }}
              onValidate={(data) => {
                console.warn("Builder:IdpSetter.onValidate");
                console.warn(data);
                const _ = data.reduce(
                  // Filling form element:: A-1:10 B-65:92
                  (p, c, i) =>
                    `${p}${i === 0 ? "" : " "}${c.chain}-${c.start}:${c.stop}`,
                  "",
                );
                props.onIdpSetting(_);
              }}
            />
          </Grid>
        )}
        <Grid item xs={12} sm={12} className={classes.formContainer}>
          <FormControlLabel
            control={
              <Switch
                onChange={(e) => {
                  props.doSendMail(e.target.checked);
                }}
              />
            }
            label="Send me email when my job is done"
          />
        </Grid>

        <Marger size="2rem" />

        <Box width="100%" justifyContent="space-between" display="flex">
          <Button
            variant="outlined"
            color="secondary"
            type="button"
            onClick={props.onReset}
          >
            Back
          </Button>

          <Button
            variant="outlined"
            color="primary"
            type="submit"
            endIcon={<FaIcon cocktail style={{ fontSize: "1.5rem" }} />}
          >
            Submit
          </Button>
        </Box>
      </Grid>
    </div>
  );
}
