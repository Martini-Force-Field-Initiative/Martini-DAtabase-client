import { debugLog } from "../../logger";
import { SimulationNodeDatum, Selection } from "d3";

export type LayoutSpec = "lattice" | "basic";

export const linkLineSelector = "g.lines:not(.lattice)";
export const simpleNodeSelector = "g.nodes:not(.group_path)";
export const anyNodeSelector = "g.nodes";
export const backgroundSelector = "g.background";
export const alarmEdgeSelector = "g.lines.alarm";
export const correctedEdgeSelector = "g.lines.corrected";

export type SimulationElementsD3_Sel = Selection<
  SVGGElement,
  SimulationNode | SimulationLink,
  SVGSVGElement,
  unknown
>;
export type SimulationNodesD3_Sel = Selection<
  SVGGElement,
  SimulationNode,
  SVGSVGElement,
  unknown
>;
export type SimulationLinksD3_Sel = Selection<
  SVGGElement,
  SimulationLink,
  SVGSVGElement,
  unknown
>;

export interface NodeInjectSpec {
  forcefield: string;
  moleculeToAdd: string;
  numberToAdd: number;
  add_to_every_residue: string | undefined;
}

export interface SimulationNode extends SimulationNodeDatum {
  resname: string;
  seqid: number;
  is_composite: boolean;
  category?: string;
  links?: SimulationNode[];
  id: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  group?: number;
  from_itp?: string;
  manually_anchored: boolean;
  // Internal, stable identity stamped once at creation by makeNode() (see
  // PolymerViewer/nodeFactory). Unlike `id` (renumbered on node removal to stay
  // contiguous for polyply), this never changes for the lifetime of a node, so
  // it is used as the bookkeeping-map key. Required: every node must go through
  // the factory. It is NOT part of the graph model — JSON export projects through
  // NodeView/LinkView, which omit it, so it never leaves the client.
  _frozen_id_: number;
}

export interface NodeSelector {
  brushZone?: [[number, number], [number, number]];
  simulationNodes?: SimulationNode[];
  resname?: string;
  connexExpansion?: boolean;
}

export interface SimulationLink extends SimulationNodeDatum {
  source: SimulationNode;
  target: SimulationNode;
}

export interface SimulationGroup extends SimulationNodeDatum {
  id: number;
  nodes?: SimulationNode[];
  nodesD3?: d3.Selection<
    SVGCircleElement,
    SimulationNode,
    SVGSVGElement,
    unknown
  >;
  color?: string;
  x?: number;
  y?: number;
}

// Used for JSON export
export interface NodeView {
  resname: string;
  seqid: number;
  id: number;
  from_itp?: string;
}

export interface LinkView {
  source: number;
  target: number;
}

export const extract_graph_component = (nodes: SimulationNode[]) => {
  let list_Components: string[][] = [];
  let visited: SimulationNode[] = [];
  let stack: SimulationNode[] = [];
  let id_component = 0;

  while (nodes.length !== visited.length) {
    let component: any = new Set();

    // Init first node
    debugLog(nodes.filter((node) => !visited.includes(node)));
    let node = nodes.filter((node) => !visited.includes(node))[0];
    stack.push(node);

    if (node.links === undefined) {
      list_Components[id_component].push(node.id);
    } else {
      //continue while list of linked node is not emphty
      while (stack.length !== 0) {
        let firstNode: any = stack.shift();

        if (firstNode !== undefined) {
          for (let connectedNodes of firstNode!.links!) {
            stack.push(connectedNodes);
            component.add(connectedNodes.id);
          }
          visited.push(firstNode);
          stack = stack.filter((val) => !visited.includes(val));
        }
      }
    }
    list_Components.push(Array.from(component));
    debugLog(list_Components);
    id_component = id_component + 1;
  }

  return list_Components;
};

export const validateGraph = (nodes?: SimulationNode[]): boolean => {
  /*
  Reject polyply inputs that feaures nodes with from_itp property in multiple
  connect component molecule graph
 */
  if (nodes === undefined) return false;
  const components = extract_graph_component(nodes);
  if (components.length === 1) {
    debugLog("Single component");
    return true;
  }

  for (let node of nodes) {
    if (node.hasOwnProperty("from_itp")) {
      if (node.from_itp !== undefined) return false;
    }
  }

  return true;
};

export interface DynamicsParameters {
  alpha?: number;
  alphaMin?: number;
  velocityDecay?: number;
  stickyNodes?: SimulationNode[];
}

export interface SimulationViewerRefreshOpts {
  nodes?: SimulationNode[];
  links?: SimulationLink[];
  //zoom?:number
}

type StringStringsTree = { [key: string]: string[] };

const stringSetEqual = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && [...a].every((x) => b.has(x));

const StringStringsTreeEqual = (
  t1: StringStringsTree,
  t2: StringStringsTree,
) => {
  /*
  debugLog(new Set(Object.keys(t1)));
  debugLog(new Set(Object.keys(t2)));
  */
  if (!stringSetEqual(new Set(Object.keys(t1)), new Set(Object.keys(t2))))
    return false;
  for (const k in t1)
    if (!stringSetEqual(new Set(t1[k]), new Set(t2[k]))) return false;

  return true;
};

export const tupleTwoStringsArrayEqual = (
  a1: [string, string][],
  a2: [string, string][],
): boolean => {
  if (a1.length !== a2.length) return false;

  const twoStringArrReducer = (acc: StringStringsTree, _: [string, string]) => {
    const [e1, e2] = _;

    const x: [string, string] = e1 > e2 ? [e1, e2] : [e2, e1];

    if (!(x[0] in acc)) acc[x[0]] = [];
    acc[x[0]].push(x[1]);

    return acc;
  };

  const d1 = a1.reduce(twoStringArrReducer, {} as StringStringsTree);
  const d2 = a2.reduce(twoStringArrReducer, {} as StringStringsTree);
  /*
  debugLog(d1);
  debugLog(d2);
 */
  return StringStringsTreeEqual(d1, d2);
};

export const SimulationNodesArrayEqual = (
  a1: SimulationNode[],
  a2: SimulationNode[],
) => {
  //debugLog("SimulationNodesArrayEqual call");
  if (a1.length !== a2.length) return false;
  return stringSetEqual(
    new Set(a1.map((d) => d.id)),
    new Set(a2.map((d) => d.id)),
  );
};

export const SimulationLinksArrayEqual = (
  a1: SimulationLink[],
  a2: SimulationLink[],
) => {
  //debugLog("SimulationLinksArrayEqual call");
  if (a1.length !== a2.length) return false;

  const simLinkArrReducer = (acc: StringStringsTree, l: SimulationLink) => {
    const [e1, e2] = [l.source.id, l.target.id];

    const x: [string, string] = e1 > e2 ? [e1, e2] : [e2, e1];

    if (!(x[0] in acc)) acc[x[0]] = [];
    acc[x[0]].push(x[1]);

    return acc;
  };

  const d1: StringStringsTree = a1.reduce(
    simLinkArrReducer,
    {} as StringStringsTree,
  );
  const d2: StringStringsTree = a2.reduce(
    simLinkArrReducer,
    {} as StringStringsTree,
  );

  return StringStringsTreeEqual(d1, d2);
};
