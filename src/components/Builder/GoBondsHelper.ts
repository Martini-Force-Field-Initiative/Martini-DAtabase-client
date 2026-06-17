import { debugDir, debugLog } from '../../logger';
//import ItpFile from 'itp-parser-forked';
import ItpFile from "itp_mad_parser";
import ReversibleKeyMap from "reversible-key-map";
import NglWrapper from "./NglWrapper";
import BaseBondsHelper, {
  BaseBondsHelperJSON,
  BondMember,
  Relations,
} from "./BaseBondsHelper";
import { MoleculeFile } from "../../types/entities";

type GoAtomName = string;
//type GoRelations = ReversibleKeyMap<GoAtomName, GoAtomName, string>;
type IndexToName = { [index: number]: string };
type NameToIndex = { [name: string]: number };
type IndexToReal = { [index: number]: number };
type RealToIndex = { [index: number]: number };

export interface GoBondsHelperJSON extends BaseBondsHelperJSON {
  real_to_index: RealToIndex;
  name_to_index: NameToIndex;
  relations: [[string, string], string][];
}

interface bondPotentialParameters {
  epsilon: number;
}

/**
 * Handle boilerplate for Go bond creation, removal and sync modifications with ITP files.
 */
export default class GoBondsHelper extends BaseBondsHelper {
  protected water_bias_records: string[] = [];
  /** Define the constructor as protected */
  protected constructor(
    stage: NglWrapper,
    public index_to_real: IndexToReal = {},
    protected name_to_index: NameToIndex = {},
    protected index_to_name: IndexToName = {},
    protected real_to_index: RealToIndex = {},
  ) {
    super(stage);
  }

  /** Get bonds related to an go atom. */
  // findBondsOf(atom_name: GoAtomName) {
  //   const keys = this.relations.getAllFrom(atom_name)?.keys();
  //   return keys ? [...keys] : [];
  // }

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
      "go",
      this.bonds,
      opacity,
      hightlight_predicate,
    );
  }

  /* GO ACCESSORS */

  goIndexToGoName(index: number) {
    return this.index_to_name[index];
  }

  goIndexToRealIndex(index: number) {
    return this.index_to_real[index];
  }

  goNameToGoIndex(name: GoAtomName) {
    /*  debugLog("goNametoGoIndex input: " + name);
    debugDir(this.name_to_index);*/
    return this.name_to_index[name];
  }

  goNameToRealIndex(name: GoAtomName) {
    return this.goIndexToRealIndex(this.goNameToGoIndex(name));
  }

  realIndexToGoIndex(index: number) {
    debugLog("realIndexToGoIndex input: " + index);
    debugDir(this.real_to_index);
    return this.real_to_index[index];
  }

  realIndexToGoName(index: number) {
    debugLog("realIndexToGoName start input " + index);

    return this.goIndexToGoName(this.realIndexToGoIndex(index));
  }

  /* OPERATIONS INSIDE THE OBJECT */
  updateLJ(
    opt: bondPotentialParameters,
    bondsToUpdate: [BondMember, BondMember, string][],
  ) {
    const epsilon = opt.epsilon.toPrecision(11);
    for (const [a1, a2, line] of bondsToUpdate) {
      const k1 = `${a1.chain}:${a1.realIdx}`;
      const k2 = `${a2.chain}:${a2.realIdx}`;

      const newLine = line.replace(/ ([0-9.]+)[\s]+;/, ` ${epsilon} ;`);
      debugLog("ApplyLJ from " + line + " to " + newLine);
      this.relations.set(k1, k2, newLine);
    }
  }
  /**
   * Create a new go bonds set through a filter.
   */
  // @ts-ignore
  filter(
    predicate: (
      chain1: number,
      atom1: number,
      chain2: number,
      atom2: number,
      line: string,
    ) => boolean,
  ) {
    const new_map: Relations = new ReversibleKeyMap();

    for (const [[ch_at_1, ch_at_2], line] of this.relations.entries()) {
      const [chain1, atom1] = ch_at_1.split(":").map(parseInt);
      const [chain2, atom2] = ch_at_2.split(":").map(parseInt);
      if (predicate(chain1, atom1, chain2, atom2, line))
        new_map.set(ch_at_1, ch_at_2, line);
    }

    // Create a copy of current object
    const new_one = new GoBondsHelper(
      this.representation.stage,
      this.index_to_real,
      this.name_to_index,
      this.index_to_name,
      this.real_to_index,
    );

    // @ts-ignore
    new_one.representation = this.representation;

    new_one.relations = new_map;

    return new_one;
  }

  /**
   * Add a new line from the UI from the loading stage
   */
  //add(chain: number, line: string): this;
  //add(chain: number, atom1: number, atom2: number, line: string): this;
  add(
    chain1: number | string,
    atom1_or_line: number | string,
    chain2?: number | string,
    atom2?: number,
    line?: string,
  ) {
    debugLog(
      `[GoBondHelper:add] ${chain1}, ${atom1_or_line}, ${chain2}, ${atom2}, ${line}`,
    );
    if (atom2 === undefined || line === undefined) {
      // atom1 is a full line
      if (typeof atom1_or_line === "string") {
        console.error(
          "GoBondHelper:add] adding through string is not implemented",
        );
        debugLog(
          `[GoBondHelper:add] adding a full line (${chain1}) ${atom1_or_line}`,
        );
        const [name1, name2] = atom1_or_line
          .split(ItpFile.BLANK_REGEX)
          .filter((e) => e);
        if (name1 !== name2) {
          console.warn(
            `[GoBondHelper:add] I need atom and chain pairwise info from this:${atom1_or_line}`,
          );
          // GLA-TODO
          //if (!(chain in this.relations)) this.relations[chain] = new ReversibleKeyMap();
          //this.relations[chain].set(this.goNameToRealIndex(name1), this.goNameToRealIndex(name2), atom1_or_line);
        }
      }
    } // atom2 is defined
    else if (typeof atom1_or_line === "number") {
      // This is used at startup, by readFromItps
      if (atom1_or_line !== atom2 || chain1 !== chain2)
        debugLog(
          `[GoBondHelper:add] set relation ${chain1}:${atom1_or_line} , ${chain2}:${atom2} ${line}`,
        );
      this.relations.set(
        `${chain1}:${atom1_or_line}`,
        `${chain2}:${atom2}`,
        line,
      );
      //GLA-- following two lines should be replaced by the one above
      //if (!(chain in this.relations)) this.relations[chain] = new ReversibleKeyMap();
      //this.relations[chain].set(atom1_or_line, atom2, line);
    }

    return this;
  }

  /*
  createFakeLine(atom1: GoAtomName, atom2: GoAtomName) {
    return `${atom1}    ${atom2}    1  0.7923518221  9.4140000000`;
  }
  */

  createRealLine(ri1: number, ri2: number) {
    const atom1 = this.realIndexToGoName(ri1);
    const atom2 = this.realIndexToGoName(ri2);

    if (atom1 === undefined || atom2 === undefined) {
      console.warn(
        "[Real line creator] Atoms",
        atom1,
        "and",
        atom2,
        "not found.",
      );
      return `${atom1}    ${atom2}    1  0.7923518221  9.4140000000`;
    }

    // rm is distance between 2 martini go bonds
    // rm = (2^(1/6))*σ ≈ 1.122*σ
    // σ = rm*2^(-1/6)
    // Distance is in Angstrom, we expect it in nm (so we divide by 10)

    // Real index in object starts at 1, distance between take 0-starting indexes

    const d_nano =
      Math.abs(this.representation.distanceBetween(ri1 - 1, ri2 - 1)) / 10;
    const result = d_nano * 2 ** -(1 / 6);

    return `${atom1} ${atom2} 1 ${result.toPrecision(11)} 9.4140000000 ;mad bond ${d_nano.toPrecision(11)}`;
  }

  /* COMPUTED ITP FILES */

  /**
   * Try to rebuild the original files with their original names.
   * Index is always the last file of the array.
   */
  /**
   * Try to rebuild the original files with their original names.
   * Index is always the last file of the array.
   *
   * In current GO martinize2 scen,ario only go_nbparams.itp needsto be updated
   */
  toOriginalFiles(): Promise<MoleculeFile[]> {
    return new Promise((res, rej) => {
      try {
        //const files: { [molecule_name: string]: string } = Object.create(null);
        let goNbParamFileContent = "[ nonbond_params ]\n";
        for (const [[ch_atom_1, ch_atom_2], line] of this.relations) {
          debugLog(
            `[GoBondsHelper::toOriginalFiles] ${ch_atom_1} ${ch_atom_2} ${line}`,
          );
          const index1 = parseInt(ch_atom_1.split(":")[1]); // Modified out of single set remove bond
          let name1 = this.realIndexToGoName(index1);
          const mol_type_arr = /^(\w+)_\d+$/.exec(name1); //[ "molecule_0_243", "molecule_0" ]

          if (!mol_type_arr) {
            console.warn(
              `[GoBondsHelper:toOriginalFiles] Ca ne matche pas : ${name1}`,
            );
            continue;
          }
          goNbParamFileContent += line + "\n";
        }
        // Appending original water bias records
        goNbParamFileContent += this.water_bias_records.join("\n") + "\n";
        const moleculeFileArray = [
          {
            file: new File([goNbParamFileContent], "go_nbparams.itp", {
              type: "chemical/x-include-topology",
            }),
            mol_idx: 0,
          },
        ]; // One element array

        res(moleculeFileArray);
      } catch (e) {
        rej(e);
      }
    });
  }
  /**
   * Get the compiled go bonds inside a single ITP, plus the index.
   */
  toCompiledFiles() {
    const compiled_filename = "compiled__go-table_VirtGoSites.itp";
    const index_filename = "go-table_VirtGoSites.itp";

    const go_table_index = new File(
      [this.toIndexString(compiled_filename)],
      index_filename,
      { type: "chemical/x-include-topology" },
    );
    const compiled_itp = new File([this.toString()], compiled_filename, {
      type: "chemical/x-include-topology",
    });

    return {
      index: go_table_index,
      itp: compiled_itp,
    };
  }

  toIndexString(name = "compiled__go-table_VirtGoSites.itp") {
    return `#include "${name}"\n`;
  }

  /* SERIALIZATION */

  toJSON(): GoBondsHelperJSON[] {
    return [
      {
        real_to_index: this.real_to_index,
        name_to_index: this.name_to_index,
        relations: [...this.relations.entries()],
        chain: 0,
      },
    ];
  }

  clone() {
    const clone = GoBondsHelper.fromJSON(
      this.representation.stage,
      this.toJSON(),
    );
    // @ts-ignore
    clone.representation = this.representation;

    return clone;
  }

  /* STATIC CONSTRUCTORS */

  /**
   * Construct a GoBondsHelper from a save made with `instance.toJSON()`.
   */
  static fromJSON(stage: NglWrapper, data: GoBondsHelperJSON[]) {
    const index_to_name: IndexToName = {};
    const index_to_real: IndexToReal = {};

    // Create the non saved properties
    for (const prop in data[0].name_to_index) {
      index_to_name[data[0].name_to_index[prop]] = prop;
    }
    for (const prop in data[0].real_to_index) {
      index_to_real[data[0].real_to_index[prop]] = Number(prop);
    }

    const obj = new GoBondsHelper(
      stage,
      index_to_real,
      data[0].name_to_index,
      index_to_name,
      data[0].real_to_index,
    );
    // GLA-nextg line to check
    obj.relations = new ReversibleKeyMap(data[0].relations);

    return obj;
  }
  /*
  *_go-table_VirtGoSites.itp are now all concatenated inside go_nbparams.itp
  molecule_0.itp holds inside '[ atoms ]' section the two, first beads and then Vsite definitions sections
  and a third section ';Virtual go site' for their mapping
  [ atoms ]
  1 P6               1 GLU BB    1    0
  2 Q5n              1 GLU SC1   2 -1.0
  3 SP1              2 GLY BB    3  0.0
  ...
  374 molecule_0_10   10 ALA CA  374    0 0.0
  375 molecule_0_11   11 ASP CA  375    0 0.0
  376 molecule_0_12   12 ALA CA  376    0 0.0
  377 molecule_0_13   13 ALA CA  377    0 0.0
  ...
  ; Virtual go site
  679 1   1
  680 1   3
  681 1   5
  682 1   7
  683 1  10
  684 1  12
  685 1  14
  686 1  16
  687 1  21
  688 1  24
  */

  static async readFromItps(
    stage: NglWrapper,
    itp_files: File[],
  ): Promise<GoBondsHelper> {
    debugLog(`[GoBondHelper:readFromItps] Starting !!!`);
    const bonds = new GoBondsHelper(stage);
    const goBondFile = itp_files.find((e) => e.name === "go_nbparams.itp");
    const moleculeFile = itp_files.find((e) => e.name === "molecule_0.itp");

    if (!goBondFile) {
      throw new Error("Need the goBondFile file.");
    }
    if (!moleculeFile) {
      throw new Error("Need the moleculeFile file.");
    }

    // Read molecule ITP
    const molecule = await ItpFile.read(moleculeFile);
    const prefix = "molecule_0";

    // Step 1: Find atoms that name start by "{molecule_type}_" in category "atoms"
    debugLog(
      `[GO-VIRT] file ${moleculeFile} holds ${molecule.atoms.length} atoms`,
    );
    for (const atom_line of molecule.atoms) {
      //      debugLog(atom_line);
      // Typical line is :
      // 2575 molecule_0_9       9 LYS CA  2575    0

      const [index, name] = atom_line.split(ItpFile.BLANK_REGEX);
      if (!name.startsWith(prefix)) continue;
      const index_corrected = Number(index);
      bonds.name_to_index[name] = index_corrected;
      bonds.index_to_name[index_corrected] = name;
      // debugLog(`[GO-VIRT] itp.atoms, mapping atom name ${name} to index ${index}`);
    }

    // Step 2: Associate go atom index => real atom index
    let seen_virt_comment = false;
    for (const virt_line of molecule.virtual_sites) {
      if (virt_line.startsWith("; Virtual go site")) {
        seen_virt_comment = true;
        continue;
      }

      if (!seen_virt_comment) continue;

      // Typical line is:
      // 2575 1    1
      const [go_index, , real_index] = virt_line.split(ItpFile.BLANK_REGEX);
      const go_index_corrected = Number(go_index);
      const real_index_corrected = Number(real_index);

      bonds.index_to_real[go_index_corrected] = real_index_corrected;
      bonds.real_to_index[real_index_corrected] = go_index_corrected;
      debugLog(
        `[Builder:readFromItps]${go_index_corrected}<virtPart, realPart>${real_index_corrected} ## ${virt_line}`,
      );
    }

    // Clean the ITP (we don't need it anymore)
    molecule.dispose();
    const table = await goBondFile.text();
    // Step 3+4: Read bonds between go atoms and associate them
    for (const line of table.split("\n").filter((s) => s !== "")) {
      if (line.startsWith(";") || line.startsWith("[")) {
        continue;
      }
      if (line.startsWith("W molecule")) {
        bonds.water_bias_records.push(line);
        continue;
      }
      //debugLog(`[GO-VIRT-SITES] bond input @ ${line}`);
      // Typical line is (may begin by spaces.)
      // molecule_0_9  molecule_0_14    1  0.7369739126  9.4140000000  ;  24  36  0.827

      // filter trim blank spaces created by regex
      const [name1, name2] = line.split(ItpFile.BLANK_REGEX);
      //debugLog(`${line} -->> name1-name2 "${name1}"-"${name2}"`);
      const go_index_1 = bonds.goNameToGoIndex(name1),
        go_index_2 = bonds.goNameToGoIndex(name2);
      debugLog(`[GoBondHelper::goNameToGoIndex] ${name1} -> ${go_index_1}`);
      if (go_index_1 === undefined || go_index_2 === undefined) {
        console.warn(
          `[GO-VIRT-SITES] [ Undefined go indexes for names ${name1}-${name2}. This should not happen...`,
        );
        continue;
      }

      const real_index_1 = bonds.goIndexToRealIndex(go_index_1),
        real_index_2 = bonds.goIndexToRealIndex(go_index_2);
      debugLog(
        `[GoBondHelper::goIndexToRealIndex] ${go_index_1} -> ${real_index_1}`,
      );

      if (real_index_1 === undefined || real_index_2 === undefined) {
        console.warn(
          `[GO-VIRT-SITES] [ Undefined real indexes for names ${name1}(${go_index_1})-${name2}(${go_index_2}). This should not happen...`,
        );
        continue;
      }

      // We add the bonds in the object
      debugLog(
        `[GoBondHelpers:readFromItps] GO bond add (0 chain filler) for ${real_index_1}, ${real_index_2} :: ${line}`,
      );
      bonds.add(0, real_index_1, 0, real_index_2, line);
    }

    return bonds;
  }
}
