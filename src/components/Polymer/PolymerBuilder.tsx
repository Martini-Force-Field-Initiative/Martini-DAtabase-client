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
import { alarmBadLinks, linkcorrected, removeNodes } from "./Viewer";
import { getSocket, getMadSocket } from "../../Socket";
import RunPolyplyDialog from "./Dialog/RunPolyplyDialog";
import ItpFile from "itp_mad_parser";
import { blue } from "@material-ui/core/colors";
import FixLink from "./Dialog/FixLink";
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
  errorLink: string[][];
  current_position_fixlink: number | undefined;
  errorfix: any;
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
}

interface PBProps extends RouteComponentProps {
  classes: Record<string, string>;
  theme: Theme;
  location: any;
}

class PolymerBuilder extends React.Component<PBProps, PBStates> {
  protected root = React.createRef<HTMLDivElement>();
  protected menuRef = React.createRef<HTMLDivElement>();
  protected customStash = CustomPolymerStash;
  protected doSendEmail = false;
  protected pipelineRunner = new PipeLineRunner();

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
    errorLink: [],
    current_position_fixlink: undefined,
    errorfix: undefined,
    height: undefined,
    width: undefined,
    jobfinish: undefined,
    go_to_previous: [],
    add_fake_links: undefined,
    highlight_node: [0, false],
    theme: this.createTheme("light"),
    dialogType: undefined,
    engineLoadStatus: "success", // I guess
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
      errorLink: [],
      current_position_fixlink: undefined,
      errorfix: undefined,
      jobfinish: undefined,
      go_to_previous: [],
      add_fake_links: undefined,
      //highlight_node:[0, false],
      //theme:this.createTheme('light'),
      dialogType: undefined,
      engineLoadStatus: "success",
    });
  };

  computeDimSVG = () => {
    if (
      this.state.width !== undefined &&
      this.state.menuWidth !== undefined &&
      this.state.height !== undefined
    ) {
      // console.log(`[PolymeBuilder svg computation] ${this.state.width} - ${this.state.menuWidth} x ${this.state.height}`);
      return {
        h: this.state.height,
        w: this.state.width - this.state.menuWidth,
      };
    }
    //console.log(`[PolymeBuilder svg computation] not ready`);
    return { h: 0, w: 0 };
  };

  updateSizes = () => {
    const mainNode = this.root.current,
      menuNode = this.menuRef.current;
    if (!mainNode || !menuNode) throw "PolymerBuilderMounting issue";
    const height = mainNode.clientHeight,
      width = mainNode.clientWidth,
      menuHeight = menuNode.clientHeight,
      menuWidth = menuNode.clientWidth;
    this.setState({ height, width, menuHeight, menuWidth });
    //console.log(`[PolymerBuilder] Current main  size is ${height}hx${width}w`);
    //console.log(`[PolymerBuilder] Current mmenu size is ${menuHeight}hx${menuWidth}w`);

    return { height, width, menuHeight, menuWidth };
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
    //console.log(this.state)
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
    //console.log("Go back to ", last);
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

  getSimulation_and_update_previous = (
    SimulationFromViewer: d3.Simulation<SimulationNode, SimulationLink>,
  ) => {
    let nodes = [...SimulationFromViewer.nodes()];
    let old_previous = [...this.state.previous_Simulation_nodes];
    old_previous.push(this.simulation_nodes_to_frame_shape(nodes));
    //console.log("getSimulation_and_update_previous new previous state", old_previous)
    this.setState({
      Simulation: SimulationFromViewer,
      previous_Simulation_nodes: old_previous,
    });
    this.customStash.setSimulation(SimulationFromViewer);
  };

  change_current_position_fixlink = (linktofix: SimulationLink): void => {
    let c = 0;
    for (let bordel of this.state.errorLink) {
      let l = [linktofix.source.id, linktofix.target.id];
      // Super dumb condition
      if (
        (bordel[0] === l[0] && bordel[1] === l[1]) ||
        (bordel[1] === l[0] && bordel[0] === l[1])
      ) {
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
  handleFixLink = (id: number): void => {
    //Keep a trace of which link has been fixed
    this.state.errorfix[id].is_fixed = true;
    let id1 = parseInt(this.state.errorfix[id]["startchoice"][0]["idres"]) - 1;
    let id2 = parseInt(this.state.errorfix[id]["endchoice"][0]["idres"]) - 1;
    linkcorrected(id1.toString(), id2.toString());
  };

  clearModificationBuffer = (): void => {
    // aka newmodification
    // The polymer have been updated need to init some states
    this.setState({
      errorLink: [],
      current_position_fixlink: undefined,
      errorfix: undefined,
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

        node.id = newid
        newMolecule.push(node)
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
    //console.log(`addNewMoleculeFromItp: incoming string is ${itpstring}`);
    this.customStash.push(itpstring, "itp").then(() => {
      // Update the library/list of molecules
      this.forceRender();
    });
  };

  setSendEmail = (status: boolean): void => {
    //console.log("=>setSendEmail to " + status);
    this.doSendEmail = status;
  };

  setForcefieldAndVermouthLib = (ff: string, libs: string[]): void => {
    //console.log(`=>setForcefield to ${ff}`);
    //console.dir(this.customStash.environments);
    //console.log(`=>setActiveLibs to ${ff}`);
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
    //console.log(`PolymerBuilder:addNode ::`);
    //console.log(toadd);
    try {
      const { newLinks, newMolecule } =
        this.customStash.createSimulationPolymer(toadd);
      //console.log("PolymerBuilder:addNode, SimulationPolymer created");
      //console.log({ newLinks, newMolecule });
      this.drawInViewer(newMolecule, newLinks);
    } catch (e) {
      //console.error(e);
      this.setState({ Warningmessage: `${e}` });
    }
    this.clearModificationBuffer(); // [STASH_REFORGE:to_check]  to remove ?
  };
  addLink = (id1: string, id2: string) => {
    //console.log(`[PolymerBuilder:addLink] ${id1}, ${id2}`);
    try {
      const newLink = this.customStash.createSimulationLink(id1, id2);
      //console.log("[PolymerBuilder:addLink], SimulationLink created");
      //console.log(newLink);
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
  getbeadslist = (idres: string, itpContent: string) => {
    const itplineToDico = (li: string[]) => {
      // 301 SC3  128 ARG SC1 301  0.0
      let out = [];
      for (let e of li) {
        const esplit = e.split(" ").filter((e) => e !== "");
        out.push({
          idbead: esplit[0],
          idres: esplit[2],
          resname: esplit[3],
          bead: esplit[4],
        });
      }
      return out;
    };
    //console.log(`[PolymerBuilder:getbeadslist] itp content is ${itpContent}`);
    //Need to change because id start with 0 and id res start with 1
    const idresmodif = Number(idres) + 1;
    const itp = ItpFile.readFromString(itpContent);

    const atoms = itp.getField("atoms", true);
    const listparseditp = itplineToDico(atoms);
    // console.log(listparseditp)
    // console.log(idresmodif)
    return listparseditp.filter((e: any) => parseInt(e.idres) === idresmodif);
  };

  runPolyplyPipeline = async (
    box: string,
    name: string,
    number: string,
  ): Promise<void> => {
    /*
    console.warn("STARTING PIPELINE ----");
    console.log(this.customStash.environPipeline());
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
    console.log(
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
      //console.warn("STEP submit =>" + 4);
    } catch (e: any) {
      /*
      console.warn("I GOT SOMETHING");
      console.dir(e);
      */
      if (e instanceof PipelineLinkError) {
        /*
        console.log(">>Displaying link errors based on");
        console.dir(e);
        */
        this.displayLinkErrors(e);
        return;
      }
      /*
      console.log(">>setUIasPipelineError based on ");
      console.dir(e);
      */
      this.setUIasPipelineError(e);
      return;
    }
  };

  resumePolyplyPipeLineWithFixedLinks = async (
    itpPatchFromUI: ItpFile,
    customLinks: string[],
  ) => {
    /* console.log(
      "[PolymerBuilder:resumePolyplyPipeLineWithFixedLinks] resuming with following itp fix:",
    );
    */
    this.setState({
      stepsubmit: 2,
      loading: true,
      current_position_fixlink: undefined,
      errorLink: [],
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
    //console.log(itpPatched.content);

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
    //console.dir(e);
    e.linksErrors.forEach(([bead1, bead2]) => alarmBadLinks(bead1, bead2));
    this.displayWarning(
      `${e}.You can correct this mistake with \"Right click\" -> \"Remove bad links\" or with the \"FIX A BOND\" button in red`,
    );

    const defaultErrorFix = e.linksErrors.map(([bead1, bead2]) => {
      const beadListStart = this.getbeadslist(bead1, e.ItpWithMissingLinks);
      const beadListEnd = this.getbeadslist(bead2, e.ItpWithMissingLinks);
      const startBead = beadListStart[0].idbead;
      const endbead = beadListEnd[0].idbead;
      const startResName = beadListStart[0].resname;
      const endResName = beadListEnd[0].resname;
      return {
        start: startBead,
        end: endbead,
        startresname: startResName,
        endresname: endResName,
        distance: "0.336",
        force: "1200",
        startchoice: beadListStart,
        endchoice: beadListEnd,
        is_fixed: false,
        change_bead_1: undefined,
        change_bead_2: undefined,
      };
    });
    this.setState({
      errorLink: e.linksErrors,
      errorfix: defaultErrorFix,
      missing_link_itp_content: e.ItpWithMissingLinks,
    });

    return;
  };

  displayWarning = (e: string) => {
    this.setState({ Warningmessage: e, dialogType: "warning" });
  };
  displayError = (e: string) => {
    //console.log("TYPE OF  Warning message is" + typeof e);
    //console.log(e);
    this.setState({ Warningmessage: e, dialogType: "fatal" });
    //console.error("FATAl ::" + e);
  };

  fixlinkcomponentappear = () => {
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
      errorLink: [],
      current_position_fixlink: undefined,
      errorfix: undefined,
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
      //console.log("PolymerBuilder:addNode, SimulationPolymer created");
      //console.log({ newLinks, newMolecule });
      this.drawInViewer(newMolecule, newLinks);
    } catch (e) {
      //console.error(e);
      this.setState({ Warningmessage: `${e}`, dialogType: "fatal" });
    }
    this.clearModificationBuffer(); // [STASH_REFORGE:to_check]  to remove ?
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

    return (
      <ThemeProvider theme={this.state.theme}>
        {/* Dialog to setup/start/access results of computation pipeline */}
        {this.state.loading && (
          <RunPolyplyDialog
            send={this.runPolyplyPipeline}
            currentStep={this.state.stepsubmit!}
            //@ts-ignore
            getResultFilesContent={() => {
              return this.pipelineRunner.downloadBundle;
            }}
            close={this.closeDialog}
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
              is_fixed={this.handleFixLink}
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
              fixing_error={this.state.errorfix} // This is wrong shape TO RESUME HERE GLA
              update_error={(e: any): void => {
                //console.log(`[PolymerBuilder:FixLink::update_error]`);
                //console.dir(e);
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
          {/* Left control panel */}
          <Grid
            item
            sm={8}
            md={4}
            component={Paper}
            elevation={6}
            className={classes.side}
            style={{ backgroundColor: is_dark ? "#232323" : "" }}
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
                console.log(
                  `[PolymerBuilder:onPolymerFormUpload] pushing '${fmt}'in stash:\n${cont}`,
                );
                */
                this.customStash.push(cont, fmt, tit);
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
              errorlink={this.state.errorLink}
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
            />
          </Grid>

          {/* SVG Simulation wrapper (waiting DOM setup to compute size layout) */}
          <Grid
            item
            sm={4}
            md={8}
            ref={this.root}
            style={{
              textAlign: "center",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {this.root.current && (
              <GeneratorViewer
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
                height={this.computeDimSVG().h}
                width={this.computeDimSVG().w}
                previous={this.state.go_to_previous}
                highlight_node={this.state.highlight_node}
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
