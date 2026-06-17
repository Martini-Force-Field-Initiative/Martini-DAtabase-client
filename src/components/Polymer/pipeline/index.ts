import { debugDir, debugLog } from '../../../logger';
import { getMadSocket, MAD_ClientSocket } from "../../../Socket";
import {
  ClientPipelineInputsGRO,
  ClientPipelineInputsPDB,
  ClientPipeLineResult,
  ClientPipeLineFinalFilesBundle,
  PolymerHistorySavePacket,
} from "./dto";
import { PipelineEnvironment } from "../CustomPolymerStash/types";
import { PolymerView } from "../generateJson";
import {
  errorSorter as pipelineExceptionSorter,
  PipelineLinkError,
} from "./errors";
import { FileFromHttp } from "../../../types/entities";

/*
interface DownloadBundle {
    itp:string,
    gro:string,
    pdb:string,
    top:string
}
*/

/*
interface initialGenerateGRO {
    box:string,
    number:string,
    list_graph_component:string[][]
}*/

interface InputGenerateGRO {
  itpPatched?: FileFromHttp;
  listGraphComponent: string[][];
  uiPatchedLinks?: string[];
}

export class PipeLineRunner {
  MADSocket: MAD_ClientSocket;
  userId?: string;
  doSendEmail?: boolean;
  job_save_id?: string;
  name?: string;
  polymer?: PolymerView;
  number?: string;
  box?: string;
  environment?: PipelineEnvironment;

  ITP_step_results?: FileFromHttp; // polymer.itp from gen_param step
  GRO_step_results_gro?: string;
  GRO_step_results_top?: string;
  PDB_step_results_pdb?: string;
  private _vermouthLibs: string[] = [];
  private finalFilesBundle?: ClientPipeLineFinalFilesBundle;
  constructor() {
    this.MADSocket = getMadSocket("PolymerGenerator"); // A tester, multiple get
  }

  initialize(
    data: PipelineEnvironment,
    name: string,
    number: string,
    box: string,
    doSendEmail: boolean,
    userId: string,
  ) {
    this.environment = data;
    this.doSendEmail = doSendEmail;
    this.userId = userId;
    this.name = name;
    this.number = number;
    this.box = box;

    console.warn("INIT==>", this.environment);
    debugDir(this.environment);
  }
  setActiveLibs(libs: string[]) {
    //debugLog(`[PolymerBuilder:PipelineRunner] setActiveLibs ${libs}`);
    this._vermouthLibs = libs;
  }
  async generateITP(name: string, polymer: PolymerView): Promise<void> {
    // ASSESS ITWORKS WITH MUTLIPLE ITP CASE
    if (this.environment === undefined)
      throw "[PolymerBuilder:PipeLineRunner] environment is not set";
    /**
     * Run Pipeline 1st step, it may throw
     *  If it throws foir missing link, we grab the produced ITP anyway
     */
    this.name = name;
    this.polymer = polymer;
    /*
    debugLog("Lets GO");
    debugLog(polymer);
    */
    const { customITP } = this.environment;
    const inputs = {
      polymer,
      name,
      customITP,
      vermouthLibs: this._vermouthLibs,
    };
    try {
      console.warn(
        "[PolymerBuilder::PipeLineRunner:submitGenerateITP] socket request 'GenerateITP'",
        inputs,
      );
      this.ITP_step_results = (await this.MADSocket.request(
        "generateITP",
        inputs,
      )) as FileFromHttp;
      console.warn(
        `[PolymerBuilder::PipeLineRunner:submitGenerateITP] 'generateITP' successfull:`,
      );
      console.warn(this.ITP_step_results);
      return;
    } catch (e: any) {
      const trError = pipelineExceptionSorter(e);
      if (trError instanceof PipelineLinkError) {
        console.warn(
          `got an instance of PipelineLinkError, I am grabbing the produced ITP from it`,
        );
        debugDir(e);
        //this.ITP_step_results = trError.ItpWithMissingLinks;
      }

      throw trError;
    }
  }

  async generateGRO(inputGenerateGRO: InputGenerateGRO) {
    // 2nd step
    // Two submission cases

    if (this.environment === undefined)
      throw "[PolymerBuilder:PipeLineRunner:generateGRO] environment is not set";
    if (this.name === undefined)
      throw "[PolymerBuilder:PipeLineRunner:generateGRO] name value is not set";
    if (this.number === undefined)
      throw "[PolymerBuilder:PipeLineRunner:generateGRO] number value is not set";
    if (this.box === undefined)
      throw "[PolymerBuilder:PipeLineRunner:generateGRO] box value is not set";

    if (inputGenerateGRO.itpPatched) {
      console.warn(
        "[PolymerBuilder:PipeLineRunner:generateGRO] swaping previous ITP for fixed one",
      );
      // patching with eventual customLinks from poply dialog
      this.ITP_step_results = inputGenerateGRO.itpPatched;
      console.warn(">ITP patched based content");
      console.warn(this.ITP_step_results.content);
    }

    console.warn("==>", this.environment);
    debugDir(this.environment);

    const { userStartGRO, customITP } = this.environment;
    const { listGraphComponent } = inputGenerateGRO;

    const inputs: ClientPipelineInputsGRO = {
      itp: this.ITP_step_results as FileFromHttp,
      userStartGRO,
      userStartITP: customITP.userStart,
      listGraphComponent,
      name: this.name,
      box: this.box,
      number: this.number,
      vermouthLibs: this._vermouthLibs,
    };
    try {
      console.warn(
        "[PolymerBuilder:PipeLineRunner:generateGRO] socket request 'generateGRO' with following data:",
      );
      console.warn(inputs);
      const { gro, top } = await this.MADSocket.request("generateGRO", inputs); //  as {[k:string]: string};
      console.warn(
        `[PolymerBuilder:PipeLineRunner:generateGRO] 'generateGRO' successfull:`,
      );
      this.GRO_step_results_gro = gro;
      this.GRO_step_results_top = top;
    } catch (e) {
      const _ = pipelineExceptionSorter(e);
      throw e;
    }
  }
  async generatePDB() {
    // Next step, enrich data_for_computation and run until the end !!!
    console.warn(`[PolymerBuilder:PipeLineRunner:generatePDB] starting:`);
    if (this.GRO_step_results_gro === undefined)
      throw `[PolymerBuilder:PipeLineRunner:generatePDB] no GRO step data found`;

    if (this.GRO_step_results_top === undefined)
      throw `[PolymerBuilder:PipeLineRunner:generatePDB] no TOP step data found`;

    if (this.ITP_step_results === undefined)
      throw `[PolymerBuilder:PipeLineRunner:generatePDB] no ITP step data found`;
    if (this.environment == undefined)
      throw "[PolymerBuilder:PipeLineRunner:generateGRO] environment is not set";

    const { customITP } = this.environment;
    const inputsReq: ClientPipelineInputsPDB = {
      readyGro: this.GRO_step_results_gro,
      itp: this.ITP_step_results,
      userStartITP: customITP.userStart,
      vermouthLibs: this._vermouthLibs,
      readyTop: this.GRO_step_results_top,
      name: this.name as string,
      userId: this.userId as string,
      doSendEmail: this.doSendEmail as boolean,
      targetPolyplyLib: this.polymer?.targetPolyplyLib as string,
    };
    try {
      const results: ClientPipeLineResult = await this.MADSocket.request(
        "generatePDB",
        inputsReq,
      );

      //this.PDB_step_results_pdb = pdb;
      this.job_save_id = results.jobid;
      this.finalFilesBundle = results.files;
      this.finalFilesBundle.json = {
        content: JSON.stringify(this.polymer),
        type: "json",
        name: `${this.name}.json`,
      };

      console.warn(`[PolymerBuilder:generatePDB] 'generatePDB' successfull:`);
    } catch (e) {
      const _ = pipelineExceptionSorter(e);
      throw e;
    }
  }

  get historyData(): PolymerHistorySavePacket {
    if (this.finalFilesBundle === undefined)
      throw "[PolymerBuilder:PipeLineRunner:historyData] finalFilesBundle is not set";
    const _ = {
      vermouthLibs: this._vermouthLibs as string[],
      gro: this.finalFilesBundle.gro,
      pdb: this.finalFilesBundle.pdb,
      top: this.finalFilesBundle.top,
      itps: this.finalFilesBundle.itps,
      name: this.name as string,
      userId: this.userId as string,
    };
    debugLog(`[PolymerBuilder:PipeLineRunner:historyData] historyData:`);
    debugDir(_);
    return _;
  }

  get downloadBundle(): ClientPipeLineFinalFilesBundle {
    if (this.finalFilesBundle == undefined)
      throw "[PolymerBuilder:PipeLineRunner:downloadBundle] finalFilesBundle is not set";
    /*return {
            gro        : this.GRO_step_results_gro as string,
            pdb        : this.PDB_step_results_pdb as string,
            top        : this.GRO_step_results_top as string,
            //top        : this.PDB_step_results_top as string,
            itp        : this.ITP_step_results?.content as string,
        };*/
    return this.finalFilesBundle;
  }
}
