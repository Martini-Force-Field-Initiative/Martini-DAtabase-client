import { debugDebug, debugDir, debugLog } from '../../logger';
import ReversibleKeyMap from "reversible-key-map";
import BaseBondsHelper, {
  BaseBondsHelperJSON,
  Relations,
} from "./BaseBondsHelper";
import NglWrapper from "./NglWrapper";
//import ItpFile from 'itp-parser-forked';
import ItpFile from "itp_mad_parser";
import { MoleculeFile } from "../../types/entities";

export default class ElasticBondsHelper extends BaseBondsHelper {
  private _nglIdxToItpIdx: { [nglIdx: number]: [number, number] } = {}; //[mol_idx, itp_idx]
  private _itpTupleToNglIdx: {
    [chainIdx: number]: { [itpIdx: number]: number };
  } = {}; //[mol_idx, itp_idx]
  protected constructor(stage: NglWrapper) {
    debugDebug(`ElasticBondsHelper constructor`);
    super(stage);
  }

  filter(
    predicate: (
      chain1: number,
      atom1: number,
      chain2: number,
      atom2: number,
      line: string,
    ) => boolean,
  ): BaseBondsHelper {
    const new_map: Relations = new ReversibleKeyMap();

    const new_one = new ElasticBondsHelper(this.representation.stage);

    // @ts-ignore
    new_one.representation = this.representation;

    new_one.relations = new_map;

    return new_one;
  }

  // For now we only try to load native elastic bond,
  // Only containing intrachain
  //add(chain:number, line: string): this;
  //add(chain:number, atom1: number, atom2: number, line: string): this;
  // IN VIRTUAL GO ATOM NUMBER ARE OFFSETED BY CHAINS
  add(
    chain1: number,
    atom1_or_line: number | string,
    chain2?: number,
    atom2?: number,
    line?: string,
  ) {
    //console.warn(`[ElasticBondsHelper:add] (${this.relations.count} entries) ${chain1}, ${atom1_or_line}, ${chain2}, ${atom2}, ${line}`);
    //GLA-WIP
    if (atom2 === undefined || line === undefined) {
      // This is used at startup, by readFromItps
      //debugLog(`[ElasticBondsHelper:add] adding a full line (${chain1}) ${atom1_or_line}`)
      // as string, '36 41 1 0.78964 500.0'
      // If interchain ware to happen here we should rely on offset number ?
      // We need offset chain count number here !
      // We hack the chainid field, for startup purposes
      // We will see if it holds edition
      if (typeof atom1_or_line === "string") {
        let [name1, name2] = atom1_or_line
          .split(ItpFile.BLANK_REGEX)
          .filter((e) => e);
        name1 = `${parseInt(name1) + chain1}`;
        name2 = `${parseInt(name2) + chain1}`;
        //  console.warn(`[ElasticBondsHelper:add] set relation ${chain1}:${name1}`,`${chain1}:${name2}`,atom1_or_line);
        this.relations.set(
          `${chain1}:${name1}`,
          `${chain1}:${name2}`,
          atom1_or_line,
        );
        //if (name1 !== name2){
        //    console.warn(`[ElasticBondsHelper:add] I need atom and chain pairwise info from this:${atom1_or_line}`);
        //if (!(chain in this.relations)) this.relations[chain] = new ReversibleKeyMap();
        //this.relations[chain].set(Number(name1), Number(name2), atom1_or_line);
        // }
      }
    } else if (typeof atom1_or_line === "number") {
      /*  if (atom1_or_line !== atom2)
            debugLog(`[ElasticBondsHelper:add] set relation ${chain1}:${atom1_or_line} , ${chain2}:${atom2} ${line}`)
      */
      //debugLog(`[ElasticBondsHelper:add] set relation ${chain1}:${atom1_or_line} , ${chain2}:${atom2} ${line}`)
      this.relations.set(
        `${chain1}:${atom1_or_line}`,
        `${chain2}:${atom2}`,
        line,
      );
      //if (!(chain in this.relations)) this.relations[chain] = new ReversibleKeyMap();
      //this.relations[chain].set(atom1_or_line, atom2, line);
    }

    //console.warn(`[ElasticBondsHelper:add] updated relation set holds ${this.relations.count} entries`);
    return this;
  }

  createRealLine(atom1: number, atom2: number): string {
    console.warn("[Real line creator] Atoms", atom1, "and", atom2, "??");
    if (atom1 === undefined || atom2 === undefined) {
      console.warn(
        "[Real line creator] Atoms",
        atom1,
        "and",
        atom2,
        "not found.",
      );
      return `${atom1} ${atom2} 6 0.5 500`;
    }

    // rm is distance between 2 martini go bonds
    // rm = (2^(1/6))*σ ≈ 1.122*σ
    // σ = rm*2^(-1/6)
    // Distance is in Angstrom, we expect it in nm (so we divide by 10)

    // Real index in object starts at 1, distance between take 0-starting indexes
    const rm =
      Math.abs(this.representation.distanceBetween(atom1 - 1, atom2 - 1)) / 10;
    const result = rm * 2 ** -(1 / 6);

    return `${atom1} ${atom2} 6 ${result.toPrecision(11)} 500.0`;
  }

  async toOriginalFiles(): Promise<MoleculeFile[]> {
    /*
        Produce a updated rubber band file
    */
    const canonicalElastic_itp = "molecule_0_rubber_band.itp";
    const new_files: MoleculeFile[] = [];
    // Only one single itp aka "molecule_0_rubber_band.itp"
    console.warn(
      `[ElasticBondsHelper:toOriginalFiles] writing ${this.relations.size} bonds into ${canonicalElastic_itp}`,
    );
    //for (const [chain,bonds] of this.relations.entries()){
    //console.warn(`[ElasticBondHelper:toOriginalFiles]I should write this:${bonds}`);
    //}
    const allSortedLines = this.getRelationLinesSorted(this.relations);
    /*debugLog("####");
    debugLog(s);
    for (const line of s){
        console.warn(`[ElasticBondHelper:toOriginalFiles]I should write this:${line}`);
    }*/
    const itp = ItpFile.readFromString("");

    itp.setField("bonds", ["; Rubber band"].concat(allSortedLines));
    new_files.push({
      file: new File([itp.toString()], canonicalElastic_itp, {
        type: "chemical/x-include-topology",
      }),
      mol_idx: 0,
    });

    return new Promise((resolve, reject) => resolve(new_files));
  }

  toJSON(): BaseBondsHelperJSON[] {
    const ret: BaseBondsHelperJSON[] = [];
    //GLA-TODO
    /*
    for (const [chain, bonds] of this.relations.entries()){
        ret.push({chain, relations: [...bonds.entries()]})
    }*/
    return ret;
  }

  clone() {
    const clone = ElasticBondsHelper.fromJSON(
      this.representation.stage,
      this.toJSON(),
    );
    // @ts-ignore
    clone.representation = this.representation;
    clone._nglIdxToItpIdx = this._nglIdxToItpIdx;

    return clone;
  }

  addToIdxMapper(mol_idx: number, itp_idx: number, ngl_idx: number) {
    if (ngl_idx in this._nglIdxToItpIdx)
      throw new Error(
        `ngl idx ${ngl_idx} already mapped to mol ${mol_idx} atom ${itp_idx}. Should not happen.`,
      );
    this._nglIdxToItpIdx[ngl_idx] = [mol_idx, itp_idx - 1];
  }

  nglIndexToRealIndex(ngl_idx: number) {
    return {
      index: this._nglIdxToItpIdx[ngl_idx][1],
      chain: this._nglIdxToItpIdx[ngl_idx][0],
    };
  }

  goIndexToRealIndex(ngl_idx: number) {
    /**
     * This is a missleading name
     *
     */
    console.warn("[ElasticBondsHelper:goIndexToRealIndex] dummy translation");

    return ngl_idx;
  }

  itpTupleToNglIndex(chainIdx: number, itpIndex: number) {
    /*
    console.warn(`_itpTupleToNglIdx accessing ${chainIdx}, ${itpIndex}`);
    debugDir(this._itpTupleToNglIdx)
    debugLog(typeof(chainIdx));
    debugLog(this._itpTupleToNglIdx[chainIdx])
    */
    return this._itpTupleToNglIdx[chainIdx][itpIndex];
  }

  static fromJSON(stage: NglWrapper, data: BaseBondsHelperJSON[]) {
    const obj = new ElasticBondsHelper(stage);

    const parsedRelations: Relations = new ReversibleKeyMap();

    //GLA-TODO
    /*
    for (const chainData of data){
        parsedRelations[chainData.chain] = new ReversibleKeyMap(chainData.relations)
    }
    */
    obj.relations = parsedRelations;

    return obj;
  }

  async createNglIndex(itp_files: { mol_idx?: number; content: File }[]) {
    const coor_itps = ElasticBondsHelper.itpFileSorter(
      "molecule_([0-9]+)\.itp",
      itp_files,
    );
    // console.error("CHECK COORD ITP ORDER ");
    // console.error(coor_itps);
    //const nglIdxMap: { [nglIdx: number]: [number, number]; } = {}
    let nglIdx = 1;
    let molIdx = 0;
    for (const itp of coor_itps) {
      const molecule = await ItpFile.read(itp.content);
      for (const atom of molecule.atoms) {
        const [index, name] = atom.split(ItpFile.BLANK_REGEX);
        const itpIndex = parseInt(index);
        if (isNaN(itpIndex)) throw new Error(`Atom index is not a number`);
        this._nglIdxToItpIdx[nglIdx] = [molIdx, itpIndex /* -1 TO CHECK */];
        if (!this._itpTupleToNglIdx.hasOwnProperty(molIdx))
          this._itpTupleToNglIdx[molIdx] = {};
        this._itpTupleToNglIdx[molIdx][itpIndex] = nglIdx;
        nglIdx++;
      }
      molIdx++;
    }
  }

  static itpFileSorter(
    regExpString: string,
    itp_files: { mol_idx?: number; content: File }[],
  ): { mol_idx?: number; content: File }[] {
    const re = new RegExp(regExpString);
    const coor_itp = itp_files
      .filter((itp_file) => itp_file.content.name.match(re))
      .sort((itp1, itp2) => {
        let _ = re.exec(itp1.content.name) as RegExpExecArray;
        const molCount1 = parseInt(_[0]);
        _ = re.exec(itp2.content.name) as RegExpExecArray;
        const molCount2 = parseInt(_[0]);
        if (molCount1 < molCount2) return -1;
        if (molCount1 > molCount2) return 1;
        return 0;
      });
    return coor_itp;
  }
  /*
    In principle water bias records could be created in elastic mode.
    While it can be achieved in the CLI, it is currently not avaible in GUI
    So the water_bias_records doesnt exist in this BaseBondHelper subclass
    contrarely to GoBondHelper class.
  */
  static async readFromItps(
    stage: NglWrapper,
    itp_files: { mol_idx?: number; content: File }[],
  ): Promise<ElasticBondsHelper> {
    console.warn(
      `[ElasticBondsHelper:readFromItps] with itp files ${itp_files}`,
    );
    const bonds = new ElasticBondsHelper(stage);

    if (bonds.bonds_itps.length !== 0) {
      console.warn(
        "Some itps for bonds are already registered on ElasticBondsHelper. It will erase them",
      );
      bonds.bonds_itps = [];
    }

    // Create NGL index
    // Where a tuple (mol_number, resid) is converted into an absolute resid starting at zero
    await bonds.createNglIndex(itp_files);

    let mol_idx = 0;
    for (const itpObj of ElasticBondsHelper.itpFileSorter(
      "molecule_([0-9]+)_rubber_band\.itp",
      itp_files,
    )) {
      const itp = itpObj.content;
      bonds.bonds_itps.push(itp);
      const molecule = await ItpFile.read(itp);
      const elastic_bonds = molecule.getSubfield("bonds", "Rubber band", false);
      if (elastic_bonds.length === 0)
        console.warn(`${itp.name} doesn't have elastic bonds`);
      for (const bond of elastic_bonds) {
        // console.warn("rubber_band bond specs: ", bond)
        let itp_bond_fields = bond.split(ItpFile.BLANK_REGEX).filter((e) => e);
        const name1 = bonds.itpTupleToNglIndex(
          mol_idx,
          parseInt(itp_bond_fields[0]),
        );
        const name2 = bonds.itpTupleToNglIndex(
          mol_idx,
          parseInt(itp_bond_fields[1]),
        );

        bonds.add(mol_idx, name1, mol_idx, name2, bond);
      }
      mol_idx += 1;
    }

    return bonds;
  }

  render(
    opacity = 0.2,
    hightlight_predicate?: (
      atom1_index: number,
      atom2_index: number,
      chain1: number | string,
      chain2: number | string,
    ) => boolean,
  ) {
    return this.representation.render(
      "elastic",
      this.bonds,
      opacity,
      hightlight_predicate,
    );
  }
}
