import { debugDir, debugLog } from '../../../logger';
import { CustomPolymer, ValidFormats, validFormats } from "./types";
import { fastaConvert } from "./simulationInterface";

//import ItpFile from 'itp-parser-forked';
import ItpFile from "itp_mad_parser";
import {
  itpParser,
  fastaParser,
  jsonParser,
  isValidPolymerObject,
} from "../GeneratorMenu/ModalUploaderToCustomStash/UploadParsers";
import { CustomPolymerTopology } from "./iTopology";

export type Parser = (f: File | string) => Promise<CustomPolymer[]>;

// WiP interface for CustomPolymer
/*
Store the date required to generate:
  - molecular representation in front-end
  - itp dependency generation to back-end
  peptides are specific cases as they dont require itp data
*/

export const extract_from_itp = (itp: ItpFile): string => {
  const from_itp = itp
    .getField("moleculetype", true)
    .reduce((molTypeDef: string | undefined, currLine: string) => {
      if (molTypeDef !== undefined)
        throw new Error("Unproper itp definition of [moleculetype]");
      return currLine.split(/\s+/)[0];
    }, undefined);
  if (from_itp === undefined)
    throw new Error("Unproper itp definition of [moleculetype]");
  return from_itp;
};

export class Source {
  extension: ValidFormats;

  private parserMap: Record<ValidFormats, Parser> = {
    json: this.JSON_parser,
    itp: this.ITP_parser,
    fasta: this.FASTA_parser,
    ff: this.FF_parser,
  };
  parser: Parser;

  constructor(ext: any) {
    this.extension = this.validateFormat(ext);
    this.parser = this.parserMap[this.extension];
  }
  private validateFormat(mayBeFormat: any) {
    if (validFormats.includes(mayBeFormat)) return mayBeFormat as ValidFormats; // type assertion satisfies compiler
    throw new Error(`'${mayBeFormat}' is not a valid format`);
  }

  private ITP_parser(f: File | string): Promise<CustomPolymer[]> {
    const itpStringToPolymer = (input: string) => {
      const polymers: CustomPolymer[] = [];
      const itpContent = ItpFile.readManyFromString(input);
      for (const itp of itpContent) {
        debugLog("One ITP incoming");
        debugDir(itp);

        const polymer: CustomPolymer = {
          name: itp.name,
          atoms: itp.getField("atoms", true),
          links: itp.getField("bonds"),
          iTopology: new CustomPolymerTopology(),
          rawItp: itp.toString(),
          from_itp: extract_from_itp(itp),
          isAtomic: true, // To assess
        };
        polymers.push(polymer);
      }
      return polymers;
    };
    if (typeof f === "string")
      return new Promise((res, rel) => res(itpStringToPolymer(f)));

    //await itpParser([f])
    const reader = new FileReader();
    const polymers: any[] = [];
    return new Promise((res, rej) => {
      reader.onload = (event) => {
        const polymers = itpStringToPolymer(event.target?.result as string);
        res(polymers);
      };
      reader.readAsText(f);
    });

    // Handles parsing logic and PolymerBuilder:addNEwMolFromItp logics
    /*
    reader.onload = (event: any) => {
      debugLog("LOOK HERE");
      debugLog(event.target.result);
      if (event.target.result.includes("moleculetype")) {
        debugLog("Valid .itp file");
        this.props.addNewMolFromITP(event.target.result)
        this.setState({ expertUploadedMolecule: true })
      } else {
        debugLog("Invalid file. Not a well-formed .itp file");
        this.props.warningfunction("Invalid file. Field : [ moleculetype ] is not found in the file loaded. Not a well-formed .itp file")
      }
    };*/
  }
  private JSON_parser(f: File | string): Promise<CustomPolymer[]> {
    return new Promise((res, rej) => {
      if (!(typeof f === "string")) {
        rej("FASTA parser only accepts string");
        return;
      }
      try {
        const data = JSON.parse(f); // Should be safe as provided by JsonBodyForm
        if (!isValidPolymerObject(data))
          throw new Error("Not a polyply JSON format");
        const iTopology = new CustomPolymerTopology();
        iTopology.any(data.nodes, data.links);
        res([
          {
            name: "",
            atoms: [],
            links: [],
            iTopology,
            rawItp: "",
            isAtomic: false, // Until a general management plan of free topology is done
          },
        ]);
      } catch (e: any) {
        rej(e.toString());
        return;
      }

      //res([])
    });
  }
  private FASTA_parser(f: File | string): Promise<CustomPolymer[]> {
    // Quick and dirty

    debugLog(`[CustomPolymerStash:FASTA_parser] ${f}`);
    return new Promise((res, rej) => {
      if (!(typeof f === "string")) {
        rej("FASTA parser only accepts string");
        return;
      }
      const toto = (f as string).replace("\n", "").split("");
      console.warn(toto);
      const components = (f as string)
        .replace("\n", "")
        .split("")
        .map((c) => fastaConvert(c));
      console.warn(components);
      if (components.includes(undefined)) {
        rej("FASTA symbol error");
        return;
      }
      const iTopology = new CustomPolymerTopology();
      iTopology.linear(components as string[]);
      res([
        {
          name: "",
          atoms: [],
          links: [],
          iTopology,
          rawItp: "",
          isAtomic: true,
        },
      ]);
    });
  }
  private FF_parser(f: File | string): Promise<CustomPolymer[]> {
    return new Promise((res, rej) => {
      res([]);
    });
  }
}
