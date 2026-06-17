import { debugDir, debugLog } from "../../../logger";
import * as React from "react";

import { NodeInjectSpec } from "../SimulationType";
import Typography from "@mui/material/Typography";
import CreateLink from "../Dialog/CreateLink";
import { Marger } from "../../../helpers";
import {
  withTheme,
  ThemeProvider,
  Divider,
  Theme,
  FormControlLabel,
  FormLabel,
  Grid,
  Icon,
  Input,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  ButtonGroup,
} from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import { ModalMoleculeSelector } from "../../Builder/MembraneBuilder/MoleculeChooser";
import { ModalHistorySelector } from "../../MyHistory/MyHistory";
import { ImportProtein } from "../Dialog/importProtein";
import ApiHelper from "../../../ApiHelper";
import CustomPolymerStash from "../CustomPolymerStash";
import PolymerSource from "./PolymerSource";
import ForceFieldChooser from "./ForceFieldChooser";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import UploaderSwitch from "./UploaderSwitch";
import PolyplyDisclaimer from "./PolyplyDisclaimer";
import PolyplyFinalStep from "./PolyplyFinalStep";
import MailerSwitch from "./MailerSwitch";
import ModalBackToDb from "./ModalBackToDb";
import ModalUploadToCustomStash from "./ModalUploaderToCustomStash";
import HomeIcon from "@mui/icons-material/Home";
import RepeatOnIcon from "@mui/icons-material/RepeatOn";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { IconButton, LinearProgress, Stack, Tooltip } from "@mui/material";
import GitHubChip from "../../SharedComponents/DependencyChips";
import { withStyles } from "@material-ui/core/styles";
import GeneratorControls from "./GeneratorControls";
import BottomControls from "./BottomControls";
import {
  FileFromHttp,
  MetadataCollection,
  Molecule,
  ReadedJobFiles,
} from "../../../types/entities";
import { toast } from "../../Toaster";
import {
  polymerEditorMoleculeSearchFilter,
  forceFieldSearchPriorityRule,
} from "../../../martiniForceFieldRules";

export interface PolyplyVersions {
  engine: string;
  vermouth: string;
}

interface GeneratorMenuProps {
  // // extends RouteComponentProps maybe ???
  ItpStore: any;
  submitBundleGRO_ITP: (gro: FileFromHttp, itps: FileFromHttp[]) => void;
  warningfunction: (arg: any) => void;
  setForcefieldAndVermouthLib: (ff: string, environment: string[]) => void;
  submitCustomITP: (itp: string) => void;
  // addnodeFromJson: (jsondata: JSON) => void;
  addnode: (arg0: NodeInjectSpec) => void;
  addlink: (arg1: any, arg2: any) => void;
  onHighlightTargets: (resname: string) => void;
  //addprotsequence: (arg0: string) => void;
  //addmoleculecoord: (arg0: string) => void;
  //addCustomitp: (arg0: string, arg1: string) => void;
  environments: Record<string, string[]>;
  send: () => void;
  dataForceFieldMolecule: {
    [forcefield: string]: Record<string, [string, string, string][]>;
  };
  errorlink: any[];
  fixlinkcomponentappear: () => void;
  clear: () => void;
  versions?: PolyplyVersions;
  previous: () => void;
  doSendMail: (maybeSend: boolean) => void;
  listSimulationMolecule: () => string[];
  onNodeHighlight: (index: number, up: boolean) => void;
  onPolymerFileUpload: (f: FileList) => void;
  onPolymerFormUpload: (title: string, content: string, format: string) => void;
  documentation: MetadataCollection;
  // Begin a width-resize drag from the resize handle.
  // The parent owns the width and handles the move/end of the drag via
  // pointer capture on the handle element.
  onResizeStart?: (e: React.PointerEvent) => void;
  // Current width (px) of the resizable menu panel, used to keep the bottom
  // controls centered on the SVG viewer rather than on the menu.
  menuWidth?: number;
  // Polymer generated (final step): replace the editable menu (below the
  // MAD HOME / RESET EDITOR bar + divider) with the thank-you alert.
  finalStep?: boolean;
}

interface GeneratorMenuState extends NodeInjectSpec {
  id1: string | undefined;
  id2: string | undefined;
  createLink: boolean;
  database_modal_chooser: boolean;
  history_modal_chooser: boolean;
  builder_mode: string;
  want_go_back: boolean;
  Menuplus: boolean;
  proteinImport: boolean;
  add_to_every_residue: string | undefined;
  basicUploadedMoleculeChoice: boolean | undefined;
  basicUploadedMoleculeDone: boolean;
  expertUploadedMolecule: boolean;
  send_mail: boolean;
  hasForceField: boolean;
  readyToGo: boolean;
  uploadToCustomStash?: string;
  engineLoadError?: boolean;
  environment?: string[];
}

class GeneratorMenu extends React.Component<
  GeneratorMenuProps,
  GeneratorMenuState
> {
  // Set the state directly. Use props if necessary.
  state = {
    forcefield: "",
    moleculeToAdd: "",
    numberToAdd: 1,
    id1: undefined,
    id2: undefined,
    createLink: false,
    database_modal_chooser: false,
    history_modal_chooser: false,
    builder_mode: "classic",
    want_go_back: false,
    Menuplus: false,
    proteinImport: false,
    add_to_every_residue: "",
    basicUploadedMoleculeChoice: undefined, // basic switch
    expertUploadedMolecule: false, // advanced option
    basicUploadedMoleculeDone: false,
    send_mail: false,
    hasForceField: false,
    readyToGo: false,
    uploadToCustomStash: undefined,
    engineLoadError: false,
    environment: undefined,
  };

  protected go_back_btn = React.createRef<any>();

  closeCreate(): void {
    //debugLog(this.state)
    // this.setState( {createLink : false})
  }

  handle_previous = (): void => {
    //Check how is the previous nodes list
    //If it's emphy we should change state to go back
    if (Number(CustomPolymerStash.getID()) < 0) {
      this.setState({
        forcefield: "",

        id1: undefined,
        id2: undefined,
        createLink: false,
        database_modal_chooser: false,
        history_modal_chooser: false,
        builder_mode: "classic",
        want_go_back: false,
        Menuplus: false,
        proteinImport: false,

        basicUploadedMoleculeChoice: undefined,
        basicUploadedMoleculeDone: false,
        expertUploadedMolecule: false,
        send_mail: false,
        uploadToCustomStash: undefined,
      });
    } else this.props.previous();
  };

  CheckNewMolecule(molecule: string, count: number, target?: string): void {
    if (this.state.forcefield === "") {
      this.props.warningfunction("Please select a forcefield");
    } else {
      //  debugLog("GeneratorMenu::CheckNewMolecule");
      /* debugDir({
        forcefield: this.state.forcefield,
        moleculeToAdd: molecule,
        numberToAdd: count,
        add_to_every_residue: target,
      });
      */
      this.props.addnode({
        forcefield: this.state.forcefield,
        moleculeToAdd: molecule,
        numberToAdd: count,
        add_to_every_residue: target,
      });
    }
  }

  CheckNewLink(idLink1: string | undefined, idLink2: string | undefined): void {
    // check undefined value :
    debugLog("[CheckNewLink] idLink1:", idLink1, " idLink2:", idLink2);
    //checkLink( )
    if (typeof idLink1 == "undefined" || typeof idLink2 == "undefined") {
      this.props.warningfunction("Please select id for your new link.");
    } else {
      this.props.addlink(idLink1.split("#")[1], idLink2.split("#")[1]);
    }
  }

  onGoBack = () => {
    //debugLog(this.go_back_btn)
    // Click on the hidden link
    this.props.clear();
    this.go_back_btn.current.click();
  };

  handleUpload = (selectorFiles: FileList) => {
    debugLog("GeneratorMenu:handleUpload");
    debugLog(selectorFiles);

    this.setState({ want_go_back: false });
    this.props.onPolymerFileUpload(selectorFiles);
  };

  getDatabaseMolecule = async (molecule: Molecule) => {
    debugLog("##getDatabaseMolecule");
    debugDir(molecule);
    this.setState({ want_go_back: false });
    this.setState({ database_modal_chooser: false });
    // This check is now irrelevant as database search account for forcefield compatiblity
    /*
    if ((molecule.force_field !== "martini3001") && (this.state.forcefield === "martini3")) {
      this.props.warningfunction("Wrong forcefield : " + molecule.force_field)
      return
    }
    if ((molecule.force_field !== "martini22") && (this.state.forcefield === "martini2")) {
      this.props.warningfunction("Wrong forcefield : " + molecule.force_field)
      return
    }
    */
    const req_itp =
      "molecule/get/" + molecule.force_field + "/" + molecule.alias + ".itp";
    const req_gro =
      "molecule/get/" + molecule.force_field + "/" + molecule.alias + ".gro";
    try {
      const iptReq = await ApiHelper.request(req_itp, { mode: "text" });
      const groReq = await ApiHelper.request(req_gro, { mode: "text" });

      this.setState({ basicUploadedMoleculeDone: true });
      this.props.submitCustomITP(iptReq);
      //this.props.submitBundleGRO_ITP(groReq, iptReq);
    } catch (e) {
      this.props.warningfunction(
        molecule.alias + ": Topology or coordinate file not found",
      );
    }
  };

  startUpMoleculeFromHistory = (ff: string, molFiles: ReadedJobFiles) => {
    /*
    This may be revised according to environment moelcule compatbility
    */
    debugLog("GeneratorMenu:startUpMoleculeFromHistory", ff, molFiles);
    if (ff !== "martini3001" && this.state.forcefield === "martini3") {
      this.props.warningfunction("Wrong forcefield : " + ff);
      return;
    } else if (ff !== "martini22" && this.state.forcefield === "martini2") {
      this.props.warningfunction("Wrong forcefield : " + ff);
      return;
    }

    debugLog(molFiles.itp_files);
    this.setState({ want_go_back: false });
    //this.props.addmoleculecoord(molecule.gro.content)
    //this.props.submitCustomITP(molecule.itp)
    const flatten_itps = molFiles.itp_files.flat();
    this.props.submitBundleGRO_ITP(molFiles.gro as FileFromHttp, flatten_itps);
    this.setState({
      history_modal_chooser: false,
      basicUploadedMoleculeDone: true,
    });
  };

  startUpMoleculeFromUpload = (gro: FileFromHttp, itps: FileFromHttp[]) => {
    this.props.submitBundleGRO_ITP(gro, itps);
    this.setState({ basicUploadedMoleculeDone: true });
  };

  onWantGoBack = (e: React.MouseEvent) => {
    // Don't go to #!
    e.preventDefault();
    this.setState({
      want_go_back: true,
    });
  };

  onWantGoBackCancel = () => {
    this.setState({ want_go_back: false });
  };

  isDisplayReady = (): boolean => {
    return (
      Object.keys(this.props.dataForceFieldMolecule).length > 0 &&
      this.props.versions !== undefined
    );
  };

  componentDidMount() {
    //  debugLog("GeneratorMenu:componentDidMount");
  }

  setEngineLoadError() {
    this.setState({ engineLoadError: true });
  }
  render() {
    const prio_ff = forceFieldSearchPriorityRule(
      this.state.forcefield,
      this.state.environment,
    );
    return (
      <div style={{ position: "relative", width: "100%" }}>
        {/* Resize handle: drag to change the menu width (parent owns the width) */}
        {this.props.onResizeStart && (
          <Tooltip title="Drag to resize menu width">
            <IconButton
              size="small"
              onPointerDown={this.props.onResizeStart}
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                cursor: "ew-resize",
                zIndex: 10,
              }}
            >
              <SwapHorizIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <ModalBackToDb
          openStatus={!!this.state.want_go_back}
          onClose={this.onWantGoBackCancel}
          onClickCancel={this.onWantGoBackCancel}
          onClickGoBack={this.onGoBack}
        ></ModalBackToDb>

        <CreateLink
          //customITPS={this.props.customITPS}
          ItpStore={this.props.ItpStore}
          close={() => {
            this.setState({ createLink: false });
          }}
          showCreate={this.state.createLink}
        ></CreateLink>

        <ModalMoleculeSelector
          open={this.state.database_modal_chooser}
          onChoose={this.getDatabaseMolecule}
          onCancel={() => this.setState({ database_modal_chooser: false })}
          moleculeFilter={(m: Molecule) => {
            return polymerEditorMoleculeSearchFilter(prio_ff, m);
          }}
          filterTitle={prio_ff}
        />

        <ModalHistorySelector
          open={this.state.history_modal_chooser}
          onChoose={this.startUpMoleculeFromHistory}
          onCancel={() => this.setState({ history_modal_chooser: false })}
          ff={this.state.forcefield}
        />

        <ImportProtein
          open={this.state.proteinImport}
          close={() => this.setState({ proteinImport: false })}
          //addprotcoord={(a) => { this.setState({ basicUploadedMoleculeDone: true }); this.props.addmoleculecoord(a) }}
          submitBundleGRO_ITP={this.startUpMoleculeFromUpload}
          //submitCustomITP={this.props.submitCustomITP}
          //addCustomitp={this.props.addCustomitp}
        />

        {this.state.uploadToCustomStash !== undefined && (
          <ModalUploadToCustomStash
            format={this.state.uploadToCustomStash}
            onValidate={(title, content) => {
              debugLog("ModalUploadToCustomStash validatation");
              debugLog(title, content);
              if (this.state.uploadToCustomStash !== undefined) {
                // ts linter
                this.props.onPolymerFormUpload(
                  content,
                  this.state.uploadToCustomStash,
                  title,
                );
                this.setState({ uploadToCustomStash: undefined });
              }
            }}
            onCancel={() => this.setState({ uploadToCustomStash: undefined })}
            ff={this.state.forcefield}
          />
        )}

        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item style={{ paddingTop: "2em" }}>
            <Typography
              component="h1"
              variant="h3"
              align="center"
              style={{
                fontWeight: 700,
                fontSize: "2.5rem",
                marginBottom: "1rem",
              }}
            >
              Polymer Editor
            </Typography>
          </Grid>
          {this.isDisplayReady() && (
            <Grid item>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: 2, // 8px between chips; bump to 1.5 or 2 if you want more
                  mb: "1rem",
                  fontSize: "0.75em",
                }}
              >
                <GitHubChip
                  alias={`Polyply:${this.props.versions?.engine}`}
                  url={"https://github.com/marrink-lab/polyply_1.0"}
                  iconSize={1.25}
                  fontSize={0.75}
                ></GitHubChip>
                {"       "}
                <GitHubChip
                  alias={`Polyply:${this.props.versions?.vermouth}`}
                  url={"https://github.com/marrink-lab/vermouth-martinize"}
                  iconSize={1.25}
                  fontSize={0.75}
                ></GitHubChip>
              </Box>
            </Grid>
          )}
          <Grid
            item
            xs={7}
            style={{ paddingTop: "0.5em", paddingBottom: "1em" }}
          >
            <Stack direction="row" spacing={3}>
              <RouterLink
                ref={this.go_back_btn}
                to="/"
                onClick={
                  this.state.want_go_back !== true
                    ? this.onWantGoBack
                    : this.onGoBack
                }
                style={{ textDecoration: "none" }}
              >
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 1,
                    color: "steelblue",
                    textDecoration: "none",
                  }}
                >
                  <HomeIcon color="primary" />
                  &nbsp;MAD HOME
                </Typography>
              </RouterLink>
              <RouterLink
                to="/polymer"
                onClick={() => {
                  window.location.reload();
                }}
                style={{ textDecoration: "none" }}
              >
                <Typography
                  sx={{
                    display: "flex",
                    color: "steelblue",
                    textDecoration: "none",
                  }}
                >
                  <RepeatOnIcon />
                  &nbsp;RESET EDITOR
                </Typography>
              </RouterLink>
            </Stack>
          </Grid>
        </Grid>
        <Divider variant="middle" />
        <Marger size="2rem" />

        {this.props.finalStep ? (
          <Grid item>
            <PolyplyFinalStep />
          </Grid>
        ) : !this.isDisplayReady() ? (
          <Grid item>
            {this.state.engineLoadError ? (
              <div style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
                <Alert variant="outlined" severity="error">
                  <Typography>
                    Unable to load polyply engine. Please try again later. If
                    the problem persists, please contact us&nbsp;
                    <a
                      style={{ whiteSpace: "nowrap" }}
                      href="mailto:mad-contacts@ens-lyon.fr"
                    >
                      {" "}
                      mad-contacts@ens-lyon.fr{" "}
                    </a>
                  </Typography>
                </Alert>
              </div>
            ) : (
              <Box sx={{ width: "100%", padding: "1rem", textAlign: "center" }}>
                <LinearProgress style={{ height: 10, borderRadius: 5 }} />
                <Typography color="primary" variant="caption">
                  Loading Polyply engine
                </Typography>
              </Box>
            )}
          </Grid>
        ) : (
          <Grid
            container
            spacing={1}
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            {/* By default we ask for forcefield choice */}
            {this.state.hasForceField ? (
              <Grid
                item
                xs={11}
                style={{
                  justifyContent: "center",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                <Alert severity="info">
                  Current forcefield is
                  <Box
                    sx={{ ml: "0.5em" }}
                    fontWeight="fontWeightBold"
                    fontSize="1.25em"
                    display="inline"
                  >
                    {this.state.forcefield}{" "}
                  </Box>
                </Alert>
              </Grid>
            ) : (
              <Grid
                item
                xs={12}
                style={{
                  width: "100%",
                  paddingLeft: "2em",
                  paddingRight: "2em",
                }}
              >
                <ForceFieldChooser
                  environments={this.props.environments}
                  onValidate={(lib: string, environment: string[]) => {
                    /*debugLog(
                      "FFC validated forwarded to GeneratorMenu lib:",
                      lib,
                      "env:",
                      environment,
                    );
                    */
                    this.props.setForcefieldAndVermouthLib(lib, environment);
                    this.setState({ forcefield: lib });
                    this.setState({ environment: environment });
                    this.setState({ hasForceField: true });
                  }}
                  documentation={this.props.documentation}
                ></ForceFieldChooser>
              </Grid>
            )}

            {
              // We have a force field but no molecule at all, we propose the premade switch
              this.state.hasForceField &&
                this.state.basicUploadedMoleculeChoice == undefined && (
                  <Grid
                    item
                    xs={11}
                    style={{
                      justifyContent: "center",
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    <UploaderSwitch
                      onClick={(yesNo) =>
                        this.setState({ basicUploadedMoleculeChoice: yesNo })
                      }
                    />
                  </Grid>
                )
            }
            {
              // Premade switch was set to yes
              // We display the premade source menu
              this.state.hasForceField &&
                this.state.basicUploadedMoleculeChoice ==
                  true /*not undefined */ &&
                !this.state.basicUploadedMoleculeDone && (
                  <Grid
                    item
                    xs={11}
                    style={{
                      justifyContent: "center",
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    <PolymerSource
                      options={[
                        //basicUploadedMoleculeDone will be set to true by those 3 calls
                        [
                          "Upload your molecular coordinate files",
                          () => this.setState({ proteinImport: true }),
                        ],
                        //  ['Load coordinates from MAD:Database',    () => this.setState({ database_modal_chooser: true })],
                        [
                          "Load coordinates from your MAD:History",
                          () => this.setState({ history_modal_chooser: true }),
                        ],
                      ]}
                    />
                  </Grid>
                )
            }
            {
              // Initial upload choice was made, display disclaimer
              this.state.hasForceField &&
                (this.state.basicUploadedMoleculeDone ||
                  this.state.basicUploadedMoleculeChoice == false) && (
                  <Grid item xs={11}>
                    <PolyplyDisclaimer></PolyplyDisclaimer>
                    <MailerSwitch
                      onChange={this.props.doSendMail}
                    ></MailerSwitch>
                  </Grid>
                )
            }

            {
              /*
              --- MAIN SECTION --
              Tab Panel Controls
            */
              this.state.hasForceField &&
                (this.state.basicUploadedMoleculeDone ||
                  this.state.basicUploadedMoleculeChoice === false) && (
                  <>
                    <GeneratorControls
                      molecules={
                        this.props.dataForceFieldMolecule[this.state.forcefield]
                      }
                      onAddClick={(molecule, count) => {
                        this.setState({ want_go_back: false });
                        this.CheckNewMolecule(molecule, count, undefined);
                      }}
                      onAttachClick={(molecule, count, target) => {
                        this.setState({ want_go_back: false });
                        this.CheckNewMolecule(molecule, count, target);
                      }}
                      targetLister={() => {
                        const nodes = this.props.listSimulationMolecule();
                        const _ = nodes.reduce(
                          (uniq, name) =>
                            uniq.includes(name) ? uniq : uniq.concat([name]),
                          [] as string[],
                        );
                        debugLog("Listing target");
                        debugDir(_);
                        return _;
                      }}
                      onSetTargetClick={(res: string) => {
                        debugLog("GeneratorMenu::onSetTargetClick:" + res);
                        this.props.onHighlightTargets(res);
                      }}
                      handleVermouthFFUpload={() => {
                        console.error("Vermouth FF upload not implemented yet");
                      }}
                      handleUpload={this.handleUpload}
                      // FINISH DECLARATION AND FORWARDING WITHIN GeneratorControls
                      canCreateLink={
                        !(this.props.listSimulationMolecule().length > 0)
                      }
                      linksValues={() =>
                        this.props
                          .listSimulationMolecule()
                          .map((n, i) => `${n}#${i}`)
                      }
                      onSelectItemEnter={(v, b) => {
                        debugLog(`GeneratorMenu::EnterEvent ${v}, ${b}`);
                        this.props.onNodeHighlight(
                          parseInt(v.split("#")[1]),
                          b,
                        );
                      }}
                      onSelectItemLeave={(v, b) => {
                        debugLog(`GeneratorMenu::LeaveEvent ${v}, ${b}`);
                        this.props.onNodeHighlight(
                          parseInt(v.split("#")[1]),
                          b,
                        );
                      }}
                      onSrcSelect={(v) => {
                        this.props.onNodeHighlight(
                          parseInt(v.split("#")[1]),
                          false,
                        );
                      }}
                      onTgtSelect={(v) => {
                        this.props.onNodeHighlight(
                          parseInt(v.split("#")[1]),
                          false,
                        );
                      }}
                      onAction={(v1, v2) => {
                        debugLog("Action !" + v1 + v2);
                        this.setState({ want_go_back: false });
                        this.CheckNewLink(v1, v2);
                      }}
                      customPolymerOptions={[
                        [
                          "Import MAD:Database",
                          () => {
                            this.setState({ database_modal_chooser: true });
                          },
                        ],
                        [
                          "Upload ITP file",
                          () => {
                            debugLog(
                              "[GeneratorMenu] setting uploadToCustomStash to ITP",
                            );
                            this.setState({ uploadToCustomStash: "itp" });
                            debugLog(this.state.uploadToCustomStash);
                          },
                        ],
                        [
                          "Import JSON definition",
                          () => {
                            this.setState({ uploadToCustomStash: "json" });
                          },
                        ],
                        [
                          "Upload FASTA sequence",
                          () => {
                            this.setState({ uploadToCustomStash: "fasta" });
                          },
                        ],
                      ]}
                    />
                    {/*}
                <PolyplyControls
                   onUndo= { this.handle_previous }
                   onSubmit={ this.props.send }
                   onRepairClick={ this.props.fixlinkcomponentappear }
                   onError={ this.props.errorlink.length !== 0 }
                />
                */}
                    <BottomControls
                      menuWidth={this.props.menuWidth}
                      onUndo={this.handle_previous}
                      onSubmit={() => {
                        const _ = this.props.listSimulationMolecule();
                        if (_.length <= 1) {
                          toast("Not enough block to assemble", "warning");
                          return;
                        }
                        this.props.send();
                      }}
                      onRepairClick={this.props.fixlinkcomponentappear}
                      onError={this.props.errorlink.length !== 0}
                    />
                  </>
                )
            }
          </Grid>
        )}
      </div>
    );
  }
}

export default withStyles((theme) => ({
  root: {
    height: "100vh",
  },
  paper: {
    margin: theme.spacing(8, 4),
    marginTop: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    marginTop: "2rem",
    width: "100%",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  side: {
    zIndex: 3,
    overflow: "auto",
    maxHeight: "100vh",
  },
}))(withTheme(GeneratorMenu));
//export default GeneratorMenu;
