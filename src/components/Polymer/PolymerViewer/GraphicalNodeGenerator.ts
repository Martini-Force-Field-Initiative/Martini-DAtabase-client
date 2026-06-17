import { debugDir, debugLog } from "../../../logger";
import * as d3 from "d3";
import { SimulationNode } from "../SimulationType";
import { getRandomInt } from "../../../helpers";

import { generateBlurShape } from "./customShape";
import staticLegendRules from "./new_legend.json";

class GraphicalNodeGenerator {
  private static basePalette = [
    // From https://colorkit.co/palette/ "FlatUI"
    "#1abc9c",
    "#16a085",
    "#2ecc71",
    "#27ae60",
    "#3498db",
    "#2980b9",
    "#9b59b6",
    "#8e44ad",
    // Commenting out as too dark to display blacktext
    //"#34495e",
    //"#2c3e50",
    "#f1c40f",
    "#f39c12",
    "#e67e22",
    "#d35400",
    "#e74c3c",
    "#c0392b",
    "#ecf0f1",
    "#bdc3c7",
    "#95a5a6",
    "#7f8c8d",
  ];
  public setDefinitionsSVG(svg: SVGElement) {
    /**
     * Decorate the SVG with color gradients definitions
     */
    const defs = d3.select(svg).append("defs");
    //Create a radial Sun-like gradient
    defs
      .append("radialGradient")
      .attr("id", "hydrophobic-gradient")
      .attr("cx", "50%") //not really needed, since 50% is the default
      .attr("cy", "50%") //not really needed, since 50% is the default
      .attr("r", "50%") //not really needed, since 50% is the default
      .selectAll("stop")
      .data([
        { offset: "0%", color: "#FFF76B" },
        { offset: "50%", color: "#FFF845" },
        { offset: "90%", color: "#FFDA4E" },
        { offset: "100%", color: "#FB8933" },
      ])
      .enter()
      .append("stop")
      .attr("offset", function (d) {
        return d.offset;
      })
      .attr("stop-color", function (d) {
        return d.color;
      });
    defs
      .append("radialGradient")
      .attr("id", "polar-gradient")
      .attr("cx", "50%") //not really needed, since 50% is the default
      .attr("cy", "50%") //not really needed, since 50% is the default
      .attr("r", "50%") //not really needed, since 50% is the default
      .selectAll("stop")
      .data([
        { offset: "0%", color: "#62CFF4" },
        // {offset: "50%", color: "#FFF845"},
        //{offset: "90%", color: "#FFDA4E"},
        { offset: "100%", color: "#2C67F2" },
      ])
      .enter()
      .append("stop")
      .attr("offset", function (d) {
        return d.offset;
      })
      .attr("stop-color", function (d) {
        return d.color;
      });
    defs
      .append("radialGradient")
      .attr("id", "charged-gradient")
      .attr("cx", "50%") //not really needed, since 50% is the default
      .attr("cy", "50%") //not really needed, since 50% is the default
      .attr("r", "50%") //not really needed, since 50% is the default
      .selectAll("stop")
      .data([
        { offset: "0%", color: "#ff512f" },
        // {offset: "50%", color: "#FFF845"},
        //{offset: "90%", color: "#FFDA4E"},
        { offset: "100%", color: "#dd2476" },
      ])
      .enter()
      .append("stop")
      .attr("offset", function (d) {
        return d.offset;
      })
      .attr("stop-color", function (d) {
        return d.color;
      });
  }
  private colorsInUse: { [k: string]: string } = {};
  private labelsInUse: { [k: string]: string };
  constructor() {
    this.labelsInUse = { ...GraphicalNodeGenerator.trTable };
  }
  private static trTable: { [k: string]: string } = {
    ALA: "A",
    CYS: "C",
    ASP: "D",
    GLU: "E",
    PHE: "F",
    GLY: "G",
    HIS: "H",
    ILE: "I",
    LYS: "K",
    LEU: "L",
    MET: "M",
    ASN: "N",
    PRO: "P",
    GLN: "Q",
    ARG: "R",
    SER: "S",
    THR: "T",
    VAL: "V",
    TRY: "W",
    TYR: "Y",
    TRP: "W",
    HIH: "H*",
  };
  private static hydrophobic = [
    "ALA",
    "CYS",
    "PHE",
    "ILE",
    "LEU",
    "MET",
    "PRO",
    "VAL",
    "TRY",
    "TRP",
  ];
  private static polar = ["HIS", "ASN", "GLN", "SER", "THR", "GLY", "TYR"];
  private static charged = ["ASP", "GLU", "LYS", "ARG", "HIH"];
  //const oneLetterCode = (name) => undefined;
  private aliasNodeLabel(name: string): string {
    /**
     * Convert molecule name into a one or Two letter code
     * Collisions is not handle yet
     * ie: Canard and Cane would collide into Ca
     */
    name = name.toUpperCase();
    if (name in this.labelsInUse) return this.labelsInUse[name];

    const label = name.split("").reduce((p, c, i) => {
      if (i == 0) return c;
      if (i == 1) return p + c.toLowerCase();
      return p;
    }, "");
    //debugLog("Generating custom node label " + label);

    return label;
  }

  public updateColor(color: string, resnames: string[]) {
    debugDir(this.colorsInUse);
    resnames.forEach((resname) => (this.colorsInUse[resname] = color));
  }

  private getColor(d: SimulationNode) {
    if (GraphicalNodeGenerator.hydrophobic.includes(d.resname))
      return "url(#hydrophobic-gradient)";
    if (GraphicalNodeGenerator.polar.includes(d.resname))
      return "url(#polar-gradient)";
    if (GraphicalNodeGenerator.charged.includes(d.resname))
      return "url(#charged-gradient)";
    if (d.resname in this.colorsInUse) return this.colorsInUse[d.resname];

    const newColor = this.pullAvailableColor();
    this.colorsInUse[d.resname] = newColor as string;
    return newColor;
  }

  draw(gEnterSel: any /* to type*/) {
    // ADD CATEGORY PROPERTY TO NODE DATA to guess shape <<
    const nodeSize = 1000;
    //console.warn("GraphicalNodeGenerator inputs:")
    //debugLog(gEnterSel)
    if (!gEnterSel) return;

    let gs = gEnterSel.append("g").attr("class", "nodes");

    gs.append("path")
      .attr("d", function (d: SimulationNode) {
        //debugLog("Generating path for ", d);
        //debugLog("Generating path for composite? ", d.is_composite);
        const p =
          d.is_composite || d?.category === "miscellaneous"
            ? generateBlurShape(nodeSize / 4)
            : d3
                .symbol()
                .type(GraphicalNodeGenerator.get_d3shape(d))
                .size(nodeSize)();
        //debugLog(p)
        return p;
      })
      // .attr('r', 15)
      // .style("fill", "url(#hydrophobic-gradient)")
      //.style("fill", "teal")
      .style("fill", (d: SimulationNode) => this.getColor(d))
      .attr("stroke", "teal");

    gs.append("text")
      .attr("dy", ".35em")
      .text((d: SimulationNode) => this.aliasNodeLabel(d.resname))
      .attr("text-anchor", "middle");
    return gs;
  }

  private pullAvailableColor() {
    // Not recognized in current esnext target library
    //const _ = (new Set(GraphicalNodeGenerator.basePalette)
    //    ).difference(new Set(Object.values(this.colorsInUse)));
    const inUseColrs = Object.values(this.colorsInUse);
    let availableColors = GraphicalNodeGenerator.basePalette.filter(
      (c) => !inUseColrs.includes(c),
    );

    if (availableColors.length === 0) {
      // Color are exhausted just pull random in base palette
      availableColors = GraphicalNodeGenerator.basePalette;
    }

    return availableColors[getRandomInt(0, availableColors.length)];
  }
  // Needs rework
  // Needs rework based on static symbol and molecule defs in json ?
  static get_d3shape(node: SimulationNode) {
    if (!node.category) return d3["symbolSquare"];

    for (const d of staticLegendRules.symbols) {
      if (d.category.toLowerCase() == node.category.toLowerCase())
        //@ts-ignore
        return d3[d.symbol] as d3.SymbolType;
    }
    return d3["symbolSquare"];
  }
}

export default new GraphicalNodeGenerator();
