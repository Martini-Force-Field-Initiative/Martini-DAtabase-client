import {
  SimulationNode,
  SimulationLink,
  NodeInjectSpec,
} from "../SimulationType";
import { CustomPolymerTopology } from "./iTopology";
import { FileFromHttp } from "../../../types/entities";

export type {
  SimulationNode,
  SimulationLink,
  NodeInjectSpec,
} from "../SimulationType";

export const validFormats = ["json", "fasta", "itp", "ff"] as const;
export type ValidFormats = (typeof validFormats)[number];

export interface NewPolymer {
  newMolecule: SimulationNode[];
  newLinks: SimulationLink[];
}

export interface NewLink {
  source: SimulationNode;
  target: SimulationNode;
}

export interface CustomPolymer {
  name: string;
  iTopology: CustomPolymerTopology;
  rawItp: string;
  isAtomic: boolean;
  atoms: string[];
  links: string[];
  from_itp?: string;
}

interface environmentITP {
  customMolecules?: string;
  customLinks?: string;
  userStart?: UserModelItps;
}

export interface UserModelItps {
  // Describes the set of ITP fetched from history or uploaded by user
  moleculeITP: FileFromHttp[];
  goITP?: [FileFromHttp, FileFromHttp];
  elasticITP?: FileFromHttp[];
}

export interface PipelineEnvironment {
  customITP: environmentITP; // User's provided ITP
  vermouthLibs?: string[]; // ff file settings symbols as declared in backend ForceFieldStore
  userStartGRO?: FileFromHttp;
  forcefield: string; // polyply registred ForceField File
  activeLibs?: string[];
}
