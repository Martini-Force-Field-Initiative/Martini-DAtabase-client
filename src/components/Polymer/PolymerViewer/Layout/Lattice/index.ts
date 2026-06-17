import { SimulationNode, SimulationLink } from "../../../SimulationType";
import { debugDir, debugLog } from "../../../../../logger";
import * as d3 from "d3";
interface GridPosition {
  node: SimulationNode;
  col: number;
  row: number;
  x: number;
  y: number;
}

interface LatticeLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  orientation: "h" | "v";
}

interface GridLayoutResult {
  positions: Map<string, GridPosition>; // keyed by node.id
  cols: number;
  latticeLines: LatticeLine[];
  rows: number;
  spacingX: number;
  spacingY: number;
}

// Above deprecated for now

export interface LatticeSpecs {
  grid: LatticePoint[];
  spacing: number;
  padding: number;
}

interface LatticePoint {
  x: number;
  y: number;
}

export class Lattice {
  _h = 100;
  _w = 100;
  _spacing = 50;
  _zoom = 1;
  padding = 100;
  show = false;
  private state?: LatticeSpecs;
  constructor() {}
  set height(_: number) {
    this._h = _;
  }
  set width(_: number) {
    this._w = _;
  }
  set zoom(_: number) {
    this._zoom = _;
  }

  set step(_: number) {
    if (_ > 1.0) this._spacing = _;
    else console.error("Negative Lattice step value");
  }

  render(): LatticeSpecs {
    const grid = this.compute();
    debugLog("Lattice::render following grid");
    debugLog(grid);
    this.state = { grid, spacing: this._spacing, padding: this.padding };
    return this.state;
  }

  closest(x: number, y: number): { index: number; x: number; y: number } {
    /* Given a x, y coordinate (zoom transformed) of a SimulationNode
    return the index of the closest element in the grid array along
    with that element's x, y coordinates, using spacing and offset.
    */
    const minX = this.padding;
    const maxX = this._w - this.padding;
    const minY = this.padding;
    const maxY = this._h - this.padding;

    // Number of points per axis must match compute()'s `<= max` bounds.
    const cols = Math.floor((maxX - minX) / this._spacing) + 1;
    const rows = Math.floor((maxY - minY) / this._spacing) + 1;
    if (cols <= 0 || rows <= 0) return { index: -1, x: NaN, y: NaN };

    const clamp = (v: number, hi: number) => Math.max(0, Math.min(hi, v));
    const col = clamp(Math.round((x - minX) / this._spacing), cols - 1);
    const row = clamp(Math.round((y - minY) / this._spacing), rows - 1);

    return {
      index: row * cols + col,
      x: minX + col * this._spacing,
      y: minY + row * this._spacing,
    };
  }
  compute(): LatticePoint[] {
    const minX = this.padding;
    const maxX = this._w - this.padding;
    const minY = this.padding;
    const maxY = this._h - this.padding;

    const points: LatticePoint[] = [];
    for (let y = minY; y <= maxY; y += this._spacing)
      for (let x = minX; x <= maxX; x += this._spacing) points.push({ x, y });

    return points;
  }
}

export function forceLattice(
  svg: SVGSVGElement,
  simulation: d3.Simulation<SimulationNode, SimulationLink>,
  padding = 40,
): void {
  const { positions, latticeLines, cols, rows, spacingX, spacingY } =
    computeGridIndicesSVG(svg, simulation.nodes(), padding);

  simulation
    .force(
      "x",
      d3.forceX<SimulationNode>((d) => positions.get(d.id)!.x).strength(0.3),
    )
    .force(
      "y",
      d3.forceY<SimulationNode>((d) => positions.get(d.id)!.y).strength(0.3),
    );
  debugLog("Applied Lattice force constraints to simulation");
}

function computeGridIndicesSVG(
  svg: SVGSVGElement,
  simulationNodes: SimulationNode[],
  padding = 40,
): GridLayoutResult {
  const nodes = simulationNodes;
  const n = nodes.length;

  const height: number = svg.height.animVal.value;
  const width: number = svg.width.animVal.value;
  if (n === 0) {
    return {
      positions: new Map(),
      latticeLines: [],
      cols: 0,
      rows: 0,
      spacingX: 0,
      spacingY: 0,
    };
  }

  // Build adjacency from each node's `links` array.
  const adjacency = new Map<string, Set<string>>();
  nodes.forEach((nd) => adjacency.set(nd.id, new Set()));

  nodes.forEach((nd) => {
    nd.links?.forEach((other) => {
      if (adjacency.has(other.id)) {
        adjacency.get(nd.id)!.add(other.id);
        adjacency.get(other.id)!.add(nd.id);
      }
    });
  });

  // Assign (col,row) via BFS, level-by-level.
  const colOf = new Map<string, number>();
  const rowOf = new Map<string, number>();
  const visited = new Set<string>();

  let maxCol = 0;
  let currentRow = 0;

  const startOrder = [...nodes].sort(
    (a, b) => adjacency.get(b.id)!.size - adjacency.get(a.id)!.size,
  );

  for (const start of startOrder) {
    if (visited.has(start.id)) continue;

    let frontier = [start.id];
    visited.add(start.id);

    while (frontier.length > 0) {
      frontier.forEach((id, i) => {
        colOf.set(id, i);
        rowOf.set(id, currentRow);
      });
      maxCol = Math.max(maxCol, frontier.length - 1);

      const next: string[] = [];
      for (const id of frontier) {
        const neighbors = [...adjacency.get(id)!].sort();
        for (const nb of neighbors) {
          if (!visited.has(nb)) {
            visited.add(nb);
            next.push(nb);
          }
        }
      }
      frontier = next;
      currentRow++;
    }
  }

  const cols = maxCol + 1;
  const rows = currentRow;

  // Map (col,row) -> SVG coordinates, centering each row's content.
  const usableW = Math.max(1, width - 2 * padding);
  const usableH = Math.max(1, height - 2 * padding);
  const spacingX = cols > 1 ? usableW / (cols - 1) : 0;
  const spacingY = rows > 1 ? usableH / (rows - 1) : 0;

  const rowCounts = new Map<number, number>();
  rowOf.forEach((r) => rowCounts.set(r, (rowCounts.get(r) ?? 0) + 1));

  const positions = new Map<string, GridPosition>();
  const grid: (string | undefined)[][] = Array.from({ length: rows }, () =>
    new Array<string | undefined>(cols).fill(undefined),
  );

  // index nodes by id so we can attach the node object to each GridPosition
  const byId = new Map(nodes.map((nd) => [nd.id, nd]));

  for (const nd of nodes) {
    const col = colOf.get(nd.id) ?? 0;
    const row = rowOf.get(nd.id) ?? 0;
    const count = rowCounts.get(row) ?? 1;
    const rowOffset = ((cols - count) / 2) * spacingX;

    const x = cols > 1 ? padding + rowOffset + col * spacingX : width / 2;
    const y = rows > 1 ? padding + row * spacingY : height / 2;

    positions.set(nd.id, { node: nd, col, row, x, y });
    grid[row][col] = nd.id;
  }

  // Build lattice line segments between grid-adjacent occupied cells.
  const latticeLines: LatticeLine[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = grid[r][c];
      if (!id) continue;
      const p = positions.get(id);
      if (!p) continue;

      const rightId = c + 1 < cols ? grid[r][c + 1] : undefined;
      if (rightId) {
        const q = positions.get(rightId);
        if (q)
          latticeLines.push({
            x1: p.x,
            y1: p.y,
            x2: q.x,
            y2: q.y,
            orientation: "h",
          });
      }

      const downId = r + 1 < rows ? grid[r + 1][c] : undefined;
      if (downId) {
        const q = positions.get(downId);
        if (q)
          latticeLines.push({
            x1: p.x,
            y1: p.y,
            x2: q.x,
            y2: q.y,
            orientation: "v",
          });
      }
    }
  }

  return { positions, latticeLines, cols, rows, spacingX, spacingY };
}
