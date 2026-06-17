import { debugDir, debugLog } from "../../../logger";
import { SimulationEngine } from "./SimulationEngine";
import { EdgeHighlightStyle, SimulationViewer } from "./SimulationViewer";
import {
  SimulationNode,
  SimulationLink,
  DynamicsParameters,
  NodeSelector,
  alarmEdgeSelector,
  correctedEdgeSelector,
  SimulationNodesD3_Sel,
} from "../SimulationType";
import { CustomSet, getConnex } from "./utils";
import { EventEmitter } from "./EventEmitter";
import GraphicalNodeGenerator from "./GraphicalNodeGenerator";

import CustomPolymerStash from "../CustomPolymerStash";
import { Lattice } from "./Layout/Lattice";
import { makeNode } from "./nodeFactory";

type PolymerViewerEventName =
  | "simulationEnd"
  | "draggedNodeEnd"
  | "viewerErrorLineClick";

export class PolymerViewer extends EventEmitter<PolymerViewerEventName> {
  simulationViewer: SimulationViewer;
  simulationEngine: SimulationEngine;
  svg: SVGSVGElement;
  _zoom: number = 1;
  private anchored = new CustomSet<SimulationNode>((e) => `${e.id}`);
  private lattice: Lattice;
  private activeLattice = false;
  constructor(svg: SVGSVGElement) {
    super();
    this.svg = svg;
    this.lattice = new Lattice();
    GraphicalNodeGenerator.setDefinitionsSVG(svg);
    this.simulationEngine = new SimulationEngine(svg);
    this.simulationViewer = new SimulationViewer(svg, this.lattice);

    this.simulationEngine.on("seTick", this.simulationViewer.svgViewSyncer);
    this.simulationEngine.on("seEnd", () => {
      this.emit("simulationEnd");
    });
    this.simulationViewer.on("svDragend", (sticky: SimulationNode[]) => {
      sticky
        .map((n) => [n, this.simulationEngine.nodeContactDetector(n)])
        .filter((_) => _[1] !== undefined)
        .forEach((_) =>
          this.simulationViewer.link(
            ...(_ as [SimulationNode, SimulationNode]),
          ),
        );
      // eventually correct to get close to lattice
      if (this.activeLattice) {
        this.simulationViewer.nodePin(
          sticky.map((n) => {
            const _ = this.lattice.closest(n.x as number, n.y as number);
            return [[_.x, _.y], n];
          }),
        );
        debugLog("ping");
        sticky.forEach((d) => this.anchored.add(d));
        debugLog("pong");
      }

      this.simulationEngine.run({
        velocityDecay: 0.8,
        alpha: 0.1,
        stickyNodes: sticky,
      });
    });

    this.simulationViewer.on("svDrag", (n: SimulationNode[]) => {
      debugLog("PolymeViewer::svDrag listener on datum");
      debugDir(n);
      this.simulationEngine.nodesFrameRepulsor(n, this.anchored.list());
      this.simulationEngine.run({
        velocityDecay: 0.8,
        alpha: 0.1,
      });
    });

    this.simulationViewer.on("errorLineClick", (l: SimulationLink) => {
      this.emit("viewerErrorLineClick", l);
    });
  }

  toggleLattice(b: boolean) {
    this.activeLattice = b;
    const latticeInfo = this.lattice.render();
    this.simulationViewer.background(latticeInfo, b);
  }
  getSimulationLayer() {
    // RESTRICT IT FOR current BACKWARD COMP, future call should be avoided at all cost
    return this.simulationEngine.getSimulationLayer();
  }
  set width(w: number) {
    debugLog(`PolymeViewer.width setter ${w}`);
    this.simulationEngine.width = w;
    this.simulationViewer.width = w;
    this.lattice.width = w;
    this.toggleLattice(this.activeLattice);
  }

  set height(h: number) {
    debugLog(`PolymeViewer.height setter ${h}`);
    this.simulationEngine.height = h;
    this.simulationViewer.height = h;
    this.lattice.height = h;
    this.toggleLattice(this.activeLattice);
  }

  set nodeSize(s: number) {
    this.simulationEngine.nodeSize = s;
    this.simulationViewer.nodeSize = s;
  }

  set zoom(v: number) {
    debugLog("PolymerViewer:zoom change " + v);
    this.simulationEngine.zoom(v);
    this.simulationViewer.zoom(v);
    this._zoom = v;
  }

  removeNodes(n: SimulationNode[]) {
    this.simulationViewer.removeNodes(n);
    n.forEach(() => CustomPolymerStash.decreaseID());
    // update Call in the original
    //
  }

  removeNodeLinks(node: SimulationNode) {
    debugLog("Remove links", node);
    if (node.links === undefined) return;

    const links: [SimulationNode, SimulationNode][] = node.links.map(
      (n: SimulationNode) => [node, n],
    );
    this.simulationViewer.removeLinks(links);
    delete node.links;
  }

  removeNodesLinks(nodes: SimulationNode[]) {
    debugLog("Remove links from all following", nodes);
    nodes.forEach((n) => this.removeNodeLinks(n));
  }

  removeLink(link?: SimulationLink) {
    if (!link) return;
    this.simulationViewer.removeLinks([[link.source, link.target]]);
  }
  isAlarmLink(l: SimulationLink) {
    debugLog("PolymerViewer::isAlarmLink input");
    debugDir(l);
    return this.simulationViewer.linkIsHighlighted(l, "alarm");
  }
  isCorrectedLink(l: SimulationLink) {
    debugLog("PolymerViewer::isCorrectedLink input");
    debugDir(l);
    return this.simulationViewer.linkIsHighlighted(l, "corrected");
  }
  cleanAlarmLinks() {
    this.simulationViewer.removeLinksBySelector(alarmEdgeSelector);
  }
  clearEdgeHighlights() {
    this.simulationViewer.clearEdgeHighlights();
  }

  svgSelector(sel: string) {
    return this.simulationViewer.select(sel);
  }

  onFocuSelection(): SimulationNodesD3_Sel {
    const _ = this.simulationViewer.select("g.onfocus");
    return _ as SimulationNodesD3_Sel;
  }
  nuke() {
    this.simulationViewer.nuke();
  }
  nodes(
    n?: SimulationNode[],
    simulate: boolean = true,
  ): undefined | SimulationNode[] {
    if (n === undefined) {
      return this.simulationEngine.nodes;
    }
    debugLog("PolymerViewer:node call");
    debugDir(n);
    //Refactor this with draggedendCallback
    // The double call to .run has to be sanitized
    this.simulationViewer.nodes(n, this._zoom);
    this.simulationEngine.nodes = n;
    if (simulate) {
      this.simulate();
    }
    return undefined;
  }

  simulate(opts: DynamicsParameters = {}) {
    // this.simulationEngine.run(this.simulationViewer.ticked.bind(this.simulationViewer));
    // We need to pass in DynamucPrametes opts as 1st arg here
    this.simulationEngine.run(opts);
  }

  links(l: SimulationLink[]) {
    this.simulationViewer.links(l);
  }

  updateColorLibrary(c: string, resnames: string[]) {
    GraphicalNodeGenerator.updateColor(c, resnames);
  }

  getEdgesByType(type: EdgeHighlightStyle) /*: SimulationLink[]*/ {
    // const _: SimulationLink[] = [];
    return this.simulationViewer.select(
      type === "alarm" ? alarmEdgeSelector : correctedEdgeSelector,
    ) as d3.Selection<SVGGElement, SimulationLink, SVGSVGElement, unknown>;
  }

  getEdgesDatumByType(type: EdgeHighlightStyle): SimulationLink[] {
    const _: SimulationLink[] = [];
    const s = this.simulationViewer.select(
      type === "alarm" ? alarmEdgeSelector : correctedEdgeSelector,
    ) as d3.Selection<SVGGElement, SimulationLink, SVGSVGElement, unknown>;
    s.each((d) => _.push(d));
    return _;
  }

  edgeHighlight(edges: [string, string][], type: EdgeHighlightStyle) {
    /*1st args could be union of interface and different highlihght could be factored in*/
    debugLog(`PolymerViewer::edgeHighlight:'${type}'\ninput is:`);
    debugDir(edges);
    this.simulationViewer.edgeHighlight(edges, type);
  }

  nodeHighlight(opts: NodeSelector = {}) {
    debugLog("PolymerViewer::NodeHighlight");
    if (opts?.connexExpansion && (opts.simulationNodes?.length ?? 0) > 0) {
      this.simulationViewer.nodeHighlight({
        simulationNodes: getConnex(...opts.simulationNodes!),
      });
      return;
    }
    this.simulationViewer.nodeHighlight(opts);
  }
  nodeFlash(opts: NodeSelector = {}) {
    debugLog("PolymerViewer::nodeFlash");
    this.simulationViewer.nodeFlash(opts);
  }

  clone(polymer: SimulationNode[]) {
    /* inject copy of nodes and their eventual internal links to the svg */

    const src2copy: { [old: string]: SimulationNode } = {};
    const copy2src: { [nw: string]: SimulationNode } = {};

    const newPolymer: SimulationNode[] = polymer.map((src) => {
      const _ = makeNode({
        resname: src.resname,
        seqid: 0,
        id: CustomPolymerStash.generateID(),
        is_composite: src.is_composite,
        category: src.category,
        from_itp: src?.from_itp,
        links: undefined,
      });

      src2copy[src.id] = _;
      copy2src[_.id] = src;

      return _;
    });

    newPolymer.forEach((new_node) => {
      const src_node = copy2src[new_node.id];
      debugLog("newPolyLinkArraySource");
      debugLog(src_node.links);
      new_node.links = src_node.links
        ?.filter((prev_tgt) => prev_tgt.id in src2copy)
        .map((prev_tgt) => src2copy[prev_tgt.id]);

      debugLog("newPolyLinkArray Created");
      debugLog(new_node.links);
    });

    const newLinks = new CustomSet<SimulationLink>((sL: SimulationLink) => {
      return (
        `${sL.target.id < sL.source.id ? sL.target.id : sL.source.id}` +
        `${sL.target.id > sL.source.id ? sL.target.id : sL.source.id}`
      );
    });

    newPolymer.forEach((n) => {
      n.links?.forEach((t) => {
        newLinks.add({ source: n, target: t });
      });
    });

    this.nodes(newPolymer);
    this.links(newLinks.list());
  }

  toggleAnchorSelection(sel: SimulationNodesD3_Sel, revert = false) {
    sel.classed("anchored", !revert).each(function (d) {
      debugLog(this);
      d.manually_anchored = !revert;
      d.fx = revert ? null : d.x;
      d.fy = revert ? null : d.y;
    });
    if (revert) {
      debugLog(
        `toggleAnchorSelection::Deleting ${sel.size()} nodes out of anchored set`,
      );
      sel.data().forEach((d) => this.anchored.delete(d));
    } else {
      debugLog(
        `toggleAnchorSelection::Adding ${sel.size()} nodes out of anchored set`,
      );
      sel.data().forEach((d) => this.anchored.add(d));
    }
    debugLog(
      `toggleAnchorSelection::Remaining anchored set size: ${sel.size()}`,
    );
  }
}
