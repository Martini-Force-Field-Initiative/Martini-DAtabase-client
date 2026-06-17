import { debugLog, debugDir } from "../../../logger";
import {
  SimulationNode,
  SimulationLink,
  SimulationGroup,
  LayoutSpec,
  DynamicsParameters,
} from "../SimulationType";
import * as d3 from "d3";
import { forceLattice } from "./Layout/Lattice";
import { EventEmitter } from "./EventEmitter";
//@ts-ignore
import forceBoundary from "d3-force-boundary";

type SimulationEngineEventName = "seEnd" | "seTick";

export class SimulationEngine extends EventEmitter<SimulationEngineEventName> {
  svg: SVGSVGElement;
  private _nodeSize?: number;
  private repulseFactor = 10;
  private h: number;
  private w: number;
  padding = 10;
  private simulation: d3.Simulation<SimulationNode, SimulationLink>;
  centeringForce = false;
  linkForce: SimulationLink[] = [];
  private _zoom = 1.0;

  constructor(svg: SVGSVGElement) {
    super();
    this.svg = svg;
    this.h = svg.height.animVal.value;
    this.w = svg.width.animVal.value;

    this.simulation = d3.forceSimulation<SimulationNode, SimulationLink>();
  }
  // We want to restrict this call as much as possible
  // it is kept here for SuctomStach interaction
  // until we can rationalize it
  //
  getSimulationLayer() {
    return this.simulation;
  }

  private applyForces(sticky?: SimulationNode[]) {
    this.simulation.force(
      "charge",
      d3
        .forceManyBody()
        .strength(
          -this.nodeSize * this.repulseFactor * this._zoom * this._zoom,
        ),
    );

    this.simulation.force(
      "link",
      d3
        .forceLink(this.linkForce)
        .distance((this.nodeSize / 4) * (this._zoom * this._zoom))
        .strength(0.9),
    );

    this.simulation.force(
      "boundary",
      forceBoundary(
        this.padding,
        this.padding,
        this.w - this.padding,
        this.h - this.padding,
      ),
    );

    if (this.centeringForce) {
      debugLog("applying center force");
      this.simulation
        .force("xCenter", d3.forceX(this.w / 2).strength(0.2))
        .force("yCenter", d3.forceY(this.h / 2).strength(0.2));
    }

    if (sticky) {
    }
  }
  // We may have to enforce stop on simulation if width*height / layout change
  set width(w: number) {
    debugLog(`simulationEngine.width.setter ${w}`);
    this.w = w;
    this.applyForces();
    this.run();
  }
  // We may have to enforce stop on simulation if width*height / layout change
  set height(h: number) {
    debugLog(`simulationEngine.height.setter ${h}`);
    this.h = h;
    this.applyForces();
    this.run();
  }

  get nodeSize() {
    if (!this._nodeSize) return this.h / 8;
    return this._nodeSize;
  }

  set nodeSize(nodeSize: number) {
    this._nodeSize = nodeSize;
    this.applyForces();
  }

  set chargeFactor(value: number) {
    this.repulseFactor = value;
    this.applyForces();
  }

  restart() {
    this.simulation.restart();
  }
  get nodes(): SimulationNode[] {
    return this.simulation.nodes();
  }
  set nodes(n: SimulationNode[]) {
    //appending nodes to current simulation.nodes
    this.simulation.nodes([...this.simulation.nodes(), ...n]);
    debugLog("SimulationEngine:nodes::setter:");
    debugDir(this.simulation.nodes());
  }

  set links(v: SimulationLink[]) {
    this.linkForce = v;
  }

  /*
           Resolve overlaps for a pinned node `c` (e.g. the node being dragged) against
        a set of obstacles given as `candidates` selections (e.g. the anchored
         nodes). Internally relies on nodeContactDetector to find the contact, then
         projects `c` out to the contact rim, updating its position/pin in place.
          Repeats since pushing out of one obstacle may move `c` into another.
        Returns the last obstacle hit (undefined when no correction was needed).
        */
  nodesFrameRepulsor(
    movingNodes: SimulationNode[],
    candidates?: SimulationNode[],
  ): (SimulationNode | undefined)[] {
    debugLog("nodeFrameRepulsor::");
    debugDir(movingNodes);
    debugDir(candidates);

    return movingNodes.map((c) => {
      // Probe from the pinned target so detection happens at the intended
      // position rather than the previous tick's coordinates.
      if (c.fx != null) c.x = c.fx;
      if (c.fy != null) c.y = c.fy;

      const minDist = (this.nodeSize / 2) * this._zoom;
      let hit: SimulationNode | undefined;
      let contact = this.nodeContactDetector(c, candidates);
      let guard = 0;
      while (contact && guard++ < 4) {
        hit = contact;
        const dx = (c.x ?? 0) - (contact.x ?? 0);
        const dy = (c.y ?? 0) - (contact.y ?? 0);
        const dist = Math.hypot(dx, dy) || 1e-6;
        c.x = (contact.x ?? 0) + (dx / dist) * minDist;
        c.y = (contact.y ?? 0) + (dy / dist) * minDist;
        c.fx = c.x;
        c.fy = c.y;
        contact = this.nodeContactDetector(c, candidates);
      }
      return hit;
    });
  }

  nodeContactDetector(
    c: SimulationNode,
    candidates?: SimulationNode[],
  ): SimulationNode | undefined {
    /*
      Returns the closes SimulationNode which surface intersects the provided SimulationNode.
      When `candidates` is provided (e.g. the anchored selection), only the nodes bound to
      those selections are tested instead of the full simulation node set.
    */

    const nodeList: SimulationNode[] = candidates ? candidates : this.nodes;

    let closest: [number, SimulationNode | undefined] = [
      (this.nodeSize / 2) * this._zoom,
      undefined,
    ];
    debugLog(
      `==>Contact checker (d:${this.nodeSize / 2})  * (z:${this._zoom}) over ${nodeList.length} nodes`,
    );

    nodeList.forEach((d: SimulationNode) => {
      debugDir(c);
      debugLog(d.id, c.id);
      if (d.id === c.id) return;
      const dist = Math.sqrt(
        ((c.x ?? 0) - (d.x ?? 0)) * ((c.x ?? 0) - (d.x ?? 0)) +
          ((c.y ?? 0) - (d.y ?? 0)) * ((c.y ?? 0) - (d.y ?? 0)),
      );
      debugLog(`${dist} vs ${closest[0]}`);
      if (dist < closest[0]) closest = [dist, d];
    });
    debugLog(`======>Contact checker returns`);
    debugLog(closest[1]);
    return closest[1];
  }

  // We may have to enforce stop on simulation if width*height / layout change
  run({
    alpha = 0.1,
    alphaMin = 0.005,
    velocityDecay = 0.15,
    stickyNodes = [],
  }: DynamicsParameters = {}) {
    debugLog("SimulationEngine:run");
    debugDir(this.simulation.nodes());

    this.applyForces(stickyNodes); // just in case :p
    const nodes = this.simulation.nodes();
    if (nodes.length === 0) {
      debugLog("SimulationEngine::run abort start, empty nodes array");
      return;
    }
    stickyNodes.forEach((d) => {
      d.fx = d.x;
      d.fy = d.y;
    });
    const self = this;
    this.simulation
      .on("tick", () => {
        self.emit("seTick");
      })
      .alpha(alpha)
      .alphaMin(alphaMin)
      .velocityDecay(velocityDecay)
      .on("end", () => {
        debugLog("SimulationEngine:run::END");
        self.emit("seEnd");
        nodes.forEach((d) => {
          if (d.manually_anchored) return;
          d.fx = null;
          d.fy = null;
        });
      })
      .restart();
  }

  zoom(value: number, simulate = true) {
    this._zoom = value;
    this.applyForces();
    if (simulate) {
      this.run();
    }
  }
}
