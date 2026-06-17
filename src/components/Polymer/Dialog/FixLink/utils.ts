import { PipelineLinkError } from "../../pipeline/errors";
import ItpFile from "itp_mad_parser";

export interface BeadFix {
  idbead: string;
  idres: string;
  resname: string;
  bead: string;
}

export interface ErrorFix {
  start: string;
  end: string;
  startresname: string;
  endresname: string;
  distance: string;
  force: string;
  startchoice: BeadFix[];
  endchoice: BeadFix[];
  is_fixed: boolean;
  change_bead_1?: string;
  change_bead_2?: string;
}

export const errorFixesFactory = (e: PipelineLinkError): ErrorFix[] => {
  const _ = e.linksErrors.map(([bead1, bead2]) => {
    const beadListStart = getbeadslist(bead1, e.ItpWithMissingLinks);
    const beadListEnd = getbeadslist(bead2, e.ItpWithMissingLinks);

    return {
      start: beadListStart[0].idbead,
      end: beadListEnd[0].idbead,
      startresname: beadListStart[0].resname,
      endresname: beadListEnd[0].resname,
      distance: "0.336",
      force: "1200",
      startchoice: beadListStart,
      endchoice: beadListEnd,
      is_fixed: false,
      change_bead_1: undefined,
      change_bead_2: undefined,
    };
  });

  return _;
};

const getbeadslist = (idres: string, itpContent: string): BeadFix[] => {
  const itplineToDico = (li: string[]) => {
    // 301 SC3  128 ARG SC1 301  0.0
    let out = [];
    for (let e of li) {
      const esplit = e.split(" ").filter((e) => e !== "");
      out.push({
        idbead: esplit[0],
        idres: esplit[2],
        resname: esplit[3],
        bead: esplit[4],
      });
    }
    return out;
  };
  //debugLog(`[PolymerBuilder:getbeadslist] itp content is ${itpContent}`);
  //Need to change because id start with 0 and id res start with 1
  const idresmodif = Number(idres) + 1;
  const itp = ItpFile.readFromString(itpContent);

  const atoms = itp.getField("atoms", true);
  const listparseditp = itplineToDico(atoms);
  // debugLog(listparseditp)
  // debugLog(idresmodif)
  return listparseditp.filter((e: any) => parseInt(e.idres) === idresmodif);
};
