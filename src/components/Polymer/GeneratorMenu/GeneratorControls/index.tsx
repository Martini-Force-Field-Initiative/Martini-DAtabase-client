import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import BondEditorControls from "./BondEditorControls";
import PolymerCreatorControls from "./PolymerCreatorControls";
import { TabPanelStyles, a11yProps, TabPanel } from "./TabGenerator";

interface GCtrlProps {
  /* Polymer Ctrl logics */
  molecules: Record<string, [string, string, string][]>;
  onAddClick: (mol: string, count: number) => void;
  onAttachClick: (mol: string, count: number, target?: string) => void;
  targetLister: () => string[];
  onSetTargetClick?: (tgt: string) => void;
  handleUpload: (fileList: FileList) => void; // specific of PolymerCreatorControls
  handleVermouthFFUpload: (fileList: FileList) => void; // specific of BondEditoControl/CustomLinkUploader
  /* BondEditoControl/LinkCreator logics */
  canCreateLink: boolean;
  linksValues: () => string[];
  onSelectItemEnter: (item: string, show: boolean) => void;
  onSelectItemLeave: (item: string, show: boolean) => void;
  onSrcSelect: (item: string) => void;
  onTgtSelect: (item: string) => void;
  onAction: (item1?: string, item?: string) => void;
  customPolymerOptions: [title: string, action: () => void][];
}

export default function GeneratorControls(props: GCtrlProps) {
  const classes = TabPanelStyles();
  const [value, setValue] = React.useState("one");

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  return (
    <div
      className={classes.root}
      style={{
        marginTop: "0.5em",
        paddingLeft: "2em",
        paddingRight: "2em",
        paddingBottom: "2em",
        marginBottom: "0em",
      }}
    >
      <AppBar
        position="static"
        style={{
          //#383940
          backgroundColor: "rgb(255, 244, 229)",
          color: "rgb(102, 60, 0)",
          borderRadius: "0.3em 0.3em 0em 0em",
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="wrapped label tabs example"
          style={
            {
              /*float:'left'*/
            }
          }
          variant="fullWidth"
          centered
        >
          <Tab
            value="one"
            label="Polymer Library"
            {...a11yProps("one")}
            wrapped
          />
          <Tab
            value="two"
            label="Edit molecular bonds"
            {...a11yProps("two")}
            wrapped
          />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index="one">
        <PolymerCreatorControls
          molecules={props.molecules}
          onAddClick={props.onAddClick}
          targetLister={props.targetLister}
          handleUpload={props.handleUpload}
          onAttachClick={props.onAttachClick}
          onSetTargetClick={props.onSetTargetClick}
          customPolymerOptions={props.customPolymerOptions}
        />
      </TabPanel>
      <TabPanel value={value} index="two">
        <BondEditorControls
          handleVermouthFFUpload={props.handleVermouthFFUpload}
          canCreateLink={props.canCreateLink}
          linksValues={props.linksValues}
          onSelectItemEnter={props.onSelectItemEnter}
          onSelectItemLeave={props.onSelectItemLeave}
          onSrcSelect={props.onSrcSelect}
          onTgtSelect={props.onTgtSelect}
          onAction={props.onAction}
        />
      </TabPanel>
    </div>
  );
}
