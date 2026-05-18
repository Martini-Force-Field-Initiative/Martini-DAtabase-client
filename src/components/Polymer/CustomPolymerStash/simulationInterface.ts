import { NodeInjectSpec,SimulationNode, NewPolymer, SimulationLink } from "./types";


export  const crossLink =(n1: SimulationNode, n2: SimulationNode) => {
    if (n1.links) n1.links!.push(n2);
    else n1.links = [n2];

    if (n2.links) n2.links!.push(n1);
    else n2.links = [n1];
    return { "source": n1, "target": n2 };
  }

const FASTA_TABLE: { [aa: string]: string } = {
    'CYS': 'C', 'ASP': 'D', 'SER': 'S', 'GLN': 'Q', 'LYS': 'K',
    'ILE': 'I', 'PRO': 'P', 'THR': 'T', 'PHE': 'F', 'ASN': 'N',
    'GLY': 'G', 'HIS': 'H', 'LEU': 'L', 'ARG': 'R', 'TRP': 'W',
    'ALA': 'A', 'VAL': 'V', 'GLU': 'E', 'TYR': 'Y', 'MET': 'M'
}

export const fastaConvert = (s:string):string|undefined => {
    s = s.toUpperCase();
    if( s in FASTA_TABLE) return FASTA_TABLE[s];
    for (const [key, value] of Object.entries(FASTA_TABLE)) {
        if (s === value) return key;
    }
    return undefined
}

export const enumerateResName = (s:d3.Simulation<SimulationNode, SimulationLink>):string[] => {
    const resNames = new Set<string>();
    for (let n of s.nodes()) {
        resNames.add(n.resname);
    }
    return Array.from(resNames);
}

