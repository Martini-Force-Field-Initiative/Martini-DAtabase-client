import { debugLog } from '../../logger';
import * as d3 from "d3";
import {
  SimulationNode,
  SimulationLink,
  NodeView,
  LinkView,
  SimulationGroup,
} from "./SimulationType";
import { boolean } from "@mmsb/ngl/declarations/utils";

//Format of Json ask by polyply
//{
//     "directed": false,
//     "multigraph": false,
//     "graph": {},
//     "nodes": [
//         {
//             "resname": "glucose",
//             "resid": 0,
//             "id": 0
//         },
//         {
//             "resname": "glucose",
//             "resid": 0,
//             "id": 1
//         },
//         {
//             "resname": "glucose",
//             "resid": 0,
//             "id": 2
//         }
//     ],
//     "links": [
//         {
//             "source": 0,
//             "target": 1
//         },
//         {
//             "source": 0,
//             "target": 2
//         }
//     ]
// }

function simulationToJsonBlob(
  simulation: d3.Simulation<SimulationNode, SimulationLink>,
  ff: string,
) {
  // Vraiment super moche  !!
  // Faire jolie variable json plutot que des str
  const myJSON = simulationToJson(simulation, ff);

  const blob = new Blob([JSON.stringify(myJSON)], { type: "text" });
  return blob;
}

export interface PolymerView {
  targetPolyplyLib: string;
  directed: boolean;
  multigraph: boolean;
  graph: { [k: string]: any };
  nodes: NodeView[];
  links: LinkView[];
}

export function simulationToJson(
  simulation: d3.Simulation<SimulationNode, SimulationLink>,
  ff: string,
): PolymerView {
  const nodes: NodeView[] = [];
  const myLinks: LinkView[] = [];

  for (let n of simulation.nodes()) {
    let bignodeinfo = [];
    if (n.resname === undefined) {
      //TRES SALE  -- GLA should come back for it
      //A CORRIGER !!!!!!!!!!!!!!!!!!
      let bign: any = n;
      for (let i of bign.nodesD3.data()) {
        nodes.push({
          resname: i.resname,
          seqid: 0,
          id: Number(i.id),
        });

        if (i.links !== undefined) {
          for (let link of i.links!) {
            //filter existing link
            if (
              myLinks.filter(
                (e) =>
                  e.target === Number(i.id) && e.source === Number(link.id),
              ).length === 0
            ) {
              myLinks.push({
                source: Number(i.id),
                target: Number(link.id),
              });
            }
          }
        }
      }
    } else {
      n.from_itp
        ? nodes.push({
            resname: n.resname,
            seqid: 0,
            id: Number(n.id),
            from_itp: n.from_itp,
          })
        : nodes.push({
            resname: n.resname,
            seqid: 0,
            id: Number(n.id),
          });

      if (n.links !== undefined) {
        for (let link of n.links!) {
          //filter existing link
          if (
            myLinks.filter(
              (e) => e.target === Number(n.id) && e.source === Number(link.id),
            ).length === 0
          ) {
            myLinks.push({
              source: Number(n.id),
              target: Number(link.id),
            });
          }
        }
      }
    }
  }

  //debugLog("simulationToJson", "nodes", nodes,   "links", myLinks)
  return {
    targetPolyplyLib: ff,
    directed: false,
    multigraph: false,
    graph: {},
    nodes: nodes,
    links: myLinks,
  };
}

export function simulationToJsonold(
  simulation: d3.Simulation<SimulationNode, SimulationLink>,
  ff: string,
) {
  const _ = simulation.nodes().map((obj) => {
    return {
      resname: obj.resname,
      seqid: 0,
      id: Number(obj.id),
    };
  });

  const myLinks: { source: number; target: number }[] = [];
  for (let node of simulation.nodes()) {
    if (node.links !== undefined) {
      for (let link of node.links!) {
        //filter existing link
        if (
          myLinks.filter(
            (e) => e.target === Number(node.id) && e.source === Number(link.id),
          ).length === 0
        ) {
          myLinks.push({
            source: Number(node.id),
            target: Number(link.id),
          });
        }
      }
    }
  }

  return {
    forcefield: ff,
    directed: false,
    multigraph: false,
    graph: {},
    nodes: _,
    links: myLinks,
  };
}

export function DownloadJson(
  simulation: d3.Simulation<SimulationNode, SimulationLink>,
  ff: string,
) {
  debugLog("Download json ! ");

  const blob = simulationToJsonBlob(simulation, ff);
  const a = document.createElement("a");
  a.download = "file.json";
  a.href = window.URL.createObjectURL(blob);
  const clickEvt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  a.dispatchEvent(clickEvt);
  a.remove();
}
