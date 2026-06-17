import { debugLog, debugDir } from "src/logger";
import { SimulationNode } from "../SimulationType";

export const areNodesLinked = (
  node1: SimulationNode,
  node2: SimulationNode,
): boolean => {
  if (node1.links === undefined || node2.links === undefined) return false;
  for (let n of node1.links) {
    if (n === node2) return true;
  }
  for (let n of node2.links) {
    if (n === node1) return true;
  }
  return false;
};

export const getConnex = (...nodes: SimulationNode[]): SimulationNode[] => {
  debugLog("getConnex::input is ");
  debugDir(nodes);

  const connexSet = new CustomSet<SimulationNode>((e) => `${e.id}`);
  nodes.forEach((d) => connexSet.add(d));

  const drill = (new_src: SimulationNode) => {
    new_src.links?.forEach((new_tgt) => {
      if (connexSet.has(new_tgt)) return;
      connexSet.add(new_tgt);
      drill(new_tgt);
    });
  };

  nodes.forEach(drill);

  const _ = connexSet.list();
  debugLog("getConnex::output is ");
  debugDir(_);
  return _;
};

export class CustomSet<T> {
  private map = new Map<string, T>();

  constructor(private keyFn: (item: T) => string) {}

  add(item: T): this {
    this.map.set(this.keyFn(item), item);
    return this;
  }

  has(item: T): boolean {
    return this.map.has(this.keyFn(item));
  }

  delete(item: T): boolean {
    return this.map.delete(this.keyFn(item));
  }

  get size() {
    return this.map.size;
  }
  list() {
    return Array.from(this.map.values());
  }
  [Symbol.iterator]() {
    return this.map.values();
  }
}
