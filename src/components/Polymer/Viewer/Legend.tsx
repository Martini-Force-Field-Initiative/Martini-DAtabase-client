import { useState, useEffect } from "react";

import ExpandCircleDownRoundedIcon from "@mui/icons-material/ExpandCircleDownRounded";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import * as d3 from "d3";
import { generateBlurShape } from "./customShape";
import { Typography } from "@mui/material";
import "./Legend.css";
import newLegend from "./new_legend.json";
interface LegendProps {}

export function Legend(props: LegendProps) {
  const [isToggled, doToggle] = useState(false);

  const legendTopMargin = 20;
  const legendBotMargin = 10;
  const legendItemH = 25;
  const legendItemSpacing = 10;
  let svg: undefined | d3.Selection<SVGSVGElement, unknown, HTMLElement, any> =
    undefined;
  useEffect(() => {
    if (svg !== undefined) return;
    const itemNames = Object.keys(newLegend.symbols);
    const root = d3.select(".svg-wrapper .svg-root");
    if (root.empty()) return;
    console.error("Drawing SVG Legend");

    svg = root
      .append("svg")
      .attr("viewBox", [0, 50, 175, 50])
      .attr("width", 150)
      .attr(
        "height",
        legendTopMargin +
          (itemNames.length - 1) * (legendItemH + legendItemSpacing) +
          legendBotMargin,
      );
    console.error(newLegend.symbols);
    //svg.append('circle').attr('fill','yellow').attr('r', 5).attr('cx', 25).attr('cy', 25);
    svg
      .selectAll("g.legend-item")
      .data(newLegend.symbols)
      .join((enter) => {
        let sel = enter
          .append("g")
          .attr("class", "legend-item")
          .attr(
            "transform",
            (d, i) =>
              `translate(0, ${legendTopMargin + i * (legendItemH + legendItemSpacing)})`,
          );
        sel
          .append("text")
          .attr("x", 0)
          .attr("y", 0)
          .text((d) => d.category);

        sel
          .append("g")
          .attr("transform", "translate(125, -5)")
          .append("path")
          .attr("d", (d: any) => {
            console.log("Generating legend path");
            return d.symbol === "blurShape"
              ? generateBlurShape(125)
              : //@ts-ignore
                d3.symbol().type(d3[d.symbol]).size(250)(); //(d.symbol) as string
          })
          .attr("stroke", "gray")
          .attr("stroke-width", "2px")
          .attr("fill-opacity", "0");
        //attr('x', 100).attr('y', 0).text( (d)=>d.category );
        return sel;
      });
  }, [isToggled]);

  return (
    <div className="viewer-legend" /*onClick={ (e)=>e.preventDefault()}*/>
      {!isToggled ? (
        <>
          {" "}
          <ExpandCircleDownRoundedIcon
            style={{ fontSize: "3rem", cursor: "pointer" }}
            onClick={() => doToggle(!isToggled)}
          />{" "}
        </>
      ) : (
        <>
          <Box sx={{ width: "100%" }}>
            <Stack
              className={`svg-wrapper ${isToggled ? "expanded" : "reduced"}`}
              spacing={1}
            >
              <div className="svg-root"></div>
              <div
                style={{
                  paddingRight: "0.5rem",
                  paddingBottom: "0.25rem",
                  margin: " 0 0 0 0",
                  maxWidth: "50%",
                }}
              >
                <Typography
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    cursor: "pointer",
                  }}
                  onClick={() => doToggle(!isToggled)}
                >
                  <u>Close</u>
                  {/*<HighlightOffIcon/>             */}
                </Typography>
              </div>
            </Stack>
          </Box>
        </>
      )}
    </div>
  );
}
