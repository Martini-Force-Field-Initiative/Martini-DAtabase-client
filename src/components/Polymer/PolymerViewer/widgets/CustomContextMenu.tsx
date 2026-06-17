import { debugLog } from "../../../../logger";
import * as React from "react";
import { Menu, MenuItem, Divider } from "@material-ui/core";
import Typography from "@mui/material/Typography";
import * as d3 from "d3";
import {
  SimulationNode,
  SimulationLink,
  SimulationGroup,
  SimulationElementsD3_Sel,
  SimulationNodesD3_Sel,
  SimulationLinksD3_Sel,
} from "../../SimulationType";
import { DownloadJson, PolymerView } from "../../generateJson";
//import { addLinkToSVG, addNodeToSVG_as_Gs, removeNodes } from ".";
import CustomPolymerStash from "../../CustomPolymerStash";
import { ColorPicker } from "../../../SharedComponents/ColorPicker";
import WarningIcon from "@material-ui/icons/Warning";
import RouteIcon from "@mui/icons-material/Route";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import PushPinIcon from "@mui/icons-material/PushPin";
import HandymanIcon from "@mui/icons-material/Handyman";
import { BarredPushPinIcon } from "./CustomIcons";
import { getConnex } from "../utils";
interface props {
  x: number;
  y: number;
  selectedNodes: SimulationNodesD3_Sel;
  anchoredNodes: SimulationNodesD3_Sel;
  nodeClick?: SimulationNode;
  //hullClick: Element | undefined;
  lineClick?: SimulationLink;
  //polymerViewer: PolymerViewer;
  forcefield: string;
  handlePaste: (nodes: SimulationNode[]) => void;
  handleUpdate: () => void;
  //change_current_position_fixlink: (arg: any) => void;
  //svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  zoom: number;
  onColorPicker: (color: string, nodes: SimulationNodesD3_Sel) => void;
  onNuke: () => void;
  onFixClick: () => void;
  onDeleteErrorLink: () => void;
  onDeleteLinkClick: (arg0: SimulationLink) => void;
  onExpandHighlight: (arg0: SimulationNode) => void;
  onToggleAnchorSelection: (arg0: SimulationNodesD3_Sel, revert?: boolean) => void;
  onRemoveNodeLinksClick: (arg0: SimulationNode) => void;
  onRemoveNodes: (arg0: SimulationNode[]) => void;
  onRemoveNodeClick: (arg0: SimulationNode) => void;
  onPinNodesClick: (arg0: SimulationNodesD3_Sel) => void;
  onRemoveNodesLinks: (arg0: SimulationNode[]) => void;
  isErrorLink?: boolean;
  isCorrectedLink?: boolean;
  //errorLinks: SimulationLink[];
}

/*
SVG manipulation should be move away
*/
export default class CustomContextMenu extends React.Component<props> {
  /*   check_if_error_link(link: SimulationLink) {
    let boo = false;
    this.props.svg
      .selectAll<SVGPathElement, SimulationLink>("line.error")
      .each((l: SimulationLink) => {
        if (l === link) {
          boo = true;
        }
      });
    return boo;
  }
  */

  addMagicLink() {
    debugLog("Add link between node to create a chain");

    /* // BROKEN, TO DEPORT PolymerViewer
    let nodetoLink: SimulationNode[] = [];

    let newlinks = [];
    //Recherche les nodes sans link ou avec un seul link
    this.props.svg
      .selectAll<SVGPathElement, SimulationNode>("path")
      .each((d: SimulationNode) => {
        if (!d.links) nodetoLink.push(d);
        else if (d.links!.length === 1) nodetoLink.push(d);
        else if (d.links!.length === 0) nodetoLink.push(d);
      });

    //debugLog("nodetolink", nodetoLink)

    if (nodetoLink.length !== 0) {
      // Parcourir la liste pour trouver noeud avec lien manquant avec id consecutif
      let nextid: number = parseInt(nodetoLink[0].id) + 1;
      for (let node of nodetoLink) {
        if (parseInt(node.id) === nextid) {
          let nodetarget = nodetoLink.filter(
            (n) => parseInt(n.id) === nextid - 1,
          )[0];

          let link = {
            source: node,
            target: nodetarget,
          };
          newlinks.push(link);

          if (node.links) node.links.push(nodetarget);
          else node.links = [nodetarget];

          if (nodetarget.links) nodetarget.links.push(node);
          else nodetarget.links = [node];
        }
        nextid = parseInt(node.id) + 1;
      }
      this.props.polymerViewer.links(newlinks);
      this.props.handleUpdate();
    }
    */
  }

  removeHull = (
    hull: Element,
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  ) => {
    debugLog("HULL Logic disables");
    return;

    //get id of hull
    /*
    const id: string = hull.getAttribute("group")!;

    this.props.svg
      .selectAll<SVGPathElement, SimulationGroup>("path.area")
      .filter(function (d: SimulationGroup): boolean {
        return this.getAttribute("group") === id;
      })
      .remove();

    this.props.svg
      .selectAll<SVGPathElement, SimulationNode>("path.nodes")
      .filter((d: SimulationNode) => {
        return d.group === parseInt(id);
      })
      .each((d: SimulationNode) => {
        d.group = undefined;
      });

    this.props.svg
      .selectAll<SVGPathElement, SimulationNode>("path.onfocus")
      .filter((d: SimulationNode) => {
        return d.group === parseInt(id);
      })
      .each((d: SimulationNode) => {
        d.group = undefined;
      });
      */
  };
  /*
  removeThisLink = (link: SimulationLink) => {
    debugLog("removeThisLink", link);

    link.source.links = link.source.links!.filter(
      (nodelink: SimulationNode) => nodelink !== link.target,
    );
    link.target.links = link.target.links!.filter(
      (nodelink: SimulationNode) => nodelink !== link.source,
    );
    this.props.svg
      .selectAll<SVGLineElement, SimulationLink>("line")
      .filter((l: SimulationLink) => l === link)
      .remove();
    this.props.handleUpdate();
  };
*/
  /*
  removeBadLinks = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  ) => {
    //Iterate throw differents bad links
    this.props.svg
      .selectAll<SVGLineElement, SimulationLink>("line.error")
      .each((d: SimulationLink) => {
        d.source.links = d.source.links!.filter(
          (nodeToRM: SimulationNode) => nodeToRM.id !== d.target.id,
        );
        d.target.links = d.target.links!.filter(
          (nodeToRM: SimulationNode) => nodeToRM.id !== d.source.id,
        );
      })
      .remove();

    this.props.handleUpdate();
  };
  */

  removeSelectedNodes = (
    nodes: d3.Selection<SVGPathElement, SimulationNode, SVGSVGElement, unknown>,
  ) => {
    let li: SimulationNode[] = [];
    console.warn(CustomPolymerStash);
    nodes.each((node: SimulationNode) => {
      li.push(node);
    });
    this.props.onRemoveNodes(li);
  };

  //list d3 qui forme le polygon autour de cette liste
  groupPolymer = (
    listNodesD3: d3.Selection<
      SVGPathElement,
      SimulationNode,
      SVGSVGElement,
      unknown
    >,
  ) => {
    debugLog("HULL LOGIC DISABLED");
    return;
    //clean the previous selected nodes
    /*
    this.props.svg
      .selectAll<SVGPathElement, SimulationNode>("path.onfocus")
      .attr("class", "nodes");

    let idCreatedPolygoneNode: SimulationNode[] = [];
    listNodesD3.each((d: SimulationNode) => {
      if (
        idCreatedPolygoneNode.includes(d) === false &&
        d.group === undefined
      ) {
        let connexe = this.giveConnexeNode(d);
        if (connexe.size() < 4) {
          debugLog(
            "each node ",
            d.id,
            "Too small to group, hull needs 4 nodes",
          );
          return;
        }
        // else if (deja fait donc il faut regarder si les noeuds id sont deja group ou si un des noeud est deja groupé)  ;
        else {
          //Create hull to group polymer

          //Get the last id with the number of group_path object in d3
          let id = this.props.svg.selectAll(".group_path").data().length + 1;
          //Get coord of every nodes
          let selectedNodesCoords: [number, number][] = [];
          connexe.each((d: SimulationNode) => {
            selectedNodesCoords.push([d.x!, d.y!]);
            //and give a id
            d.group = id;
          });

          const color = d3.interpolateTurbo(id / 12);
          let hull = d3.polygonHull(selectedNodesCoords);
          //stupid hack
          let self = this;

          //debugLog("Create hull number :", id)
          this.props.svg
            .selectAll("group_path")
            .data([hull])
            .enter()
            .append("path")
            .attr("group", id)
            .attr("class", "group_path")
            .attr("d", (d) => "M" + d!.join("L") + "Z")
            .attr("fill", color)
            .attr("stroke", color)
            .attr("stroke-width", "20")
            .attr("stroke-location", "outside")
            .attr("stroke-linejoin", "round")
            .style("opacity", 0.2)
            .on("click", function () {
              //@ts-ignore
              self.colapse({ id: id, nodesD3: connexe, color: color });
              this.remove();
              self.props.handleUpdate();
            });

          connexe.each((d: SimulationNode) => {
            idCreatedPolygoneNode.push(d);
          });
        }
      }
    });

    this.props.handleUpdate();
    */
  };

  expandgroup_node = (
    bignode: SVGPathElement,
    dataNodes: SimulationGroup,
  ): void => {
    debugLog("Disables HULL logics");
    /*
      debugLog("EXPAND BIG BANG  !", bignode, dataNodes)
      bignode.remove();
      const x = bignode.getAttribute("x");
      const y = bignode.getAttribute("y");
      dataNodes.nodesD3!.data().map((n) => (n.x = parseInt(x!)));
      dataNodes.nodesD3!.data().map((n) => (n.y = parseInt(y!)));
      addNodeToSVG_as_Gs(
        dataNodes.nodesD3!.data(),
        this.props.simulation,
        this.props.handleUpdate,
        this.props.zoom,
      );

      let listLink: SimulationLink[] = [];
      for (let node of dataNodes.nodesD3!.data()) {
        for (let nodelink of node.links!)
          listLink.push({
            source: node,
            target: nodelink,
          });
      }

    addLinkToSVG(listLink);
    this.props.svg
      .selectAll<SVGPathElement, SimulationGroup>("path.area")
      .filter(function (d: SimulationGroup): boolean {
        return this.getAttribute("group") === dataNodes.id.toString();
      });
    //.attr("display", '')

    //Remettre le hull autour

    //debugLog("truc", bignode, dataNodes)
    let selectedNodesCoords: [number, number][] = [];
    const id: string = bignode.getAttribute("group")!;

    dataNodes
      .nodesD3!.data()!
      .map((d: SimulationNode) => selectedNodesCoords.push([d.x!, d.y!]));

    //debugLog(id)
    const color = d3.interpolateTurbo(parseInt(id) / 12);
    let hull = d3.polygonHull(selectedNodesCoords);
    //stupid hack
    let self = this;

    //debugLog("Create hull number :", id)
    this.props.svg
      .selectAll("group_path")
      .data([hull])
      .enter()
      .append("path")
      .attr("group", id)
      .attr("class", "group_path")
      .attr("d", (d) => "M" + d!.join("L") + "Z")
      .attr("fill", color)
      .attr("stroke", color)
      .attr("stroke-width", "20")
      .attr("stroke-location", "outside")
      .attr("stroke-linejoin", "round")
      .style("opacity", 0.2)
      .on("click", function () {
        //@ts-ignore
        self.colapse({ id: id, nodesD3: dataNodes.nodesD3, color: color });
        this.remove();
        self.props.handleUpdate();
      });

    this.groupPolymer(
      this.props.svg
        .selectAll<SVGPathElement, SimulationNode>("path.nodes")
        .filter((d: SimulationNode) => d.group === dataNodes.id),
    );
    this.props.handleUpdate();
    */
  };

  componentDidMount(): void {
    debugLog("ContextMenu mounted with props:");
    debugLog(this.props);
  }
  render() {
    /*
    const selectedNodes = this.props.svg.selectAll<
      SVGPathElement,
      SimulationNode
    >(".onfocus");

    const anchoredNodes = this.props.svg.selectAll<
      SVGPathElement,
      SimulationNode
    >(".onfocus.anchored");
*/
    /*
    debugLog(
      this.props.svg
        .selectAll<SVGPathElement, SimulationLink>("line.error")
        .nodes().length > 0,
    );
    debugLog(
      this.props.svg
        .selectAll<SVGPathElement, SimulationLink>("line.error")
        .nodes(),
    );
    */
    const linksCount = this.props.selectedNodes
      .data()
      .reduce((acc, d: SimulationNode) => {
        return acc + (d.links !== undefined ? d.links.length : 0);
      }, 0);
    debugLog("linkscount =" + linksCount);

    return (
      <Menu
        anchorReference="anchorPosition"
        anchorPosition={{ top: this.props.y + 2, left: this.props.x + 2 }}
        open={true}
      >
        {this.props.selectedNodes.size() > 0 && (
          <div key={1}>
            <Typography
              component="div"
              style={{
                textAlign: "center",
                backgroundColor: "silver",
                marginTop: "-8px",
                color: "whitesmoke",
                fontWeight: "light",
                fontSize: "1.25em",
              }}
            >
              {this.props.selectedNodes.size()} node
              {this.props.selectedNodes.size() > 1 ? "s" : ""} selected
            </Typography>
            <Divider />
            {linksCount > 0 && (
              <MenuItem
                onClick={() => {
                  this.props.onRemoveNodesLinks(
                    this.props.selectedNodes.data(),
                  );
                }}
              >
                <LinkOffIcon
                  style={{
                    color: "darkgray",
                    verticalAlign: "middle",
                    fontSize: "1.5rem",
                    marginRight: "0.25em",
                  }}
                />
                {"   "}
                Remove link{this.props.selectedNodes.size() > 2 ? "s" : ""}
              </MenuItem>
            )}
            {/*<MenuItem
              onClick={() => {
                this.groupPolymer(selectedNodes);
              }}
            >
              {" "}
              <del>Group this polymer</del>{" "}
            </MenuItem>
            */}
            <MenuItem
              onClick={() => {
                this.props.onRemoveNodes(this.props.selectedNodes.data());
              }}
            >
              <DeleteForeverIcon
                style={{
                  color: "darkgray",
                  verticalAlign: "middle",
                  fontSize: "1.5rem",
                  marginRight: "0.25em",
                }}
              />
              Remove selected node
              {this.props.selectedNodes.size() > 1 ? "s" : ""}
            </MenuItem>
            <MenuItem
              onClick={() => {
                const n: SimulationNode[] = [];
                this.props.selectedNodes.each((d: SimulationNode) => {
                  n.push(d);
                });
                this.props.handlePaste(n);
              }}
            >
              <ContentCopyIcon
                style={{
                  color: "darkgray",
                  verticalAlign: "middle",
                  fontSize: "1.5rem",
                  marginRight: "0.25em",
                }}
              />
              Paste selection
            </MenuItem>
            <MenuItem
              onClick={() => {
                this.props.selectedNodes.attr("class", "nodes");
              }}
            >
              <DoDisturbIcon
                style={{
                  color: "darkgray",
                  verticalAlign: "middle",
                  fontSize: "1.5rem",
                  marginRight: "0.25em",
                }}
              />
              Unselect
            </MenuItem>
            <Divider />
            <MenuItem disableRipple>
              <ColorPicker
                onChange={(c) => {
                  this.props.onColorPicker(c, this.props.selectedNodes);
                }}
              />
            </MenuItem>
          </div>
        )}

        {this.props.lineClick && (
          <div>
            <div key={2}>
              <Typography
                component="div"
                style={{
                  textAlign: "center",
                  backgroundColor: "silver",
                  marginTop: "-8px",
                  color: "whitesmoke",
                  fontWeight: "light",
                  fontSize: "1.25em",
                }}
              >
                {/* id is the 0-based graph index (string); display 1-based to
                    match the node tooltip / FixLink "Residue#". Number() avoids
                    string concatenation. */}
                {`${this.props.lineClick.source.resname}#${Number(this.props.lineClick.source.id) + 1} -- `}
                {`${this.props.lineClick.target.resname}#${Number(this.props.lineClick.target.id) + 1} `}
              </Typography>
              <Divider />
            </div>
            {(this.props.isErrorLink || this.props.isCorrectedLink) && (
              <MenuItem
                style={{
                  color: this.props.isCorrectedLink
                    ? "forestgreen"
                    : "darkgray",
                }}
                onClick={
                  this.props.onFixClick
                  /*
                  this.props.change_current_position_fixlink(
                    this.props.lineClick!,

                  );

                } */
                }
              >
                <HandymanIcon
                  style={{
                    verticalAlign: "middle",
                    fontSize: "1.5rem",
                    marginRight: "0.25em",
                  }}
                />
                {this.props.isCorrectedLink ? "Modify " : "Apply "} a bond fix
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                debugLog("ContextMenu:RemoveLink");
                debugLog(this.props.lineClick);
                this.props.onDeleteLinkClick(this.props.lineClick!);
              }}
            >
              <LinkOffIcon
                style={{
                  color: "darkgray",
                  verticalAlign: "middle",
                  fontSize: "1.5rem",
                  marginRight: "0.25em",
                }}
              />
              Delete this link
            </MenuItem>
            <Divider />
          </div>
        )}

        {/*this.props.hullClick && (
          <div key={0}>
            <MenuItem
              onClick={() => {
                this.removeHull(this.props.hullClick!, this.props.svg);
              }}
            >
              Remove group
            </MenuItem>
            <Divider />
          </div>
        )*/}

        {this.props.nodeClick && (
          <div>
            <MenuItem
              onClick={() => {
                this.props.onRemoveNodeLinksClick(this.props.nodeClick!);
              }}
            >
              Remove link
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (this.props.nodeClick !== undefined)
                  this.props.onRemoveNodeClick(this.props.nodeClick!);
              }}
            >
              Remove node #{this.props.nodeClick.id}
            </MenuItem>
            <MenuItem
              onClick={() => {
                this.props.onExpandHighlight(this.props.nodeClick!);
              }}
            >
              Select this polymer
            </MenuItem>
            <Divider />
          </div>
        )}

        {
          /* Selection node non empty and at least one is not anchored */

          this.props.selectedNodes.size() > this.props.anchoredNodes.size() && (
            <MenuItem
              onClick={() => {
                this.props.onToggleAnchorSelection(this.props.selectedNodes);
              }}
              style={{ color: "darkgray", fontWeight: "bolds" }}
            >
              <PushPinIcon
                style={{
                  color: "darkgray",
                  verticalAlign: "middle",
                  fontSize: "1.5rem",
                  marginRight: "0.25em",
                }}
              />
              <Typography style={{ color: "black" }}>
                {`Pin ${this.props.selectedNodes.size() - this.props.anchoredNodes.size() > 1 ? "them" : "it"}`}
              </Typography>
            </MenuItem>
          )
        }

        {
          /* Selction node is non empty and at least one node is anchored */
          this.props.selectedNodes.size() > 0 &&
            this.props.anchoredNodes.size() > 0 && (
              <MenuItem
                onClick={() => {
                  this.props.onToggleAnchorSelection(
                    this.props.anchoredNodes,
                    true,
                  );
                }}
              >
                <BarredPushPinIcon
                  style={{
                    color: "darkgray",
                    verticalAlign: "middle",
                    fontSize: "1.5rem",
                    marginRight: "0.25em",
                  }}
                />
                {`Unpin ${
                  this.props.selectedNodes
                    .data()
                    .reduce(
                      (acc: number, d: SimulationNode) =>
                        (acc +=
                          d.fx !== undefined && d.fy !== undefined ? 1 : 0),
                      0,
                    ) > 1
                    ? "them"
                    : "it"
                }
              `}
              </MenuItem>
            )
        }

        {this.props.selectedNodes.size() > 0 && <Divider />}
        {this.props.isErrorLink && (
          <MenuItem
            onClick={this.props.onDeleteErrorLink}
            style={{ color: "darkorange", fontWeight: "bold" }}
          >
            <LinkOffIcon
              style={{
                color: "darkorange",
                verticalAlign: "middle",
                fontSize: "1.5rem",
                marginRight: "0.25em",
              }}
            />
            Delete all erroneous links
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            this.props.onNuke();
          }}
          style={{ color: "firebrick", fontWeight: "bold" }}
        >
          <WarningIcon
            style={{
              color: "firebrick",
              verticalAlign: "middle",
              fontSize: "1.5rem",
            }}
          />{" "}
          Delete entiere polymer
        </MenuItem>
        <MenuItem
          onClick={() => {
            this.addMagicLink();
          }}
          style={{ color: "gray", fontWeight: "bold" }}
        >
          <RouteIcon
            style={{
              verticalAlign: "middle",
              fontSize: "1.5rem",
            }}
          />{" "}
          Connect termini
        </MenuItem>

        {
          // DOWNLOAD JSON POLICY TO REVISE
          /*
          (this.props.polymerViewer.nodes() ?? []).length === 0 && (
          <MenuItem
            onClick={() => {
              DownloadJson(
                this.props.polymerViewer.getSimulationLayer(),
                this.props.forcefield,
              );
            }}
          >
            Download Json
          </MenuItem>
        )
*/
        }
      </Menu>
    );
  }
}
