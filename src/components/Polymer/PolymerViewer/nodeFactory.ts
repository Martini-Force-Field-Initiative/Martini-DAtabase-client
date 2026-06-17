import { SimulationNode } from "../SimulationType";

// Single creation point for SimulationNode.
//
// `_frozen_id_` is a monotonic, never-reset, never-reused stable identity. Unlike
// SimulationNode.id (which is renumbered on node removal to stay contiguous for
// polyply), the frozen id is stamped once here and never changes — it is what the
// viewer's bookkeeping map keys on. It is internal: JSON export projects through
// NodeView/LinkView and never includes it, so it never leaves the client.
//
// Routing every node through makeNode() guarantees both `_frozen_id_` and the
// default `manually_anchored: false` are always present, so a SimulationNode is
// well-formed by construction (the interface marks both as required, so any
// literal that bypasses the factory is a compile error).
let _frozenIdSeq = 0;

// Caller-supplied fields: everything except the two the factory owns.
export type NodeSpec = Omit<SimulationNode, "_frozen_id_" | "manually_anchored">;

export function makeNode(spec: NodeSpec): SimulationNode {
  return {
    ...spec,
    manually_anchored: false,
    _frozen_id_: _frozenIdSeq++,
  };
}
