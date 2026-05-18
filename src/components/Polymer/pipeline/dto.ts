/*
    Polyply Pipeline
    Client-Backend input output data specifications
*/

/**
 *  GenerateITP

*/
import { UserModelItps } from "../CustomPolymerStash/types";
import { FileFromHttp } from "../../../types/entities";
import { PolymerView } from "../generateJson";

export interface ClientPipelineInputsITP {
  polymer: PolymerView;
  name: string;
  customITP: { [fileName: string]: string };
  vermouthLibs: string[];
}

export type ServerDataGenerateITP = string;

export interface ClientPipelineInputsGRO {
  userStartGRO?: FileFromHttp;
  userStartITP?: UserModelItps;
  number: string;
  name: string;
  box: string;
  listGraphComponent: string[][];
  itp: FileFromHttp;
  vermouthLibs: string[];
  uiPatchedLinks?: string[];
}
export interface ClientPipelineInputsPDB {
  itp: FileFromHttp;
  readyGro: string;
  vermouthLibs: string[];
  userStartITP?: UserModelItps;
  readyTop: string;
  name: string;
  userId: string;
  doSendEmail: boolean;
  targetPolyplyLib: string; // For backend-storage purposes
}

export interface PolymerHistorySavePacket {
  gro: FileFromHttp;
  pdb: FileFromHttp;
  top: FileFromHttp;
  itps: FileFromHttp[];
  name: string;
  userId: string;
  vermouthLibs: string[]; // Delegate to backend the identificaiont of the env forcefield name
}

export interface ClientPipeLineFinalFilesBundle {
  pdb: FileFromHttp;
  gro: FileFromHttp;
  top: FileFromHttp;
  itps: FileFromHttp[];
  json: FileFromHttp;
}

export interface ClientPipeLineResult {
  jobid: string;
  files: ClientPipeLineFinalFilesBundle;
}
