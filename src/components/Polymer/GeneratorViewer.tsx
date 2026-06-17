import { debugDir, debugLog } from "../../logger";
import * as React from "react";
import * as d3 from "d3";
import CustomContextMenu from "./PolymerViewer/widgets/CustomContextMenu";
//import GraphicalNodeGenerator from "./Viewer/GraphicalNodeGenerator";
import {
  SimulationNode,
  SimulationLink,
  SimulationGroup,
  SimulationNodesArrayEqual,
  tupleTwoStringsArrayEqual,
  SimulationLinksArrayEqual,
  alarmEdgeSelector,
  SimulationNodesD3_Sel,
} from "./SimulationType";

/*  -----  the SVG creation is performed in render() ----- */
/*
import { SimulationEngine } from "./Viewer/SimulationEngine";
import {
  addNodeToSVG_as_Gs,
  setsizeSVG,
  addLinkToSVG,
  setSVG,
  setnodeSize,
  removeNodes,
} from "./Viewer";
*/
import CustomPolymerStash from "./CustomPolymerStash";
import { toast } from "../Toaster";
import "./GeneratorViewer.css";
import { Legend } from "./PolymerViewer/widgets/Legend";
import { Blocker } from "./PolymerViewer/widgets/Blocker";
import { FinalStepBlocker } from "./PolymerViewer/widgets/FinalStepBlocker";
import GridButton from "./PolymerViewer/widgets/GridButton";
import { PolymerViewer } from "./PolymerViewer";
import { makeNode } from "./PolymerViewer/nodeFactory";
//import BottomControls from './BottomControls';

interface propsviewer {
  forcefield: string;
  newNodes: SimulationNode[];
  newLinks: SimulationLink[];
  warningfunction: (arg: any) => void;
  getSimulation_and_update_previous: (arg: any) => void;
  change_current_position_fixlink: (arg: any) => void;
  modification: () => void;
  height: number;
  width: number;
  previous: { id: string; links?: any[] }[];
  highlight_node: [index: number, up: boolean];
  correctedLinks: [string, string][];
  errorLinks: [string, string][];
  onErrorLinkClick: (l: SimulationLink) => void;
  // True while a bond correction is pending. Node deletion is blocked then: it
  // renumbers ids, which would desync the id<->resnum/idres error mapping.
  correcting: boolean;
  // True once the pipeline finished: lock the viewer behind the final overlay.
  finalStep: boolean;
  // Open the results/download dialog (from the final overlay's button).
  onDownload: () => void;
}

interface statecustommenu {
  x: number;
  y: number;
  nodeClick: SimulationNode | undefined;
  hullClick: Element | undefined;
  lineClick: SimulationLink | undefined;
  show: boolean;
  computing: boolean;
}

let zoomValue = 1;

export default class GeneratorViewer extends React.Component<
  propsviewer,
  statecustommenu
> {
  protected root = React.createRef<HTMLDivElement>();
  state: statecustommenu = {
    x: 0,
    y: 0,
    nodeClick: undefined,
    hullClick: undefined,
    lineClick: undefined,
    show: false,
    computing: false,
  };

  // Ajouter un point d'exclamation veut dire qu'on est sur que la valeur n'est pas nul
  ref!: SVGSVGElement;
  frame!: HTMLDivElement;
  nodeSize = this.props.height / 8;
  mouseX = 0;
  mouseY = 0;
  prevPropsNewnode: any = null;
  prevPropsNewLink: any = null;
  polymerViewer!: PolymerViewer;

  // Block-on-delete: while a bond correction is pending, refuse node deletions
  // (they renumber ids and would corrupt the error mapping). Returns true and
  // warns when blocked, so callers can early-return.
  blockIfCorrecting = (): boolean => {
    if (!this.props.correcting) return false;
    toast(
      "Resolve or cancel the pending bond fix before deleting nodes.",
      "warning",
    );
    return true;
  };

  polymer_is_modified = () => {
    this.props.modification();
    d3.select(this.ref)
      .selectAll<SVGElement, SimulationLink>("line.error")
      .attr("class", "links")
      .attr("stroke", "grey");
    //debugLog("polymer_is_modified")
  };

  check_similarity = (oldNodes: any[], newNodes: any[]) => {
    if (oldNodes.length !== newNodes.length) return false;
    for (let i in oldNodes) {
      if (oldNodes[i].id !== newNodes[i].id) return false;
      // if (Object.keys(oldNodes[i]).length !== Object.keys(newNodes[i]).length) return false
      if (oldNodes[i].links && newNodes[i].links)
        if (oldNodes[i].links.length !== newNodes[i].links.length) return false;
    }
    return true;
  };

  componentDidMount() {
    //debugLog(this.ref )
    //Draw svg frame
    d3.select(this.ref)
      //.attr("style", "outline: thin solid grey;")
      .attr("width", this.props.width)
      .attr("height", this.props.height);

    this.polymerViewer = new PolymerViewer(this.ref);
    this.polymerViewer.width = this.props.width;
    this.polymerViewer.height = this.props.height;
    //simulationViewer.bind(this.simulationEngine);

    this.polymerViewer.on("simulationEnd", () => {
      this.setState({ computing: false });
    });
    /*  // We prefer the cotextual menu
    this.polymerViewer.on("viewerErrorLineClick", (l) => {
      debugLog("Event Capture viewerErrorLineClick");
      this.props.onErrorLinkClick(l);
    });*/
    //Define brush behaviour
    const brush = d3.brush();
    const gBrush = d3.select(this.ref).append("g").attr("class", "brush");
    gBrush.call(
      brush
        .on("start brush", (event: any) => {
          //this.simulation.stop(); //Stop simulation when brush
          const selection: any = event.selection; //Get brush zone coord [[x0, y0], [x1, y1]],
          if (selection) {
            //unselect nodes
            this.polymerViewer.nodeHighlight({ brushZone: selection });
            /*
                debugLog("set onfocus");
                debugLog(d)
                debugLog(this)
                debugLog(d3.select(this).attr('class'))
                */
          }
        })
        .on("end", (event: any) => {
          if (!event.selection) return;
          //debugLog(event)
          brush.clear(gBrush);
        }),
    );

    d3.select(this.ref).call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 1.5])
        // Only react to wheel zoom. Without this filter d3.zoom also captures
        // left-button mousedown as a pan gesture; that gesture is never applied
        // (the handler only reads event.transform.k) but it steals the pointer
        // from the per-node d3.drag(), so dragging a g.node no longer refreshes.
        .filter((event) => event.type === "wheel")
        .on("zoom", (event) => {
          if (zoomValue !== event.transform.k) {
            //debugLog(event)
            //On recupere la valeur de zoom
            zoomValue = event.transform.k;
            //On modifie le rayon en fonction du zoom
            //debugLog(event.transform.k);
            //Change simulation property
            this.polymerViewer.zoom = zoomValue;
            /*
            this.simulation
              .force(
                "link",
                d3
                  .forceLink()
                  .distance((this.nodeSize / 4) * (zoomValue * zoomValue))
                  .strength(0.9),
              )
              .force(
                "charge",
                d3
                  .forceManyBody()
                  .strength(-this.nodeSize * 3 * (zoomValue * zoomValue)),
              );
              */
            console.warn("Zoom changed calling UpdateSVG");
            this.UpdateSVG(true);
          }
        }),
    );
    this.polymerViewer.nodeSize = this.nodeSize;
    //setSVG(this.ref);
  }

  componentDidUpdate(prevProps: propsviewer, prevStates: statecustommenu) {
    //debugLog("UPDATING OF GeneratorViewer " + Math.floor(Math.random() * 100000) );
    debugLog("GeneratorViewer:componentDidUpdate with error link props");
    debugLog(this.props.errorLinks);
    if (
      prevProps.highlight_node[0] !== this.props.highlight_node[0] ||
      prevProps.highlight_node[1] !== this.props.highlight_node[1]
    ) {
      // Not sure when it is fired ??
      console.warn(`!!!Nodes highlight changes, ${this.props.highlight_node}`);
      // This has to move to polymer builder
      this.highlightNode(
        this.props.highlight_node[0],
        this.props.highlight_node[1],
      );
    }

    if (
      !tupleTwoStringsArrayEqual(
        prevProps.correctedLinks,
        this.props.correctedLinks,
      )
    ) {
      debugLog("--> Calling 'corrected' highlight");
      this.polymerViewer.edgeHighlight(this.props.correctedLinks, "corrected");
    }

    if (
      !tupleTwoStringsArrayEqual(prevProps.errorLinks, this.props.errorLinks)
    ) {
      debugLog(`GeneratorViewer:prevProps.errorLinks != props.errorLinks`);
      debugDir(prevProps.errorLinks);
      debugDir(this.props.errorLinks);
      this.polymerViewer.edgeHighlight(this.props.errorLinks, "alarm");
    }
    if (
      !SimulationNodesArrayEqual(prevProps.newNodes, this.props.newNodes) ||
      !SimulationLinksArrayEqual(prevProps.newLinks, this.props.newLinks)
    ) {
      //Check state and props
      // console.warn("Nodes or links altered, calling UpdateSVG");
      debugLog(
        `GeneratorViewer:prevProps.newNodes != props.newNodes || prevProps.newLinks != props.newLinks`,
      );
      this.UpdateSVG();
    }

    if (prevProps.width !== this.props.width) {
      d3.select(this.ref).attr("width", this.props.width);
      /* S-ENGINE DEPRECATED  ???
      setsizeSVG(this.props.height, this.props.width);
      */
      this.polymerViewer.width = this.props.width;
      /* S-ENGINE DEPRECATED  ???
      this.simulation.force("x", d3.forceX(this.props.width / 2).strength(0.2));
      */
      //console.warn("Width changed, calling UpdateSVG");
      // A resize is a layout change, not a polymer edit: pass justZoom=true so
      // UpdateSVG skips polymer_is_modified(), which would otherwise clear the
      // in-progress fix buffer and close the FixLink dialog on window resize.
      this.UpdateSVG(true);
    }
    if (prevProps.height !== this.props.height) {
      d3.select(this.ref).attr("height", this.props.height);
      /* S-ENGINE DEPRECATED  ???
      setsizeSVG(this.props.height, this.props.width);
      */
      /* S-ENGINE DEPRECATED  ???
      this.simulation.force(
        "y",
        d3.forceY(this.props.height / 2).strength(0.2),
      );
      */
      this.polymerViewer.height = this.props.height;
      //console.warn("Height changed, calling UpdateSVG");
      // Layout change only — skip polymer_is_modified() (see width branch).
      this.UpdateSVG(true);
    }

    if (this.props.previous.length > 0) {
      // If we go back to the first frame
      if (
        this.props.previous.length === 1 &&
        this.props.previous[0].id === "START"
      ) {
        d3.select(this.ref).selectAll("g.nodes").remove();
        d3.select(this.ref).selectAll("line").remove();
        CustomPolymerStash.decreaseID(true);
      } else if (
        this.props.previous.length < (this.polymerViewer.nodes() ?? []).length
      ) {
        let newArray = this.props.previous.map(function (el) {
          return el.id;
        });
        let node_a_supp = this.polymerViewer
          .nodes()
          ?.filter((d: SimulationNode) => !newArray.includes(d.id));
        /* debugLog(
          "hop",
          this.props.previous.length,
          this.simulation?.nodes().length,
        );
         */
        this.polymerViewer.removeNodes(node_a_supp ?? []);
      } else if (
        this.check_similarity(
          this.props.previous,
          this.polymerViewer?.nodes() ?? [],
        ) === false
      ) {
        /*
        debugLog(
          "else",
          this.props.previous.length,
          this.simulation?.nodes().length,
        );
         */
        // the number of  nodes dont change so a link has been changed
        for (let i_node_current in this.polymerViewer.nodes() ?? []) {
          const prev_state = this.props.previous[i_node_current];
          const node = (this.polymerViewer.nodes() ?? [])[i_node_current];
          if (prev_state.links?.length !== node.links?.length) {
            if (node.links !== undefined) {
              for (let nodelinked of node.links) {
                if (!prev_state.links?.includes(nodelinked.id)) {
                  // need to remove a node here into the simulation node n2
                  //debugLog(prev_state, nodelinked);
                  let link: SimulationLink = d3
                    .select(this.ref)
                    .selectAll<SVGLineElement, SimulationLink>("line")
                    .filter(
                      (L: SimulationLink) =>
                        (L.source.id === prev_state.id &&
                          L.target.id === nodelinked.id) ||
                        (L.target.id === prev_state.id &&
                          L.source.id === nodelinked.id),
                    )
                    .datum();

                  link.source.links = link.source.links!.filter(
                    (nodelink: SimulationNode) => nodelink !== link.target,
                  );
                  link.target.links = link.target.links!.filter(
                    (nodelink: SimulationNode) => nodelink !== link.source,
                  );

                  d3.select(this.ref)
                    .selectAll<SVGLineElement, SimulationLink>("line")
                    .filter((l: SimulationLink) => l === link)
                    .remove();
                }
              }
            }
          }
        }
        //console.warn("Links changed, calling UpdateSVG");
        this.UpdateSVG();
      } else {
        //debugLog("Nothing as expected");
      }
    }

    // After any update, push the brush overlay back to the bottom. The
    // edgeHighlight (error/corrected) branches above never call UpdateSVG, so
    // without this the brush can sit on top of freshly highlighted edges and
    // swallow their hover/click (showing its crosshair) until a zoom — which
    // triggers UpdateSVG — happened to re-lower it. No-op if already lowest.
    d3.select(this.ref).select("g.brush").lower();
  }

  // Define graph property
  UpdateSVG = (justZoom?: boolean) => {
    //debugLog("UpdateSVG --> ", justZoom);
    // Verifier si on doit bien ajouter des props ou si c'est deja fait
    if (this.prevPropsNewLink !== this.props.newLinks) {
      let Linktoadd: SimulationLink[] = [];
      for (let link of this.props.newLinks) {
        // if (checkLink(link.source, link.target)) {
        Linktoadd.push(link);
        // }
      }
      this.polymerViewer.links(Linktoadd);
    }
    // Si des news props apparaissent depuis manager on ajoute les noeuds !!!

    if (this.prevPropsNewnode !== this.props.newNodes) {
      /*
      if (this.props.newNodes.length > 150)
        this.props.warningfunction(
          "The navigation system may become temporarily unresponsive during the procedure, as you want to add significant number of molecules.",
        );
        */
      if (!justZoom) this.setState({ computing: true });
      // Uncomment addNodeToSVG for working version
      //addNodeToSVG(this.props.newNodes, this.simulation, this.UpdateSVG, zoomValue)
      this.polymerViewer.nodes(this.props.newNodes);
      /*
      addNodeToSVG_as_Gs(
        this.props.newNodes,
        this.simulation,
        this.UpdateSVG,
        zoomValue,
      );
       */
      //Keep the previous props in memory
      this.prevPropsNewLink = this.props.newLinks;
      this.prevPropsNewnode = this.props.newNodes;
    }

    // Build a list of grouped nodes instead of compute it a each iteration
    const groups: SimulationGroup[] = [];

    const svgPath: d3.BaseType[] = [];
    d3.select(this.ref)
      .selectAll("g.nodes.group_path")
      .each(function () {
        svgPath.push(this);
      });

    if (svgPath.length !== 0) {
      for (let i = 1; i <= svgPath.length; i++) {
        let selectedNodes: SimulationNode[] = [];
        d3.select(this.ref)
          .selectAll("g.nodes:not(.group_path)")
          .filter((d: any) => d.group === i)
          .each((d: any) => {
            selectedNodes.push(d);
          });
        //If nodes was removed
        if (selectedNodes.length !== 0) {
          groups.push({ id: i, nodes: selectedNodes });
        } else {
          d3.select(this.ref)
            .selectAll("g.nodes.group_path")
            .filter((g: any) => parseInt(g.group) === i)
            .remove();
        }
      }
    }
    //Send new simulation to Manager component
    if (!justZoom) this.polymer_is_modified();
    //console.warn("Calling reloadSimulation w/");
    //debugLog(groups)
    //
    /* S-ENGINE DEPRECATED  ???
    reloadSimulation(this.simulation, this.ref, groups);
    */

    // Keep the brush overlay at the very bottom of the SVG. Edge "ghost" lines
    // are .lower()ed (to render behind nodes) on every redraw, which would
    // otherwise drop them *below* the brush overlay — the brush then swallows
    // edge clicks (firing nodeHighlight via brushZone) instead of letting them
    // reach the edge click handler. With the brush lowered last, edges/nodes
    // receive their own clicks and the brush only activates on empty canvas.
    d3.select(this.ref).select("g.brush").lower();

    this.props.getSimulation_and_update_previous(this.polymerViewer);
  };

  handleClose = () => {
    this.setState({
      show: false,
      nodeClick: undefined,
      hullClick: undefined,
      lineClick: undefined,
    });
  };

  pasteTheseNodes = (nodes: SimulationNode[]) => {
    debugLog("pasting nodes");
    debugLog(nodes);
    this.polymerViewer.clone(nodes);
  };

  handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    if (this.state.computing) {
      //debugLog("inhert click ... computing");
      return;
    }
    const element = document.elementFromPoint(event.clientX, event.clientY);

    if (element?.classList[0] === "nodes") {
      const nodeToRm: any = d3.select(element).data()[0];
      this.setState({
        x: event.clientX,
        y: event.clientY,
        show: true,
        nodeClick: nodeToRm,
      });
    } else if (element?.className === "group_path") {
      this.setState({
        x: event.clientX,
        y: event.clientY,
        show: true,
        hullClick: element,
      });
    } else if (element?.tagName === "line") {
      const link: any = d3.select(element).data()[0];
      this.setState({
        x: event.clientX,
        y: event.clientY,
        show: true,
        lineClick: link,
      });
    } else {
      this.setState({ x: event.clientX, y: event.clientY, show: true });
    }
  };

  flashNodes = (resname: string) => {
    debugLog("GeneratorViewer::flashNodes");
    this.polymerViewer.nodeFlash({ resname });
  };
  clearEdgeHighlights = () => {
    this.polymerViewer.clearEdgeHighlights();
  };
  highlightNode = (nodeIndex: number, up: boolean) => {
    // Move this to polymerViewer
    const sel = `g.nodes[id='${nodeIndex}']`; //#${nodeIndex}`;
    debugLog("GeneratorViewer::highlightNode");
    d3.select(this.ref)
      .selectAll("g.nodes.highlight")
      .classed("highlight", false);
    d3.select(this.ref)
      .selectAll<SVGGElement, SimulationNode>(sel)
      .classed("highlight", up); /*(d,i,nodes)=>{  }*/
  };

  render() {
    debugLog(`GeneratorViewer hxw:${this.props.height} x ${this.props.width}`);
    debugLog("this.state.lineClick equals ");
    debugLog(this.state.lineClick);
    const ifContextMenuShouldAppear = (show: boolean) => {
      if (show) {
        return (
          <CustomContextMenu
            forcefield={this.props.forcefield}
            x={this.state.x}
            y={this.state.y}
            nodeClick={this.state.nodeClick}
            //hullClick={this.state.hullClick}
            lineClick={this.state.lineClick}
            onRemoveNodesLinks={(ns) => {
              this.polymerViewer.removeNodesLinks(ns);
            }}
            isErrorLink={
              this.state.lineClick === undefined
                ? false
                : this.polymerViewer.isAlarmLink(this.state.lineClick)
            }
            isCorrectedLink={
              this.state.lineClick === undefined
                ? false
                : this.polymerViewer.isCorrectedLink(this.state.lineClick)
            }
            //svg={d3.select(this.ref)}
            onDeleteLinkClick={(l) => {
              this.polymerViewer.removeLink(l);
            }}
            onDeleteErrorLink={() => {
              // OT TEST
              this.polymerViewer.cleanAlarmLinks();
            }}
            onExpandHighlight={(n) =>
              this.polymerViewer.nodeHighlight({
                simulationNodes: [n],
                connexExpansion: true,
              })
            }
            onRemoveNodeLinksClick={(n) => {
              this.polymerViewer.removeNodeLinks(n);
            }}
            onRemoveNodeClick={(n) => {
              if (this.blockIfCorrecting()) return;
              this.polymerViewer.removeNodes([n]);
            }}
            onRemoveNodes={(n) => {
              if (this.blockIfCorrecting()) return;
              this.polymerViewer.removeNodes(n);
            }}
            onPinNodesClick={(n) => {
              this.polymerViewer.toggleAnchorSelection(n);
            }}
            onFixClick={() => {
              debugLog("GeneratorViewer::onFixClick");
              this.props.onErrorLinkClick(this.state.lineClick!);
              // RESUME HERE
              // Trigger modal on specific link
              //
              // Which will trigger updating of
            }}
            selectedNodes={this.polymerViewer.onFocuSelection()}
            anchoredNodes={
              this.polymerViewer.svgSelector(
                ".onfocus.anchored",
              ) as SimulationNodesD3_Sel
            }
            // errorLinks={this.polymerViewer.getEdgesDatumByType("alarm")}
            handlePaste={(ns) => {
              this.pasteTheseNodes(ns);
            }}
            handleUpdate={() => {
              this.UpdateSVG();
            }}
            // polymerViewer={this.polymerViewer}
            zoom={zoomValue}
            /*
            change_current_position_fixlink={
              this.props.change_current_position_fixlink
            }
            */
            onNuke={() => {
              this.polymerViewer.nuke();
              this.UpdateSVG();
              CustomPolymerStash.decreaseID(true);
            }}
            onColorPicker={(
              c: string,
              nodeSelection: any, //d3.Selection<SimulationNode, SimulationLink>,
            ) => {
              debugLog(c, nodeSelection.size());
              const resnames: string[] = [];
              const self = this;
              nodeSelection.each(function (d: any) {
                const el = d3.select(this).selectAll("path");
                debugLog("Elemt log -> ", c);
                debugLog(el);
                el.style("fill", c);
                debugLog(d.resname);
                debugDir(d);
                resnames.push(d.resname);
              });
              self.polymerViewer.updateColorLibrary(c, resnames);
            }}
            onToggleAnchorSelection={(
              sn: SimulationNodesD3_Sel,
              revert?: boolean,
            ) => {
              this.polymerViewer.toggleAnchorSelection(sn, revert);
            }}
          ></CustomContextMenu>
        );
      } else return;
    };

    const clickAncCloseMenu = (event: React.MouseEvent) => {
      event.preventDefault();

      if (this.state.show) {
        this.handleClose();
      }
    };

    const handleSelectAll = (event: React.KeyboardEvent) => {
      // Ctrl+A / Cmd+A selects every node. The svg wrapper holds focus once the
      // background has been left-clicked (tabIndex={0}), so the keystroke lands
      // here; preventDefault suppresses the browser's text "select all".
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "a" || event.key === "A")
      ) {
        event.preventDefault();
        this.polymerViewer
          .svgSelector("g.nodes:not(.group_path)")
          .classed("onfocus", true);
      }
    };

    const handleDelete = (event: React.KeyboardEvent) => {
      if (event.key === "Delete") {
        if (this.blockIfCorrecting()) return;
        let li: SimulationNode[] = [];
        const _ = this.polymerViewer.onFocuSelection();
        _.each((node: SimulationNode) => {
          li.push(node);
        });
        this.polymerViewer.removeNodes(li);
      }
    };
    {
      /* Actual SVG creation is here */
    }
    return (
      <div
        id="svg-host"
        onKeyDown={(e: React.KeyboardEvent) => {
          handleSelectAll(e);
          handleDelete(e);
        }}
        tabIndex={0}
        onClick={(e) => {
          clickAncCloseMenu(e);
        }}
        onContextMenu={this.handleContextMenu}
        ref={(ref: HTMLDivElement) => (this.frame = ref)}
      >
        {this.state.computing && <Blocker />}
        {this.props.finalStep && (
          <FinalStepBlocker onDownload={this.props.onDownload} />
        )}
        <GridButton
          active={false}
          sx={{
            position: "absolute",
            top: "1.25rem",
            left: "1rem",
            zIndex: 300,
            color: "gray",
            fontSize: "2.5rem",
            p: 0,
          }}
          onClick={(b) => {
            this.polymerViewer.toggleLattice(b);
          }}
        />
        <Legend></Legend>
        <svg
          className="container"
          id="svg"
          ref={(ref: SVGSVGElement) => (this.ref = ref)}
        ></svg>

        {ifContextMenuShouldAppear(this.state.show)}

        {/*<BottomControls/>*/}
      </div>
    );
  }
}
