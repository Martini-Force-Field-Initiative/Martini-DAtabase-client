import React from "react";
import {
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import clsx from "clsx";

import { useState } from "react";
import { Dialog } from "@material-ui/core";
import { WidthFull } from "@mui/icons-material";
import { PregnantWoman } from "@material-ui/icons";

export const CenterComponent = (props: any) => {
  return (
    <Grid
      container
      direction="column"
      style={{ justifyContent: "center" }}
      {...props}
      alignItems="center"
    >
      {props.children}
    </Grid>
  );
};

export const BigPreloader: React.FC<any> = (props: any) => {
  return (
    <CenterComponent {...props}>
      <CircularProgress size={70} thickness={2} />
    </CenterComponent>
  );
};

export function LoadFader(props: React.PropsWithChildren<{ when?: boolean }>) {
  return (
    <div className={clsx("can-load", props.when && "in")}>{props.children}</div>
  );
}

export function SimpleSelect(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  id: string;
  values: { id: string; name: string; url?: string }[];
  disabled?: boolean;
  formControlClass?: string;
  variant?: "outlined" | "standard" | "filled";
  noMinWidth?: boolean;
  required?: boolean;
  default?: boolean;
  placeholder?: string;
  //children?: ReactElement<any, any>|ReactElement<any, any>[]
  // <Icon className="fas fa-question-circle fa-xs" />
}) {
  const inputLabel = React.useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = React.useState(0);
  React.useEffect(() => {
    if (inputLabel.current) setLabelWidth(inputLabel.current!.offsetWidth);
  }, [props]);

  return (
    <FormControl
      required={props.required}
      className={props.formControlClass}
      variant={props.variant ?? "outlined"}
      style={{ minWidth: props.noMinWidth ? 0 : 180 }}
    >
      <InputLabel ref={inputLabel} id={props.id}>
        {props.label}
      </InputLabel>
      {props?.default ? (
        <Select
          displayEmpty={props.placeholder ? true : false}
          labelId={props.id}
          value={props.value}
          onChange={(v) => props.onChange(v.target.value as string)}
          labelWidth={labelWidth}
          required
          disabled={props.disabled}
          defaultValue={props.values[0].id}
        >
          {props.placeholder && (
            <MenuItem disabled value="">
              <em>{props.placeholder}</em>
            </MenuItem>
          )}
          {props.values.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      ) : (
        <Select
          displayEmpty={props.placeholder ? true : false}
          labelId={props.id}
          value={props.value}
          onChange={(v) => props.onChange(v.target.value as string)}
          labelWidth={labelWidth}
          required
          disabled={props.disabled}
        >
          {props.placeholder && (
            <MenuItem disabled value="">
              <em>{props.placeholder}</em>
            </MenuItem>
          )}
          {props.values.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      )}
    </FormControl>
  );
}

export const BetaWarning = () => {
  return (
    <Alert
      severity="warning"
      style={{ justifyContent: "center", alignItems: "center" }}
    >
      <div>
        <div>
          This is a beta version of MAD service. If you have any suggestions or
          problems, please contact us at mad-contact@ens-lyon.fr or use contact
          page.{" "}
        </div>
        <div>
          {" "}
          New accounts for using beta versions of Molecule Builder and System
          Builder will be available starting September 1st 2021.{" "}
        </div>
      </div>
    </Alert>
  );
};

export const TutorialShow = () => {
  const baseUrl = window.location.origin.toString();
  return (
    <Alert
      severity="info"
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#8fffcb",
      }}
    >
      New to MAD? Try our <Link href={baseUrl + "/tutorial"}>tutorial!</Link>
    </Alert>
  );
};

export const Citation = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0.5rem",
        flexDirection: "column",
        fontSize: "12px",
        border: "2px solid",
        borderColor: "lightgray",
      }}
    >
      <span style={{ marginBottom: "5px" }}>
        {" "}
        If you use this website, please cite :{" "}
      </span>
      <ol style={{ fontSize: "14px" }}>
        <li>
          <b>
            Extending the MAD Toolbox: New Polymer Builder and Enhanced Martini
            Database.
          </b>
          Romuald Marin, Cécile Hilpert, Fabian Grünewald, Mariana Valério, Luís
          Borges-Araúj, Stéphane Janczarski, Nicolas O. Rossini, Siewert J.
          Marrink, Paulo C. T. Souza and Guillaume Launay. BioRxiv{" "}
          <a href="https://doi.org/10.64898/2026.01.23.700524" target="_blank">
            https://doi.org/10.64898/2026.01.23.700524
          </a>
        </li>
        <li>
          <b>
            {" "}
            Facilitating CG Simulations with MAD: The MArtini Database
            Server.{" "}
          </b>
          Cécile Hilpert, Louis Beranger, Paulo C. T. Souza, Petteri A.
          Vainikka, Vincent Nieto, Siewert J. Marrink, Luca Monticelli and
          Guillaume Launay. Journal of Chemical Information and Modeling{" "}
          <a href="https://doi.org/10.1021/acs.jcim.2c01375" target="_blank">
            https://doi.org/10.1021/acs.jcim.2c01375
          </a>
        </li>
      </ol>
    </div>
  );
};

interface ImgProps {
  src: string;
  alt: string;
  preWidth?: number | string;
  width?: number;
}
export function ImageMagnify(props: ImgProps) {
  const [open, setOpen] = useState(false);
  const w = props.width ?? 80;
  const p = props.preWidth ?? "500px";
  return (
    <>
      <img
        width={`${p}`}
        src={props.src}
        alt={props.alt}
        style={{ cursor: "zoom-in", maxWidth: "100%" }}
        onClick={() => setOpen(true)}
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth={false} // disables default sizing
        fullWidth
        PaperProps={{
          style: {
            width: `${w}vw`, // 80% of viewport width
            maxWidth: "none", // removes internal cap
          },
        }}
      >
        <img src={props.src} alt={props.alt} style={{ width: "100%" }} />
      </Dialog>
    </>
  );
}
