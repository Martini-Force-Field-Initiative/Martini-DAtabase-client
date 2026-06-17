import { debugDir, debugLog } from "../../logger";
import { Grid, Paper } from "@mui/material";
import * as React from "react";
import GeneratorMenu from "./GeneratorMenu/index";
import GeneratorViewer from "./GeneratorViewer";
import {
  NodeInjectSpec,
  SimulationNode,
  SimulationLink,
  extract_graph_component,
  validateGraph,
} from "./SimulationType";
import WarningDialog from "./Dialog/warning";
import { simulationToJson } from "./generateJson";
import { getSocket, getMadSocket } from "../../Socket";
import RunPolyplyDialog from "./Dialog/RunPolyplyDialog";
import ItpFile from "itp_mad_parser";
import { blue } from "@material-ui/core/colors";
import { FixLink } from "./Dialog/FixLink";
import { ErrorFix } from "./Dialog/FixLink/utils";
import { PolymerViewer } from "./PolymerViewer";
import { makeNode } from "./PolymerViewer/nodeFactory";
import {
  Theme,
  createTheme,
  withTheme,
  withStyles,
  ThemeProvider,
} from "@material-ui/core";
import { Link as RouterLink, RouteComponentProps } from "react-router-dom";
import CustomPolymerStash from "./CustomPolymerStash";
import { toast } from "../Toaster";
import { setPageTitle } from "../../helpers";
//import { ClientDataGenerateITP, ClientDataGenerateGRO } from './dto';
import { PipeLineRunner } from "./pipeline";
import { Try } from "@mui/icons-material";

import Settings, { LoginStatus } from "../../Settings";
import {
  isErrorLogFromPBServer,
  extractErrorLinks,
  translateFirstOsError,
  ErrorLogFromPBServer,
  PipelineLinkError,
} from "./pipeline/errors";
import EmbeddedError from "../Errors/Errors";
import { MetadataCollection } from "../../types/entities";
import { FileFromHttp } from "../../types/entities";
import { PolyplyVersions } from "./GeneratorMenu";
import { NumberSelect } from "./Dialog/NumberSelect";
import { errorFixesFactory } from "./Dialog/FixLink/utils";

// Pour plus tard
//https://github.com/korydondzila/React-TypeScript-D3/tree/master/src/components
//
// Objectif : faire pareil avec element selectionnable dans le bloc menu et ajoutable dans le bloc viewer si deposer
//https://javascript.plainenglish.io/how-to-implement-drag-and-drop-from-react-to-svg-d3-16700f01470c
interface PBStates {
  readyToStart: boolean;
  renderSwitch: boolean;
  versions?: PolyplyVersions;
  Simulation: d3.Simulation<SimulationNode, SimulationLink> | undefined;
  Warningmessage: string;
  //customITP: { [name: string]: string }, // [STASH_REFORGE:to_check]  to remove ?
  dialogWarning: string;
  nodesToAdd: SimulationNode[]; // [STASH_REFORGE:to_check]  to remove ?
  linksToAdd: SimulationLink[]; // [STASH_REFORGE:to_check]  to remove ?

  loading: Boolean;
  stepsubmit: number | undefined;
  //errorLink: string[][];
  errorLinks: [string, string][];
  current_position_fixlink: number | undefined;
  errorfix: ErrorFix[];
  height: number | undefined;
  width: number | undefined;
  menuHeight?: number;
  menuWidth?: number;
  jobfinish: undefined | string;
  previous_Simulation_nodes: { id: string; links: any[] }[][];
  go_to_previous: { id: string; links?: any[] }[];
  add_fake_links: any;
  highlight_node: [number, boolean];
  dialogType?: "fatal" | "warning";
  engineLoadStatus: "pending" | "error" | "success";
  theme: Theme;
  missing_link_itp_content?: string;
  correctedLinks: [string, string][];
  // Pipeline finished successfully -> lock the viewer behind FinalStepBlocker.
  finalStep: boolean;
  // Re-open the results/download dialog from the final overlay's button.
  showResultsDialog: boolean;

  resizingMenu?: boolean;
}

// Bounds for the user-resizable left menu panel.
const MIN_MENU_WIDTH = 280;
const MIN_VIEWER_WIDTH = 200;

interface PBProps extends RouteComponentProps {
  classes: Record<string, string>;
  theme: Theme;
  location: any;
}

class PolymerBuilder extends React.Component<PBProps, PBStates> {
  protected root = React.createRef<HTMLDivElement>();
  protected menuRef = React.createRef<HTMLDivElement>();
  // Right-hand SVG viewer column. Kept separate from `root` (the full main
  // container) so size measurements in updateSizes/computeDimSVG always read
  // the whole area, not the viewer subtree.
  protected viewerRef = React.createRef<HTMLDivElement>();
  protected customStash = CustomPolymerStash;
  protected doSendEmail = false;
  protected pipelineRunner = new PipeLineRunner();

  // field, next to generatorMenuRef
  protected generatorViewerRef = React.createRef<GeneratorViewer>();
  protected generatorMenuRef = React.createRef<any>();
  protected documentation?: MetadataCollection;
  createTheme(hint: "light" | "dark") {
    const bgclr = hint === "dark" ? "#303030" : "#fafafa";
    return createTheme({
      palette: {
        type: hint,
        background: {
          default: bgclr,
        },
        primary: hint === "dark" ? { main: blue[600] } : undefined,
      },
    });
  }

  myViewerRef = React.createRef();

  state: PBStates = {
    readyToStart: false,
    renderSwitch: false,
    versions: undefined,
    Simulation: undefined,
    previous_Simulation_nodes: [[]],
    nodesToAdd: [],
    linksToAdd: [],
    Warningmessage: "",
    dialogWarning: "",
    loading: false,
    stepsubmit: undefined,
    current_position_fixlink: undefined,
    errorfix: [],
    height: undefined,
    width: undefined,
    jobfinish: undefined,
    go_to_previous: [],
    add_fake_links: undefined,
    highlight_node: [0, false],
    theme: this.createTheme("light"),
    dialogType: undefined,
    engineLoadStatus: "success", // I guess
    correctedLinks: [],
    errorLinks: [],
    finalStep: false,
    showResultsDialog: false,
  };

  job_socket = getMadSocket("PolymerGenerator");
  history_socket = getSocket("History");
  job_save_id?: string;

  private resetEditor = () => {
    // it may not be safe
    this.setState({
      nodesToAdd: [],
      linksToAdd: [],
      Warningmessage: "",
      dialogWarning: "",
      loading: false,
      stepsubmit: undefined,
      current_position_fixlink: undefined,
      errorfix: [],
      jobfinish: undefined,
      go_to_previous: [],
      add_fake_links: undefined,
      //highlight_node:[0, false],
      //theme:this.createTheme('light'),
      dialogType: undefined,
      engineLoadStatus: "success",
      // Clear the correction state so a fresh polymer unlocks node deletion
      // (correcting = errorLinks.length > 0 || correctedLinks.length > 0).
      errorLinks: [],
      correctedLinks: [],
      missing_link_itp_content: undefined,
      // Leave the finalized state so the viewer is interactive again.
      finalStep: false,
      showResultsDialog: false,
    });
  };

  computeDimSVG = () => {
    if (
      this.state.width !== undefined &&
      this.state.menuWidth !== undefined &&
      this.state.height !== undefined
    ) {
      // debugLog(`[PolymeBuilder svg computation] ${this.state.width} - ${this.state.menuWidth} x ${this.state.height}`);
      return {
        h: this.state.height,
        w: this.state.width - this.state.menuWidth,
      };
    }
    //debugLog(`[PolymeBuilder svg computation] not ready`);
    return { h: 0, w: 0 };
  };

  updateSizes = () => {
    const mainNode = this.root.current,
      menuNode = this.menuRef.current;
    if (!mainNode || !menuNode) throw "PolymerBuilderMounting issue";
    const height = mainNode.clientHeight,
      width = mainNode.clientWidth,
      menuHeight = menuNode.clientHeight,
      // Once the user (or the first measurement) owns the menu width, keep it
      // fixed across window resizes — the viewer absorbs the size change.
      // Re-measuring here would feed the controlled width back on itself.
      menuWidth = this.state.menuWidth ?? menuNode.clientWidth;
    this.setState({ height, width, menuHeight, menuWidth });
    //debugLog(`[PolymerBuilder] Current main  size is ${height}hx${width}w`);
    //debugLog(`[PolymerBuilder] Current mmenu size is ${menuHeight}hx${menuWidth}w`);

    return { height, width, menuHeight, menuWidth };
  };

  // --- Resizable left menu panel ---------------------------------------
  // The menu width is owned here so the viewer can shrink/grow in step.
  // Element that currently holds the pointer capture for a resize drag.
  private resizeEl: HTMLElement | null = null;

  onMenuResizeStart = (e: React.PointerEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    const handle = e.currentTarget as HTMLElement;
    // Pointer capture routes ALL subsequent pointer events for this pointer to
    // the handle, regardless of what is under the cursor (the SVG/canvas viewer
    // can no longer steal them). This is what keeps the drag alive end-to-end.
    try {
      handle.setPointerCapture(e.pointerId);
    } catch (err) {
      /* capture unsupported — drag still works while over the handle */
    }
    this.resizeEl = handle;
    this.setState({ resizingMenu: true });
    // Avoid selecting text while dragging.
    document.body.style.userSelect = "none";
    document.body.style.cursor = "ew-resize";
    handle.addEventListener("pointermove", this.onMenuResizeMove);
    handle.addEventListener("pointerup", this.onMenuResizeEnd);
    handle.addEventListener("pointercancel", this.onMenuResizeEnd);
  };

  onMenuResizeMove = (e: PointerEvent): void => {
    const mainNode = this.root.current;
    if (!mainNode) return;
    const { left } = mainNode.getBoundingClientRect();
    const total = mainNode.clientWidth;
    const menuWidth = Math.min(
      total - MIN_VIEWER_WIDTH,
      Math.max(MIN_MENU_WIDTH, e.clientX - left),
    );
    this.setState({ menuWidth });
  };

  onMenuResizeEnd = (e: PointerEvent): void => {
    this.setState({ resizingMenu: false });
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
    const handle = this.resizeEl;
    if (handle) {
      handle.removeEventListener("pointermove", this.onMenuResizeMove);
      handle.removeEventListener("pointerup", this.onMenuResizeEnd);
      handle.removeEventListener("pointercancel", this.onMenuResizeEnd);
      try {
        handle.releasePointerCapture(e.pointerId);
      } catch (err) {
        /* capture already released */
      }
      this.resizeEl = null;
    }
  };

  // Register History router on back-end side TO DO
  add_to_history = () => {
    this.history_socket.emit("add", this.pipelineRunner.historyData);
    this.history_socket.on("add", async (res: string) => {
      if (res) {
        this.setState({ jobfinish: res });
        this.displayWarning("The polymer has been added to your history!");
      } else {
        this.displayWarning(
          "Fail! We cannot add this polymer to your history!",
        );
      }
    });
  };

  add_to_history_and_redirect = async (): Promise<void> => {
    //debugLog(this.state)
    //this.computationBuffer.userId = Settings.user?.id
    this.history_socket.emit("add", this.pipelineRunner.historyData);

    this.history_socket.on("add", async (res: string) => {
      if (res) {
        this.setState({ jobfinish: res });
        window.location.assign("/builder/" + res);
      } else {
        //this.warningfunction("Fail! We cannot add this polymer to your history!")
        this.displayWarning(
          "Fail! We cannot add this polymer to your history!",
        );
      }
    });
  };
  redirect_to_viewer = () => {
    window.location.assign("/builder/" + this.job_save_id);
  };
  simulation_nodes_to_frame_shape = (
    node_from_simulation: SimulationNode[],
  ) => {
    let li = [];
    for (let node of node_from_simulation) {
      let links: any[] = [];
      // NEED TO EXTRACT LINKS
      if (node.links) {
        let sub_li = [];
        for (let link of node.links) {
          links.push(link.id);
        }
      }
      li.push({ id: node.id, links: links });
    }
    return li;
  };

  go_back_to_previous_simulation = () => {
    // remove the frame
    let copy_frame = [...this.state.previous_Simulation_nodes];
    const cut = copy_frame.length - 2;
    const last = copy_frame[cut];
    //PROBLEME QUAND ON NE VEUX SUPPRIMER QUE 2
    copy_frame = copy_frame.slice(0, cut);
    //debugLog("Go back to ", last);
    if (last === undefined || last.length === 0) {
      this.setState({ go_to_previous: [{ id: "START" }] });
      this.clear();
    } else
      this.setState({
        previous_Simulation_nodes: copy_frame,
        go_to_previous: last,
      });
    //means that we went back to first slides
    //else this.setState({ go_to_previous: [{ "id": "START" }] })
  };

  getSimulation_and_update_previous = (polymerViewer: PolymerViewer) => {
    let nodes = [...(polymerViewer.nodes() ?? [])];
    let old_previous = [...this.state.previous_Simulation_nodes];
    old_previous.push(this.simulation_nodes_to_frame_shape(nodes));
    //debugLog("getSimulation_and_update_previous new previous state", old_previous)
    this.setState({
      Simulation: polymerViewer.getSimulationLayer(),
      previous_Simulation_nodes: old_previous,
    });
    this.customStash.setSimulation(polymerViewer.getSimulationLayer());
  };

  change_current_position_fixlink = (linktofix: SimulationLink): void => {
    let c = 0;
    for (let eLink of this.state.errorLinks) {
      debugLog(
        `PolymerBuilder::change_current_position_fixlink (one link check)`,
      );
      let l = [linktofix.source.id, linktofix.target.id];
      debugLog(`is fixed ${linktofix.source.id} , ${linktofix.target.id} `);
      // Super dumb condition
      if (
        (eLink[0] === l[0] && eLink[1] === l[1]) ||
        (eLink[1] === l[0] && eLink[0] === l[1])
      ) {
        debugLog(`yes-> setState of current_position_fixlink to ${c}`);
        this.setState({ current_position_fixlink: c });
        return;
      }
      c = c + 1;
    }
  };

  warningfunction = (message: string): void => {
    //console.warn(`[PolymerBuilder:warningFunction] ${message}`);
    //this.setState({ Warningmessage: message })
    this.displayWarning(message);
  };
  /*
  handle_coord = (gro: string): void => {
    if (this.state.user_gro) {
      this.setState({ Warningmessage: "Molecule coordinate already loaded ! You can only load one .gro file. The previous coordinate will be removed." })
    }
    else if (gro.includes("nan")) {
      this.setState({ Warningmessage: "Missing some coordinates in gromacs file. Impossible to load coordinates of this molecule." })
    }
    else {
      this.setState({ gro_coord: gro })
    }

  }
*/
  handleFixLink = (ids: number[]): void => {
    debugLog("PolymerBuilder::handleFix : " + ids);
    // Idempotent: if this link was already fixed, don't re-append it.
    const newCorrectedLinks: [string, string][] = ids
      .filter((id) => !this.state.errorfix[id].is_fixed)
      .map((id) => {
        //Keep a trace of which link has been fixed
        this.state.errorfix[id].is_fixed = true;
        const id1 =
          parseInt(this.state.errorfix[id]["startchoice"][0]["idres"]) - 1;
        const id2 =
          parseInt(this.state.errorfix[id]["endchoice"][0]["idres"]) - 1;
        return [id1.toString(), id2.toString()];
      });
    debugLog("PolymerBuilder::handleFix adding following newCorrectedLinks");
    debugLog(newCorrectedLinks);
    this.setState({
      correctedLinks: [...this.state.correctedLinks, ...newCorrectedLinks],
    });
  };
  clearModificationBuffer = (): void => {
    // aka newmodification
    // The polymer have been updated need to init some states
    this.setState({
      errorLinks: [],
      current_position_fixlink: undefined,
      errorfix: [],
      go_to_previous: [],
    });
  };

  addnodeFromJson = (jsonFile: any): void => {
    // 09/01/2025 Verifier si reimplemnté ou à reoimplmenter
    // TO REWRITE W/ custom Stash
    // Warning !!
    // Attention a l'id qui est different entre la nouvelle representation et l'ancien json
    // besoin de faire une table de correspondance ancien et nouveau id
    /*
    if (this.currentForceField === '') {
      this.currentForceField = jsonFile.forcefield
    }

    else if ((this.currentForceField !== jsonFile.forcefield) && (jsonFile.forcefield !== undefined)) {
      this.setState({ Warningmessage: "Wrong forcefield " + this.currentForceField + " different than " + jsonFile.forcefield })
    }
    else {
      const idModification: Record<string, string | number>[] = [];

      const newMolecule: SimulationNode[] = [];
      for (let node of jsonFile.nodes) {
        const newid = generateID()
        idModification.push({
          oldID: node.id,
          newID: newid,
        })
        if (!(Object(this.state.forceFieldSpecs[this.currentForceField]).keys.includes(node.resname))) {
          this.setState({ Warningmessage: node.resname + " not in " + this.currentForceField + ". Please add a definition for your molecule." })
        }

        // Ingested from an external JSON graph: re-mint as a well-formed node
        // (stamps _frozen_id_ / manually_anchored). is_composite is absent from
        // the JSON view, so default it to false (preserves prior behaviour).
        newMolecule.push(
          makeNode({
            resname: node.resname,
            seqid: node.seqid ?? 0,
            id: newid,
            is_composite: node.is_composite ?? false,
            category: node.category,
            from_itp: node.from_itp,
          }),
        )
      }

      let newlinks = []
      for (let link of jsonFile.links) {
        //Transform old id to new id !
        const sourceNewID = idModification.filter((d: any) => (d.oldID === link.source))[0].newID
        const targetNewID = idModification.filter((d: any) => (d.oldID === link.target))[0].newID
        let node1 = newMolecule.filter((d: SimulationNode) => (d.id === sourceNewID))[0]
        let node2 = newMolecule.filter((d: SimulationNode) => (d.id === targetNewID))[0]
        newlinks.push({
          "source": node1,
          "target": node2
        });

        if (node1.links) node1.links.push(node2);
        else node1.links = [node2];

        if (node2.links) node2.links.push(node1);
        else node2.links = [node1];

      }
      this.setState({ linksToAdd: newlinks });
      this.setState({ nodesToAdd: newMolecule });
    }
    this.new_modification()
    */
  };

  addNewMolFromITP = (itpstring: string) => {
    //debugLog(`addNewMoleculeFromItp: incoming string is ${itpstring}`);
    this.customStash.push(itpstring, "itp").then(() => {
      // Update the library/list of molecules
      this.forceRender();
    });
  };

  setSendEmail = (status: boolean): void => {
    //debugLog("=>setSendEmail to " + status);
    this.doSendEmail = status;
  };

  setForcefieldAndVermouthLib = (ff: string, libs: string[]): void => {
    //debugLog(`=>setForcefield to ${ff}`);
    //debugDir(this.customStash.environments);
    //debugLog(`=>setActiveLibs to ${ff}`);
    try {
      this.customStash.checkSetForcefield(ff);
      this.pipelineRunner.setActiveLibs(libs);
    } catch (e) {
      this.setState({
        Warningmessage: `Impossible to change forcefield to ${ff}`,
      });
    }
  };
  addNode = (toadd: NodeInjectSpec) => {
    //debugLog(`PolymerBuilder:addNode ::`);
    //debugLog(toadd);
    try {
      const { newLinks, newMolecule } =
        this.customStash.createSimulationPolymer(toadd);
      //debugLog("PolymerBuilder:addNode, SimulationPolymer created");
      //debugLog({ newLinks, newMolecule });
      this.drawInViewer(newMolecule, newLinks);
    } catch (e) {
      //console.error(e);
      this.setState({ Warningmessage: `${e}` });
    }
    this.clearModificationBuffer(); // [STASH_REFORGE:to_check]  to remove ?
  };
  addLink = (id1: string, id2: string) => {
    //debugLog(`[PolymerBuilder:addLink] ${id1}, ${id2}`);
    try {
      const newLink = this.customStash.createSimulationLink(id1, id2);
      //debugLog("[PolymerBuilder:addLink], SimulationLink created");
      //debugLog(newLink);
      this.drawInViewer([], [newLink]);
    } catch (e) {
      //console.error(e);
      this.setState({ Warningmessage: `${e}` });
    }
    this.clearModificationBuffer(); // [STASH_REFORGE:to_check]  to remove ?
  };
  drawInViewer = (
    nodesToAdd: SimulationNode[],
    linksToAdd: SimulationLink[],
  ) => {
    this.setState({ nodesToAdd, linksToAdd });
    //this.setState({ nodesToAdd:[], linksToAdd:[] })
  };

  closeDialog = (): void => {
    this.setState({ stepsubmit: undefined, loading: false, dialogWarning: "" });
  };

  ClickToSend = (): void => {
    this.setState({ stepsubmit: 0 });
    //console.warn("STEP submit =>" + 0);
    if (this.state.Simulation === undefined) {
      this.setState({
        Warningmessage:
          "Your polymer is curently empty. You need to add molecule into it.",
      });
    } else {
      // Make dialog box appaer
      this.setState({ loading: true });
    }
  };
  forceRender = () => {
    this.setState({ renderSwitch: !this.state.renderSwitch });
    //console.warn("Rerender");
  };

  // Move to custom stash ?

  runPolyplyPipeline = async (
    box: string,
    name: string,
    number: string,
  ): Promise<void> => {
    /*
    console.warn("STARTING PIPELINE ----");
    debugLog(this.customStash.environPipeline());
    */
    this.pipelineRunner.initialize(
      this.customStash.environPipeline(),
      name,
      number,
      box,
      this.doSendEmail,
      Settings.user?.id as string,
    );

    /*
    debugLog(
      "[PolymerBuilder::runPolyplyPipeline] " + box + " " + name + " " + number,
    );
    */

    /* We should check simulation graph is one connected component for the requried use classes
    waititng¨Fabian answer
    https://graphology.github.io/standard-library/components#countconnectedcomponents
    */
    if (!validateGraph(this.state!.Simulation?.nodes())) {
      toast(
        "When using external ITP, polymer must be single chain. Please add appropriate links and submit again.",
        "error",
      );
      return;
    }

    this.setState({ stepsubmit: 1 });
    //console.warn("STEP submit =>" + 1);
    try {
      await this.pipelineRunner.generateITP(
        name,
        simulationToJson(
          this.state.Simulation!,
          this.customStash.currentForcefield,
        ),
      );
      this.setState({ stepsubmit: 2 });

      const listGraphComponent = extract_graph_component(
        this.state.Simulation!.nodes(),
      );
      await this.pipelineRunner.generateGRO({ listGraphComponent });
      this.setState({ stepsubmit: 3 });
      //console.warn("STEP submit =>" + 3);

      await this.pipelineRunner.generatePDB();
      this.setState({ stepsubmit: 4 });
      this.setUIasFinalStep();
    } catch (e: any) {
      /*
      console.warn("I GOT SOMETHING");
      debugDir(e);
      */
      if (e instanceof PipelineLinkError) {
        /*
        debugLog(">>Displaying link errors based on");
        debugDir(e);
        */
        this.displayLinkErrors(e);
        return;
      }
      /*
      debugLog(">>setUIasPipelineError based on ");
      debugDir(e);
      */
      this.setUIasPipelineError(e);
      return;
    }
  };

  resumePolyplyPipeLineWithFixedLinks = async (
    itpPatchFromUI: ItpFile,
    customLinks: string[],
  ) => {
    /* debugLog(
      "[PolymerBuilder:resumePolyplyPipeLineWithFixedLinks] resuming with following itp fix:",
    );
    */
    this.setState({
      stepsubmit: 2,
      loading: true,
      current_position_fixlink: undefined,
      errorLinks: [],
    });
    //console.warn("STEP submit =>" + 2);

    if (customLinks) {
      /*console.warn(
        `[PolymerBuilder:resumePolyplyPipeLineWithFixedLinks] appending following ui patched bonds ${customLinks}`,
      );*/
      const bonds = itpPatchFromUI.getField("bonds");
      bonds.push(";MAD::PolymerEditor user patched bonds");
      customLinks.forEach((_) => bonds.push(_));
      itpPatchFromUI.setField("bonds", bonds);
    }

    const itpPatched = {
      name: "custom_fix.itp",
      content: itpPatchFromUI.toString(),
      type: "itp",
    };
    //debugLog(itpPatched.content);

    try {
      const listGraphComponent = extract_graph_component(
        this.state.Simulation!.nodes(),
      );
      await this.pipelineRunner.generateGRO({
        itpPatched,
        uiPatchedLinks: customLinks,
        listGraphComponent,
      });
      this.setState({ stepsubmit: 3 });
      //console.warn("STEP submit =>" + 3);

      await this.pipelineRunner.generatePDB();
      this.setState({ stepsubmit: 4 });
      //console.warn("STEP submit =>" + 4);
    } catch (e) {
      this.setUIasPipelineError(e);
    }
  };

  setUIasFinalStep = () => {
    /* -- Successfull Computation
    -> Clean corrected  edges style
    -> Make the SVG unresponsive (blocker ?) maybe a information message claiming
    that the download fiels can be used to start a new session.
    -> propose a button to trigger the download Dialog
  */
    // (1) reset corrected/error edge styling on the graph.
    this.generatorViewerRef.current?.clearEdgeHighlights();
    // (2)+(3) The viewer lock (FinalStepBlocker) is NOT raised here: the results
    // dialog is still open and would cover it. It is raised when the user closes
    // that download window (see the dialog `close` handler), which is the UI
    // moment the comment describes.
  };
  setUIasPipelineError = (e: any) => {
    this.setState({ stepsubmit: undefined });
    this.setState({ loading: false });
    if (Object(e).hasOwnProperty("message")) {
      if (Array.isArray(e.message)) e = e.message.join("\n");
      else e = e.message;
    }

    this.displayError(e as string);
  };

  displayLinkErrors = (e: PipelineLinkError): void => {
    this.setState({ stepsubmit: undefined });
    this.setState({ loading: false });

    /*
    console.warn(
      `[PolymerBuilder:salvage_failure] processing Error Links from`,
    );
    */
    //debugDir(e);
    //e.linksErrors.forEach(([bead1, bead2]) => alarmBadLinks(bead1, bead2));

    this.displayWarning(
      `${e}.You may patch or remove erroneous molecular bonds by right clicking on the corresponding red edge or using the bottom control button "BOND FIXER".`,
    );

    this.setState({
      errorLinks: e.linksErrors,
      errorfix: errorFixesFactory(e),
      missing_link_itp_content: e.ItpWithMissingLinks,
    });

    return;
  };

  displayWarning = (e: string) => {
    this.setState({ Warningmessage: e, dialogType: "warning" });
  };
  displayError = (e: string) => {
    //debugLog("TYPE OF  Warning message is" + typeof e);
    //debugLog(e);
    this.setState({ Warningmessage: e, dialogType: "fatal" });
    //console.error("FATAl ::" + e);
  };

  fixlinkcomponentappear = () => {
    debugLog("Polymerbuilder::setState current_position_fixlink : 0");
    this.setState({ current_position_fixlink: 0 });
  };

  clear = () => {
    this.setState({
      Simulation: undefined,
      //customITP: {},
      nodesToAdd: [],
      linksToAdd: [],
      Warningmessage: "",
      dialogWarning: "",
      loading: false,
      stepsubmit: undefined,
      errorLinks: [],
      current_position_fixlink: undefined,
      errorfix: [],
    });
  };

  componentDidMount() {
    /** Functional set up of the Component
     * - Set up SVG view
     * - Load Polyply library
     * - Set up custom stash options
     */

    setPageTitle("Polymer Builder");
    if (Settings.logged === LoginStatus.None) {
      return;
    }

    this.updateSizes();
    window.addEventListener("resize", this.updateSizes);
    this.job_socket
      .request("polyply_data")
      .then((res: any) => {
        // this delivers polyply lib  content and the environments
        // libData:polyplyStore.polyplyData,
        this.customStash.setPolyplyTypes(res.libData);
        this.customStash.environments = res.envs;
        //console.warn(this.customStash.environments);
        this.setState({ engineLoadStatus: "success" });
        this.documentation = res.documentation;
      })
      .catch((e: any) => {
        //console.error("Polyply loading failed with");
        this.generatorMenuRef.current.setEngineLoadError();
        this.setState({ engineLoadStatus: "error" });
      });
    this.job_socket.request("version").then((res: PolyplyVersions) => {
      //console.warn(res);
      this.setState({ versions: res });
    });

    this.customStash.setCallbackUI(
      /* polymer register success callback */ (msg: string) => {
        toast(msg, "success");
      },
      /* polymer register failure callback */ (msg: string) => {
        toast(msg, "error");
      },
      /* polymer register warning callback */ (msg: string) => {
        toast(msg, "warning");
      },
    );
    //
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateSizes);
    if (this.resizeEl) {
      this.resizeEl.removeEventListener("pointermove", this.onMenuResizeMove);
      this.resizeEl.removeEventListener("pointerup", this.onMenuResizeEnd);
      this.resizeEl.removeEventListener("pointercancel", this.onMenuResizeEnd);
      this.resizeEl = null;
    }
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }

  listSimulationMolecule = (): string[] => {
    if (this.state != undefined)
      return this.state.Simulation?.nodes().map((n) => n.resname) ?? [];
    return [];
  };

  onSubmitBundleGRO_ITP = (gro: FileFromHttp, itps: FileFromHttp[]) => {
    /**
     * Store it and try to display in simulation view
     */
    try {
      this.customStash.setUserStartModel(gro, itps);
      /* TO UNCOMMENT -- FABIAN
      if (this.customStash.userStartModel?.itps.goITP)
        throw new Error(
          "Polymer Editor is not yet compatible with GO martinized molecules.",
        );
         */
      const polymer = this.customStash.userStartPolymer;
      if (polymer === undefined)
        throw "Unable to intialize display from provided molecule";

      const { newLinks, newMolecule } = polymer;
      //debugLog("PolymerBuilder:addNode, SimulationPolymer created");
      //debugLog({ newLinks, newMolecule });
      this.drawInViewer(newMolecule, newLinks);
    } catch (e) {
      //console.error(e);
      this.setState({ Warningmessage: `${e}`, dialogType: "fatal" });
    }
    this.clearModificationBuffer(); // [STASH_REFORGE:to_check]  to remove ?
    // Fresh molecule loaded -> drop any prior correction lock so node deletion
    // is allowed again (correctedLinks persists across clearModificationBuffer),
    // and leave the finalized (final-step) state.
    this.setState({
      correctedLinks: [],
      missing_link_itp_content: undefined,
      finalStep: false,
      showResultsDialog: false,
    });
  };

  onThemeChange = () => {
    const is_dark = this.state.theme.palette.type === "dark";

    this.changeTheme(is_dark ? "light" : "dark");
  };

  changeTheme(hint: "light" | "dark") {
    const theme = this.createTheme(hint);

    this.setState({
      theme,
    });
    //console.warn("CHANGE SVG background");
    //this.ngl.set({ backgroundColor: theme.palette.background.default });
  }

  render() {
    debugLog("PolymerBuilder::render with state.errorLinks");
    debugLog(this.state.errorLinks);

    const classes = this.props.classes;
    const is_dark = this.state.theme.palette.type === "dark";

    if (Settings.logged === LoginStatus.None) {
      return (
        <EmbeddedError
          title="Forbidden"
          text="You can't access the System Builder page without account."
        />
      );
    }

    debugLog("PolymerBuilder FixLink display is controled by 2 below:");
    debugLog(this.state.current_position_fixlink);
    debugLog(this.state.missing_link_itp_content);

    return (
      <ThemeProvider theme={this.state.theme}>
        {/* Dialog to setup/start/access results of computation pipeline */}
        {(this.state.loading || this.state.showResultsDialog) && (
          <RunPolyplyDialog
            send={this.runPolyplyPipeline}
            // Reopened from the final overlay (files ready) -> jump to the
            // download step. During a live run keep the real step (which may be
            // undefined; the dialog handles that and must NOT be forced to 4, or
            // it reads downloadBundle before finalFilesBundle is set).
            currentStep={
              this.state.showResultsDialog ? 4 : this.state.stepsubmit!
            }
            //@ts-ignore
            getResultFilesContent={() => {
              return this.pipelineRunner.downloadBundle;
            }}
            close={() => {
              // Closing the success/download window (step 4) locks the viewer
              // behind FinalStepBlocker. Re-closing the reopened download dialog
              // (showResultsDialog) or an already-final state keeps it locked;
              // closing mid-run/cancel does not.
              const final =
                this.state.stepsubmit === 4 ||
                this.state.showResultsDialog ||
                this.state.finalStep;
              this.closeDialog();
              this.setState({ showResultsDialog: false, finalStep: final });
            }}
            add_to_history={this.add_to_history}
            add_to_history_redirect={this.add_to_history_and_redirect}
            redirectToViewer={this.redirect_to_viewer}
            jobid={this.state.jobfinish}
            forcefield={this.customStash.currentForcefield}
            save_is_accessible={!this.doSendEmail}
            warning={this.state.dialogWarning}
          >
            {" "}
          </RunPolyplyDialog>
        )}

        {/* Dialog to fix and resume computation pipeline */}
        {this.state.current_position_fixlink !== undefined &&
          this.state.missing_link_itp_content && (
            <FixLink
              onUpdateFixingPlan={(ids) => {
                // (...number) << RESULME HERE
                this.handleFixLink(ids);
              }}
              //is_fixed={this.handleFixLink}
              current_position={this.state.current_position_fixlink}
              getLackBondDefITP={() => {
                return this.state.missing_link_itp_content as string;
              }}
              close={() => {
                this.setState({ current_position_fixlink: undefined });
              }}
              send={(
                itpFixed: ItpFile,
                customLinks: string[],
              ): Promise<void> => {
                //console.warn("Calling resumePolyplyPipeLineWithFixedLinks w/");

                return this.resumePolyplyPipeLineWithFixedLinks(
                  itpFixed,
                  customLinks,
                );
              }}
              error_registry={this.state.errorfix} // This is wrong shape TO RESUME HERE GLA
              update_error={(e: any): void => {
                debugLog(`[PolymerBuilder:FixLink::update_error]`);
                debugDir(e);
                this.setState({ errorfix: e });
              }}
              toToaster={(msg) => {
                toast(msg, "error");
              }}
            >
              {" "}
            </FixLink>
          )}

        {/* Dialog to display warning and fatal errors out of computation pipeline*/}
        {this.state.Warningmessage !== "" && this.state.dialogType && (
          <WarningDialog
            type={this.state.dialogType}
            report={this.state.dialogType === "fatal"}
            reponse={undefined}
            message={this.state.Warningmessage}
            close={() => {
              this.state.dialogType === "warning"
                ? this.setState({ Warningmessage: "" })
                : window.location.reload();
            }}
          ></WarningDialog>
        )}

        {/* Main UI */}
        <Grid
          container
          component="main"
          className={classes.root}
          ref={this.root}
          style={{
            backgroundColor: this.state.theme.palette.background.default,
          }}
        >
          {/* Left control panel (user-resizable width) */}
          <Grid
            item
            sm={8}
            md={4}
            component={Paper}
            elevation={0}
            className={classes.side}
            style={{
              backgroundColor: is_dark ? "#232323" : "",
              // Once measured/dragged, take ownership of the width so the
              // viewer (flex-grow below) fills the remaining space.
              ...(this.state.menuWidth !== undefined
                ? {
                    flexGrow: 0,
                    flexShrink: 0,
                    flexBasis: this.state.menuWidth,
                    width: this.state.menuWidth,
                    maxWidth: this.state.menuWidth,
                  }
                : {}),
            }}
            ref={this.menuRef}
            square
          >
            <GeneratorMenu
              ref={this.generatorMenuRef} // To render connection error from here to inside GeneratorMenu
              // Add a molecule from the left-end menu
              onPolymerFileUpload={(files: FileList) =>
                this.customStash.parse(files)
              }
              // Add a molecule from the startup top menu
              onPolymerFormUpload={(cont, fmt, tit) => {
                /*
                debugLog(
                  `[PolymerBuilder:onPolymerFormUpload] pushing '${fmt}'in stash:\n${cont}`,
                );
                */
                this.customStash.push(cont, fmt, tit);
              }}
              onHighlightTargets={(resname: string) => {
                this.generatorViewerRef.current?.flashNodes(resname);
              }}
              submitCustomITP={this.addNewMolFromITP}
              submitBundleGRO_ITP={this.onSubmitBundleGRO_ITP}
              setForcefieldAndVermouthLib={this.setForcefieldAndVermouthLib}
              dataForceFieldMolecule={this.customStash.getPolyPlyLibrary()}
              environments={this.customStash.environments}
              ItpStore={this.customStash}
              doSendMail={this.setSendEmail}
              versions={this.state.versions}
              clear={this.clear}
              errorlink={this.state.errorLinks}
              //addnodeFromJson={this.addnodeFromJson}
              addnode={this.addNode}
              addlink={this.addLink} // TO DO
              send={this.ClickToSend}
              warningfunction={/*this.warningfunction*/ this.displayWarning}
              fixlinkcomponentappear={this.fixlinkcomponentappear}
              previous={this.go_back_to_previous_simulation}
              listSimulationMolecule={this.listSimulationMolecule}
              onNodeHighlight={(i, b) => {
                this.setState({ highlight_node: [i, b] });
              }}
              documentation={this.documentation ?? {}}
              onResizeStart={this.onMenuResizeStart}
              menuWidth={this.state.menuWidth}
              finalStep={this.state.finalStep}
            />
          </Grid>

          {/* SVG Simulation wrapper (waiting DOM setup to compute size layout) */}
          <Grid
            item
            sm={4}
            md={8}
            ref={this.viewerRef}
            style={{
              textAlign: "center",
              alignItems: "center",
              justifyContent: "center",
              // Fill whatever the resizable menu leaves behind.
              flexGrow: 1,
              flexBasis: 0,
              maxWidth: "100%",
              minWidth: 0,
            }}
          >
            {this.root.current && (
              <GeneratorViewer
                ref={this.generatorViewerRef}
                modification={this.clearModificationBuffer}
                change_current_position_fixlink={
                  this.change_current_position_fixlink
                }
                warningfunction={/*this.warningfunction*/ this.displayWarning}
                forcefield={this.customStash.currentForcefield}
                getSimulation_and_update_previous={
                  this.getSimulation_and_update_previous
                }
                newNodes={this.state.nodesToAdd}
                newLinks={this.state.linksToAdd}
                correctedLinks={this.state.correctedLinks}
                errorLinks={this.state.errorLinks}
                // Block node deletion once the ITP-correction stage is entered
                // and keep it blocked even after completion: pending errors
                // (errorLinks, cleared on modification) OR an applied correction
                // (correctedLinks, which persists).
                correcting={
                  this.state.errorLinks.length > 0 ||
                  this.state.correctedLinks.length > 0
                }
                finalStep={this.state.finalStep}
                onDownload={() => this.setState({ showResultsDialog: true })}
                height={this.computeDimSVG().h}
                width={this.computeDimSVG().w}
                previous={this.state.go_to_previous}
                highlight_node={this.state.highlight_node}
                onErrorLinkClick={(l: SimulationLink) => {
                  debugLog(
                    "PolymerBuilder:onErrorLinkClick callback store and current link",
                  );
                  debugLog(this.state.errorLinks);
                  debugLog(l);
                  const iFix = this.state.errorLinks.reduce(
                    (acc: number | undefined, c, i) => {
                      const [s, t] = c;
                      const [x, y] = [l.source.id, l.target.id];
                      debugLog(`${[s, t]} <lookup> ${[x, y]}`);
                      if ((s === x && t === y) || (s === y && t === x))
                        return i;
                      return acc;
                    },
                    undefined,
                  );
                  this.setState({ current_position_fixlink: iFix });
                }}
              />
            )}
          </Grid>
        </Grid>
        {/*<BottomControls/> */}
      </ThemeProvider>
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
}))(withTheme(PolymerBuilder));
