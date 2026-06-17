import { debugLog, debugDir } from "../../../logger";
import {
  SimulationNode,
  SimulationLink,
  SimulationGroup,
  LayoutSpec,
  linkLineSelector,
  DynamicsParameters,
  SimulationViewerRefreshOpts,
  anyNodeSelector,
  NodeSelector,
  backgroundSelector,
} from "../SimulationType";
import { areNodesLinked, getConnex } from "./utils";
import * as d3 from "d3";
import { simpleNodeSelector } from "../SimulationType";
import GraphicalNodeGenerator from "./GraphicalNodeGenerator";

import { EventEmitter } from "./EventEmitter";
import { Lattice, LatticeSpecs } from "./Layout/Lattice";
//import { computeGridIndicesSVG } from "./Layout/Lattice";
export type EdgeHighlightStyle = "alarm" | "corrected";
//@ts-ignore

type dragEvent = d3.D3DragEvent<any, SimulationNode, any>;

type SimulationViewerEventName = "svDrag" | "svDragend" | "errorLineClick";
export class SimulationViewer extends EventEmitter<SimulationViewerEventName> {
  svg: SVGSVGElement;
  _nodeSize: number = 5;
  height: number;
  width: number;
  private lattice: Lattice;
  groupsData: SimulationGroup[] = [];
  // Bookkeeping: datum -> its SVG element. Keyed by the stable `_frozen_id_`
  // stamped at creation by makeNode(), so keys survive the id renumbering done
  // in removeNodes(). Node keys are `${node._frozen_id_}`; link keys are
  // `${source._frozen_id_}:${target._frozen_id_}`.
  private svgElemByDatumId = new Map<string, SVGSVGElement>();
  // Drop a link's g.lines element from the bookkeeping map. Mirrors the key
  // used when the element was created in links().
  private forgetLink = (d: SimulationLink): void => {
    this.svgElemByDatumId.delete(
      `${d.source._frozen_id_}:${d.target._frozen_id_}`,
    );
  };
  private svgElemFromSimLink(s: SimulationLink): SVGSVGElement | undefined {
    return this.svgElemByDatumId.get(
      `${s.source._frozen_id_}:${s.target._frozen_id_}`,
    );
  }

  // Guess it is simpler to bind simulation Engine here
  constructor(svg: SVGSVGElement, lattice: Lattice) {
    super();
    this.svg = svg;
    this.lattice = lattice;
    this.height = svg.height.animVal.value;
    this.width = svg.width.animVal.value;
    GraphicalNodeGenerator.setDefinitionsSVG(svg);
  }
  select(sel: string) {
    return d3
      .select(this.svg)
      .selectAll<SVGGElement, SimulationNode | SimulationLink>(sel);
  }
  updateSVG(opt: SimulationViewerRefreshOpts) {
    /* don't know if it s needed
     */
    debugLog("Update SVG");
    debugLog(opt);
  }

  set nodeSize(s: number) {
    this._nodeSize = s;
  }
  get svgViewSyncer(): () => void {
    const svg = this.svg;

    return () => {
      debugLog(
        `Nb node to animate ${d3.select(this.svg).selectAll<SVGGElement, SimulationNode>(simpleNodeSelector).size()}`,
      );
      d3.select(svg)
        .selectAll<SVGSVGElement, SimulationLink>(linkLineSelector)
        .each(function (d: SimulationLink) {
          d3.select(this)
            .selectAll("line")
            .attr("x1", () => d.source.x as number)
            .attr("y1", (_: any) => d.source.y as number)
            .attr("x2", (_: any) => d.target.x as number)
            .attr("y2", (_: any) => d.target.y as number);
        });
      d3.select(svg)
        .selectAll<SVGGElement, SimulationNode>(simpleNodeSelector)
        .attr("transform", function (d) {
          return (
            `translate(${d.x},${d.y})` + ` scale(${this.getAttribute("zoom")})`
          );
        });
    };
  }
  zoom(v: number) {
    debugLog("SimulationViewer:zoom: " + v);
    debugLog(`${this.svg}`);
    d3.select(this.svg)
      .selectAll<SVGGElement, SimulationNode>("g.nodes")
      .attr("zoom", v)
      .attr("transform", function () {
        const trStyle = this.getAttribute("transform") + ` scale(${v})`;
        debugLog(trStyle);
        return trStyle;
      });
  }
  links(newLink: SimulationLink[]): void {
    debugLog("SimulationViewer.links() inputs");
    debugDir(newLink);
    debugLog("nodeSize:" + this._nodeSize);
    const self = this;
    /*
    const link = d3
      .select(this.svg)
      .selectAll(linkLineSelector)
      .data(newLink, (d: any) => d.source.id + "-" + d.target.id)
      .enter();
      */
    const gLines = d3
      .select(this.svg)
      .selectAll<SVGSVGElement, SimulationLink>(linkLineSelector)
      .data(newLink, (d: SimulationLink) => d.source.id + "-" + d.target.id)
      .enter()
      .append("g")
      .classed("lines", true)
      .attr("source", function (d: any) {
        return d.source.id;
      })
      .attr("target", function (d: any) {
        return d.target.id;
      })
      .each(function (d: SimulationLink) {
        // Bookkeep the g.lines element so we can go from a link datum to its
        // SVG element, keyed by the endpoints' frozen ids (stable across the
        // id renumbering in removeNodes; mirrors the node map).
        self.svgElemByDatumId.set(
          `${d.source._frozen_id_}:${d.target._frozen_id_}`,
          this as SVGSVGElement,
        );
      })
      .on("click", (event, d) => {
        debugLog("click on g.lines");
      })
      .lower();

    // visible line
    gLines
      .append("line")
      .classed("concrete", true)
      .attr("stroke-width", this._nodeSize / 20)
      .attr("pointer-events", "none"); // let clicks fall through to the fat one

    // invisible hit target
    gLines
      .append("line")
      .classed("ghost", true) // class -> CSS gives it a transparent (paintable,
      // hence hit-testable) stroke; an unclassed line defaults to stroke:none
      // and would receive no pointer events at all.
      .attr("stroke-width", this._nodeSize / 10); // generous click zone

    /*
    link
      .append("line")
      .attr("class", "links")
      .attr("stroke", "gray")
      .attr("stroke-width", this._nodeSize / 20)
      .attr("opacity", 0.5)
      .attr("stroke-linecap", "round")
      .attr("source", function (d: any) {
        return d.source.id;
      })
      .attr("target", function (d: any) {
        return d.target.id;
      })
      .lower();
    */
    debugLog("SimulationViewer.links() link count " + gLines.size());
    //d3.select(this.svg).selectAll(anyNodeSelector).raise();
  }
  link(n1: SimulationNode, n2: SimulationNode) {
    if (areNodesLinked(n1, n2)) return;

    const newlink = { source: n1, target: n2 };
    n1.links = n1.links ? [...n1.links, n2] : [n2];
    n2.links = n2.links ? [...n2.links, n1] : [n1];

    this.links([newlink]);
  }
  nodes(newnodes: SimulationNode[], zoomValue: number) {
    debugLog("SimulaitonViewer:nodes(), new nodes input are:");
    debugLog(newnodes);
    if (newnodes.length === 0) return;
    //debugLog(GraphicalNodeGenerator);
    let tooltipElem: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
    // Define the div for the tooltip
    if (document.getElementsByClassName("tooltip").length === 0) {
      tooltipElem = d3.select("body").append("div").attr("class", "tooltip");
    } else {
      tooltipElem = d3.select("body").select("div.tooltip");
    }

    const self = this;
    d3.select(this.svg)
      .selectAll(anyNodeSelector)
      .data(newnodes, (d: any) => {
        //@ts-ignore
        return d.id;
      })
      .join(
        (e) => GraphicalNodeGenerator.draw(e),
        (update) => update,
        (exit) => {
          // B/C custom enter callback is defined we
          // need to disable operation on exit
        },
      )
      .attr("transform", `translate(${this.width / 4}, ${this.height / 4})`)
      .attr("zoom", zoomValue)
      // Below may be functionaly redundant w/ svgElemByDatumId Map
      // ie to go ferom a datum to its svg element
      // We may delete this if not needed
      .attr("id", function (d: SimulationNode) {
        return d.id;
      })
      .each(function (d) {
        self.svgElemByDatumId.set(`${d._frozen_id_}`, this as SVGSVGElement);
      })
      .call(
        d3
          .drag<any, SimulationNode>()
          .on("drag", function (event: dragEvent, d: SimulationNode) {
            debugLog("node being dragged");

            if (event.sourceEvent.shiftKey) {
              debugLog("Shift key is pressed/ skipping dragged!");
              return;
            }

            //debugLog(d3.select(Mysvg).attr("height"), d3.select(Mysvg).attr("width"))
            const heightSVG = d3.select(self.svg).attr("height");
            const widthSVG = d3.select(self.svg).attr("width");

            const clamp = (x: number, lo: number, hi: number) => {
              return x < lo ? lo : x > hi ? hi : x;
            };
            // secret trick

            d.fx = clamp(event.x, 0, parseInt(widthSVG));
            d.fy = clamp(event.y, 0, parseInt(heightSVG));

            // Forward the dragged node so the owner can resolve overlaps with
            // anchored nodes (see PolymerViewer svDrag handler).
            self.emit("svDrag", [d]);
          }) //drag.drag event
          .on("end", function (event: dragEvent, d: SimulationNode) {
            if (event.sourceEvent.shiftKey) {
              debugLog("Shift key is pressed skipping dragended!");
              return;
            }

            self.emit("svDragend", [d]);
          }), //drag.end event
      ) // call bind
      .on("mouseover", function (event: any, d: SimulationNode) {
        tooltipElem.transition().duration(20).style("opacity", 1);

        tooltipElem
          // d.id is 0-based; display the 1-based residue number so it matches
          // FixLink's "Residue#" (ITP resnum / polyply idres, both 1-based).
          .html(d.resname + " #" + (Number(d.id) + 1))
          .style("left", event.clientX + "px")
          .style("top", event.clientY + 20 + "px");
      })
      .on("mouseout", function (d) {
        tooltipElem.transition().duration(500).style("opacity", 0);
      })
      .on("click", function (e: any, d: SimulationNode) {
        if (e.ctrlKey) {
          const _ = d3.select(this).attr("class");
          d3.select(this).attr("class", `${_} onfocus`);
        } else debugLog(d);
      })
      .on("dblclick", function (e: any, d: SimulationNode) {
        e.stopPropagation();
        debugLog("SimulationViewer:nodes(), dblclick on node " + d.id);
        const connex = getConnex(d);
        debugLog(connex);
        self.nodeHighlight({ simulationNodes: connex });
      });

    debugLog(
      "SimulationViewer:nodes(), Total g.nodes " +
        d3.select(this.svg).selectAll(anyNodeSelector).size(),
    );
  }

  //ppbly change name
  updatePolymerPath() {
    debugLog("updatePolymerPath: CURRETNLY DISABLED (HULL off)");
    return;
    //debugLog( "update polymer group path ", listOfGroups)
    this.groupsData.forEach((group) => {
      let coords: [number, number][] = [];
      group.nodes!.map((d: SimulationNode) => coords.push([d.x!, d.y!]));
      let hull = d3.polygonHull(coords);
      d3.select(this.svg)
        .selectAll(simpleNodeSelector)
        .filter(function () {
          return d3.select(this).attr("group") === group.id.toString(); // filter by single attribute
        })
        .data([hull])
        .attr("d", (d) => "M" + d!.join("L") + "Z");
    });
  }

  removeLinksBySelector(sel: string) {
    d3.select(this.svg)
      .selectAll<SVGLineElement, SimulationLink>(sel)
      .each((d: SimulationLink) => {
        this.forgetLink(d);
        d.source.links = d.source.links!.filter(
          (nodeToRM: SimulationNode) => nodeToRM.id !== d.target.id,
        );
        d.target.links = d.target.links!.filter(
          (nodeToRM: SimulationNode) => nodeToRM.id !== d.source.id,
        );
      })
      .remove();
  }

  removeLinks(links: [SimulationNode, SimulationNode][]) {
    d3.select(this.svg)
      .selectAll(linkLineSelector)
      .filter((link: any) => {
        for (let ns of links) {
          if (
            (link.source.id === ns[0].id && link.target.id === ns[1].id) ||
            (link.source.id === ns[1].id && link.target.id === ns[0].id)
          )
            return true;
        }
        return false;
      })
      .each((d: any) => this.forgetLink(d))
      .remove();

    links.forEach((ns) => {
      const [n1, n2] = ns;
      n1.links = n1.links!.filter(
        (nodeToRM: SimulationNode) => nodeToRM.id !== n2.id,
      );
      n2.links = n2.links!.filter(
        (nodeToRM: SimulationNode) => nodeToRM.id !== n1.id,
      );
    });
  }
  linkIsHighlighted(l: SimulationLink, type: EdgeHighlightStyle) {
    const elem = this.svgElemFromSimLink(l);
    return d3.select(elem!).classed(type === "alarm" ? "error" : "corrected"); // type matches classnames alarm|corrected
  }
  removeNodes(
    nodesToRemove: SimulationNode[],
    /*   updateFunction: () => void,
    decreaseIDFunction: () => void,
    */
  ) {
    debugLog("remove : ", nodesToRemove.length, "nodes");

    //remove link in object node
    for (let nodeToRemove of nodesToRemove) {
      debugLog(">>Current node to remove is:");
      debugLog(nodeToRemove);
      this.svgElemByDatumId.delete(`${nodeToRemove._frozen_id_}`);
      if (nodeToRemove.links !== undefined) {
        for (let linkednode of nodeToRemove.links) {
          //remove link between node and removed node
          linkednode.links = linkednode.links!.filter(
            (nodeToRM: SimulationNode) => nodeToRM.id !== nodeToRemove.id,
          );
        }
      }

      d3.select(this.svg)
        .selectAll<SVGGElement, SimulationNode>(simpleNodeSelector)
        .filter((d: SimulationNode) => {
          debugLog("Looking for ");
          debugLog(`${d.id} === ${nodeToRemove.id}`);
          return d.id === nodeToRemove.id;
        })
        .remove();
      //and then remove link inside svg
      d3.select(this.svg)
        .selectAll(linkLineSelector)
        .filter(
          (link: any) =>
            link.source.id === nodeToRemove.id ||
            link.target.id === nodeToRemove.id,
        )
        .each((d: any) => this.forgetLink(d))
        .remove();

      //Update new ID to fit with polyply
      d3.select(this.svg)
        .selectAll<SVGGElement, SimulationNode>(simpleNodeSelector)
        .filter((d: SimulationNode) => Number(d.id) > Number(nodeToRemove.id))
        .each((d) => {
          //Compute new ID
          let newID: number = parseInt(d.id) - 1;
          //d.index = newID
          d.id = newID.toString();
          d.index = newID;
        });
      //Check if minimun id !== de currentID
      //Mettre une condition d'arret pour ne pas decrease
    }

    //updateFunction();
  }

  edgeHighlight(edges: [string, string][], type: EdgeHighlightStyle) {
    debugLog(`SimulationViewer:edgeHighlight '${type}'`); //<<< RESUME HERE
    d3.select(this.svg) // Could selct through svgElemByDatumId also
      .selectAll<SVGElement, SimulationLink>(linkLineSelector)
      .filter((d: SimulationLink) => {
        for (let nodes of edges) {
          debugLog("SimulationViewer::edgeHihlight Lookup");
          debugLog(`${d.source.id} ${d.target.id} ${nodes[0]} ${nodes[1]}`);
          if (
            (d.source.id === nodes[0] && d.target.id === nodes[1]) ||
            (d.target.id === nodes[0] && d.source.id === nodes[1])
          ) {
            debugLog("SimulationViewer::edgeHihlight Lookup:: MATCH");
            return true;
          }
        }
        return false;
      })
      .classed(type === "alarm" ? "error" : "corrected", true)
      .classed(type === "alarm" ? "corrected" : "error", false)
      .on("click", (e: any, l: SimulationLink) => {
        // We prefer the contextual menu
        /*   if (type === "alarm") this.emit("errorLineClick", l);
        debugLog("Lookup Edge", l);
        */
      });
    /*
      .selectAll(".concrete")
      .attr("stroke", type === "corrected" ? "#32CD32" : "red")
      .attr("class", type === "alarm" ? "error" : "good");
      */
  }
  // Non-destructive reset of edge highlighting: strip the error/corrected
  // classes from every g.lines (restores the neutral style) without removing
  // the edges themselves (unlike removeLinksBySelector).
  clearEdgeHighlights() {
    d3.select(this.svg)
      .selectAll(linkLineSelector)
      .classed("error", false)
      .classed("corrected", false);
  }
  edgeFlash() {
    //TO DO on corrected link
  }
  nodeFlash(opts: NodeSelector) {
    if ("resname" in opts) {
      d3.select(this.svg)
        .selectAll<SVGGElement, SimulationNode>(anyNodeSelector)
        .filter((d: SimulationNode) => d.resname === opts.resname)
        // additive: leaves onfocus/anchored/highlight intact
        .classed("flash", true)
        // remove on animation end so it can be re-triggered later
        .on("animationend", function () {
          const g = (this as Element).closest("g.nodes");
          if (g) d3.select(g).classed("flash", false);
        });

      return;
    }

    console.error(
      "SimulationViewer.nodeFlash only implmented for 'resname' selector",
    );
  }
  nodeHighlight(opts: NodeSelector) {
    // Clear only the transient selection class. Overwriting the whole class
    // string here would also drop `.anchored`, which must persist until an
    // explicit toggleAnchorSelection(sel, revert=true) call removes it.
    d3.select(this.svg)
      .selectAll("g.nodes:not(.group_path)") //.selectAll("path:not(.group_path)")
      .classed("onfocus", false);

    if ("brushZone" in opts) {
      const sel = opts["brushZone"] as [[number, number], [number, number]];
      //select all node inside brush zone
      d3.select(this.svg)
        .selectAll("g.nodes:not(.group_path)")
        //.selectAll("path:not(.group_path)")
        .filter(
          (d: any) =>
            d.x < sel[1][0] &&
            d.x > sel[0][0] &&
            d.y < sel[1][1] &&
            d.y > sel[0][1],
        )
        .attr("class", function (d) {
          // add on focus to class list of g.nodes
          return `${d3.select(this).attr("class")} onfocus`;
        });
    }
    const selSimulationNodes: SimulationNode[] = opts?.simulationNodes ?? [];
    if (selSimulationNodes.length === 0) return;

    d3.select(this.svg)
      .selectAll<SVGGElement, SimulationNode>("g.nodes:not(.group_path)")
      .filter((d) => {
        for (const selDatum of selSimulationNodes)
          if (selDatum.id === d.id) return true;
        return false;
      })
      .attr("class", function (d) {
        // add on focus to class list of g.nodes
        return `${d3.select(this).attr("class")} onfocus`;
      });
  }

  nodePin(toPin: [[number, number], SimulationNode][]) {
    debugLog("SimulationViewer::nodePin");
    debugDir(toPin);

    toPin.forEach((_) => {
      const [coord, d] = _;
      /*  // if pining was to be zoom aware
      .attr("transform", function (d) {
        return (
          `translate(${d.x},${d.y})` + ` scale(${this.getAttribute("zoom")})`
          );*/
      d.x = coord[0];
      d.y = coord[1];
      d.manually_anchored = true;
      const el = this.svgElemByDatumId.get(`${d._frozen_id_}`) as SVGSVGElement;
      d3.select(el).classed("anchored", true);
    });
  }

  background(opts: LatticeSpecs, show = true) {
    debugLog("SimulationViewer::background");
    debugLog(opts);

    if (!show) {
      d3.select(this.svg).select(backgroundSelector).remove();
      return;
    }

    let background: any = d3.select(this.svg).select(backgroundSelector);
    debugDir(background.size());
    if (background.empty())
      background = d3.select(this.svg).append("g").attr("class", "background");

    debugDir(background.size());
    debugDir(opts.grid);
    background
      .lower()
      .selectAll("circle")
      .data(opts.grid)
      .join("circle")
      .attr("cx", (d: any) => d.x)
      .attr("cy", (d: any) => d.y);
  }

  nuke() {
    d3.select(this.svg).selectAll(anyNodeSelector).remove();
    d3.select(this.svg).selectAll(linkLineSelector).remove();
    // Full teardown: drop every node and link entry in one shot.
    this.svgElemByDatumId.clear();
  }
}
