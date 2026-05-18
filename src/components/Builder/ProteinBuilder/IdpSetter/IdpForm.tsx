import React from "react";
import { makeStyles, Box, Typography } from "@material-ui/core";
import { v4 as uuidv4 } from "uuid";
import IdpSelector from "./IdpSelector";

export type IdpRegion = [string, string, string, string];
interface IdpFormProps {
  atoms: { [key: string]: string[] };
  onChange: (content: IdpRegion[], error: boolean, completed: boolean) => void;
  onClose: () => void;
  onFormValidation: (content: IdpRegion[]) => void;
  previousContent: IdpRegion[];
  fieldWith?: number;
}

const useStyles = makeStyles((theme) => ({
  underlineOnHover: {
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
}));

export default function IdpForm(props: IdpFormProps) {
  const classes = useStyles();

  const _: IdpRegion[] =
    props.previousContent.length === 0
      ? [[uuidv4(), "", "", ""]]
      : props.previousContent;
  const IDP_regions_as_ref = React.useRef<IdpRegion[]>(_); // [ ("uuid", "A", 1, 4) ]
  const [IDP_regions, setIDP_regions] = React.useState<IdpRegion[]>(_); // [ ("uuid", "A", 1, 4) ]
  const conflictingRows = React.useRef<number[]>([]);
  const [currentlyValid, setCurrentlyValid] = React.useState(
    props.previousContent.length > 0,
  );

  const detectConflicts = (regions: IdpRegion[]): number[] => {
    /*
    console.log("detectConflicts insde");
    console.log(regions);
    */
    const data = regions.map((region) => {
      const [uid, chain, start, stop] = region;
      return [
        uid,
        chain,
        chain !== ""
          ? props.atoms[chain].findIndex((aaSymb) => aaSymb === start)
          : undefined,
        chain !== ""
          ? props.atoms[chain].findIndex((aaSymb) => aaSymb === stop)
          : undefined,
      ];
    });
    //console.log(data);
    const res = new Set<number>();
    for (let i = 0; i < data.length - 1; i++) {
      if (data[i][1] === "") continue;

      for (let j = i + 1; j < data.length; j++) {
        if (data[j][1] === "") continue;
        if (data[i][1] !== data[j][1]) continue; //Diff chains

        const [bg1, sp1]: number[] = [
          data[i][2] as number,
          data[i][3] as number,
        ];
        const [bg2, sp2]: number[] = [
          data[j][2] as number,
          data[j][3] as number,
        ];
        /*
        console.log("Comp ", bg1, sp1, bg2, sp2, "from");
        console.log(data[i]);
        console.log(data[j]);
        */
        if (bg1 >= bg2 && bg1 <= sp2) {
          res.add(i);
          res.add(j);
          continue;
        }
        if (sp1 >= bg2 && sp1 <= sp2) {
          res.add(i);
          res.add(j);
          continue;
        }
        if (bg2 >= bg1 && bg2 <= sp1) {
          res.add(i);
          res.add(j);
          continue;
        }
        if (sp2 >= bg1 && sp2 <= sp1) {
          res.add(i);
          res.add(j);
          continue;
        }
      }
    }
    return [...res];
  };

  const onChange = () => {
    props.onChange(
      IDP_regions_as_ref.current,
      conflictingRows.current.length > 0,
      IDP_regions_as_ref.current.reduce(
        (prev, _) => prev && _[1] !== "" && _[2] !== "" && _[3] !== "",
        true,
      ),
    );
  };

  const handleNewRegion = () => {
    if (!currentlyValid) return;
    setIDP_regions([...IDP_regions, [uuidv4(), "", "", ""]]);
    setCurrentlyValid(false);
  };

  const onCancelRegion = (region_id: string) => {
    //console.log("Removing " + region_id);

    IDP_regions_as_ref.current = IDP_regions_as_ref.current.filter((_) => {
      //console.log(region_id + " " + _[0]);
      return _[0] !== region_id;
    });

    if (IDP_regions_as_ref.current.length === 0) {
      IDP_regions_as_ref.current = [[uuidv4(), "", "", ""]];
      setCurrentlyValid(false);
    }
    conflictingRows.current = detectConflicts(IDP_regions_as_ref.current);
    setIDP_regions(IDP_regions_as_ref.current);

    onChange();
  };
  const handleSaveClick = () => {
    if (
      conflictingRows.current.length > 0 ||
      IDP_regions_as_ref.current.length === 0 ||
      !currentlyValid
    )
      return;
    props.onFormValidation(IDP_regions_as_ref.current);
  };
  const onValueChange = (
    region_id: string,
    chain: string,
    start: string,
    stop: string,
  ) => {
    /*  console.log(
      `IdpForm: onValueChange ${region_id} ${chain} ${start} ${stop}`,
    );*/
    setCurrentlyValid(chain !== "" && start !== "" && stop !== "");
    let isNew = true;
    IDP_regions_as_ref.current = IDP_regions_as_ref.current.map((_) => {
      if (_[0] !== region_id) return _;
      isNew = false;
      return [region_id, chain, start, stop];
    });
    if (isNew) IDP_regions_as_ref.current.push([region_id, chain, start, stop]);
    /*
    console.log(`IDPregions udpated:`);
    console.log(IDP_regions_as_ref.current);
    */
    setIDP_regions(IDP_regions_as_ref.current);
    conflictingRows.current = detectConflicts(IDP_regions_as_ref.current);

    onChange();
  };

  return (
    <Box>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        height={200} // or whatever height you need
        style={{
          paddingTop: "0em",
          overflowY: "auto",
          overflowX: "hidden", // optional: disables horizontal scroll
        }}
      >
        {IDP_regions.map((_, idx) => {
          const [uid, chain, start, stop] = _;
          return (
            <IdpSelector
              key={uid}
              atoms={props.atoms}
              uid={uid}
              chain={chain}
              start={start}
              stop={stop}
              fieldWith={props.fieldWith}
              onCancelRegion={onCancelRegion}
              onValueChange={onValueChange}
              conflict={conflictingRows.current.includes(idx)}
            />
          );
        })}
      </Box>

      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 2,
          cursor: "pointer",
        }}
      >
        {/* Left Text */}
        <Typography
          className={currentlyValid ? classes.underlineOnHover : ""}
          variant="body1"
          onClick={handleNewRegion}
          style={{
            color: currentlyValid ? "darkblue" : "gray",
            cursor: currentlyValid ? "pointer" : "auto",
          }}
        >
          Add new region
        </Typography>

        {/* Right Text */}
        <Typography
          variant="body1"
          onClick={handleSaveClick}
          className={
            currentlyValid &&
            IDP_regions_as_ref.current.length > 0 &&
            conflictingRows.current.length === 0
              ? classes.underlineOnHover
              : ""
          }
          style={{
            color:
              currentlyValid &&
              IDP_regions_as_ref.current.length > 0 &&
              conflictingRows.current.length === 0
                ? "forestgreen"
                : "gray",
            cursor:
              currentlyValid &&
              IDP_regions_as_ref.current.length > 0 &&
              conflictingRows.current.length === 0
                ? "pointer"
                : "auto",
          }}
          color="primary"
        >
          Save Changes
        </Typography>
      </Box>
      {/*
      <IconButton
        aria-label="delete"
        color="primary"
        onClick={handleNewRegion}
        disabled={!currentlyValid}
      >
        <AddCircleOutlineIcon />
      </IconButton>
      */}
    </Box>
  );
}
