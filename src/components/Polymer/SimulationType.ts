import { SimulationNodeDatum } from "d3";

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
    console.log(nodes.filter((node) => !visited.includes(node)));
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
    console.log(list_Components);
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
    console.log("Single component");
    return true;
  }

  for (let node of nodes) {
    if (node.hasOwnProperty("from_itp")) return false;
  }

  return true;
};
