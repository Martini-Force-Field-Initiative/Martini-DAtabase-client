import { ItpFile } from "itp_mad_parser";
//export {ItpFile} from 'itp-parser-forked';

export const fastaRegEx = /^[ACDEFGHIKLMNPQRSTVWY]*$/g;
export const fastaParser = async (f: FileList): Promise<[string, string]> => {
  /**
   * Parser a file Object with string content as fasta format into
   * 2-uple (head_content, sequence_content)
   */
  return new Promise((res, rej) => {
    if (f.length != 1) {
      rej("Upload only one file");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const fastaLines = (event.target?.result as string).split("\n");
      if (fastaLines.length <= 1) {
        rej("Malformed FASTA file");
        return;
      }
      let fastaSeq = "";
      let fastaHeader = undefined;
      for (let line of fastaLines) {
        if (!fastaHeader) {
          if (!line.startsWith(">")) {
            rej("Missing Fasta header line");
            return;
          }
          fastaHeader = line.replace(/^>/, "");
          continue;
        }
        line = line.replace(/\s/g, "");
        if (!line.match(fastaRegEx)) {
          rej("Irregular FASTA character");
          return;
        }
        fastaSeq += line;
      }
      res([fastaHeader as string, fastaSeq]);
    };

    reader.readAsText(f[0]);
  });
};

export const jsonParser = async (f: FileList): Promise<string> => {
  /**
   * Parser a file Object with string content as fasta format into
   * 2-uple (head_content, sequence_content)
   */
  return new Promise((res, rej) => {
    if (f.length !== 1) {
      rej("Upload only one file");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const maybeJsonStr = event.target?.result;
      if (!maybeJsonStr) {
        rej("Empty JSON File?");
        return;
      }
      console.warn("JSON parser read", maybeJsonStr);
      const data = JSON.parse(maybeJsonStr as string);
      if (!isValidPolymerObject(data)) {
        console.error("Not proper topology Json string");
        rej("Malformed JSON File");
        return;
      }
      if (!no_from_itp(data)) {
        console.error("Json nodes feature 'from_itp'");
        rej(
          "Import of polymer topology with 'from_itp' dependency is currently forbidden",
        );
        return;
      }
      res(maybeJsonStr as string);
    };

    reader.readAsText(f[0]);
  });
};

export interface PolyplyLink {
  source: number;
  target: number;
}
export interface PolyplyNode {
  resname: string;
  seqid: number | string;
  id: number;
  from_itp?: string;
}
export interface PolyplyTopology {
  forcefield: string;
  directed: boolean;
  multigraph: boolean;
  graph: any;
  links: PolyplyLink[];
  nodes: PolyplyNode[];
}
export const isValidPolymerObject = (o: any): o is PolyplyTopology => {
  /**
   * Minimally a valid PolyplyTopology
   */
  return (
    "targetPolyplyLib" in o &&
    "directed" in o &&
    "multigraph" in o &&
    "graph" in o &&
    "links" in o &&
    "nodes" in o
  );
};

export const no_from_itp = (o: PolyplyTopology): boolean => {
  //o.nodes.forEach((n: PolyplyNode) => console.dir(n));
  const from_itp_count = o.nodes.reduce(
    (acc: number, n: PolyplyNode) =>
      n.hasOwnProperty("from_itp") ? acc + 1 : acc,
    0,
  );

  return from_itp_count === 0;
};

export const itpParser = async (
  f: FileList,
): Promise<[[string, number][], ItpFile[]]> => {
  return new Promise((res, rej) => {
    if (f.length !== 1) {
      rej("Upload only one file");
      return;
    }
    const reader = new FileReader();

    reader.onload = (event) => {
      const maybeItpOrFf = event.target?.result;
      const itps = ItpFile.readManyFromString(maybeItpOrFf as string);
      res([itps.map((itp) => [itp.name, itp.atoms.length]), itps]);
    };

    reader.readAsText(f[0]);
  });
};

export const readManyItpFromSring = (
  s: string,
): [[string, number][], ItpFile[]] => {
  const itps = ItpFile.readManyFromString(s);
  return [itps.map((m) => [m.name, m.atoms.length]), itps];
};
