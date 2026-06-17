import { debugDir, debugLog } from "../../../logger";
import {
  SimulationNode,
  SimulationLink,
  NodeInjectSpec,
} from "../SimulationType";
import { makeNode } from "../PolymerViewer/nodeFactory";
import {
  CustomPolymer,
  NewLink,
  NewPolymer,
  UserModelItps,
  PipelineEnvironment,
} from "./types";
import { crossLink, fastaConvert } from "./simulationInterface";
import { extract_from_itp, Source } from "./parsers";
import ItpFile from "itp_mad_parser";
import CustomPolymerMap from "./customPolymerMap";
import { FileFromHttp } from "../../../types/entities";

/*
  A data structure to handle successive additions of models to a PolymerEditor instance
  Features:
    - add to viewer
    - display cotent in drop-down
    - generate ITP dependencies to send to backend


*/

interface UserStartModel {
  itps: UserModelItps;
  gro: FileFromHttp;
}
class CustomPolymerStash {
  private polyplyResName?: Set<string>; // For now, simple string of alias/resname
  private polyPlyLibrary: Record<
    string,
    Record<string, [string, string, string][]>
  > = {};
  private customConnectionRules: [string, string][] = [];
  private simulation?: d3.Simulation<SimulationNode, SimulationLink>;
  private _ff?: string;
  public availableID = -1;
  coordinates?: string;
  private stash: CustomPolymerMap = new CustomPolymerMap(); // Storing actual Itp-like definitions
  private baseLibraryElement?: string[];
  pushSuccessCallback?: (msg: string) => void;
  pushFailureCallback?: (msg: string) => void;
  pushWarningCallback?: (msg: string) => void;
  private _userStartModel?: UserStartModel;
  private _environments: Record<string, string> = {};

  set currentForcefield(ff: string) {
    this._ff = ff;
    if (!(ff in this.polyPlyLibrary)) throw `'${ff}' is not a valid forcefield`;
    // Get the resname of the current forcefield ignoring miscellaneous and
    const resnames = new Set<string>();
    const activeLib = this.polyPlyLibrary[this.currentForcefield];
    for (let cat in activeLib) {
      if (cat === "peptides" || cat === "miscellaneous") continue;
      activeLib[cat].forEach((items: [string, string, string]) => {
        if (resnames.has(items[2]))
          throw `Multiple definition of same building block '${items[2]}'`;
        resnames.add(items[2]);
      });
    }

    this.baseLibraryElement = Array.from(resnames);
  }

  // For now a simple stash for protein intial upload to replace the all state management of PolymerBuilder
  get userStartModel(): UserStartModel | undefined {
    return this._userStartModel;
  }
  setUserStartModel(gro: FileFromHttp, itps: FileFromHttp[]) {
    /*
    if (!model)
      console.warn(`[CustomPolymerStash:userStartModel] loading udnefined model`);
    */
    /*
    debugLog(`CustomPolymerStash:setUserStartModel] userStartModel is`);
    debugDir(this.userStartModel);
    */
    // separate molecule_X.itp and go_atomtypes.itp/go_nbparams.itp
    const moleculeItps = itps
      .filter((itp) => itp.name.match(/^molecule_(\d+)\.itp$/) != null)
      .sort((a, b) => {
        const x = a.name.match(/molecule_(\d+)\.itp/);
        const y = b.name.match(/molecule_(\d+)\.itp/);
        if (x === null || y === null)
          throw `Unexpected ITP name error ${a.name} ${b.name}`;
        return parseInt(x[1]) - parseInt(y[1]);
      });
    const goItps = itps.filter(
      (itp) => itp.name.match(/^go_(atomtypes|nbparams)\.itp$/) != null,
    );
    if (goItps.length !== 2 && goItps.length !== 0)
      throw `Provided Go model ITP files must be named 'go_atomtypes.itp' and 'go_nbparams.itp'`;

    const elasticItps = itps
      .filter(
        (itp) => itp.name.match(/^molecule_\d+_rubber_band\.itp$/) != null,
      )
      .sort((a, b) => {
        const x = a.name.match(/molecule_(\d+)_rubber_band\.itp/);
        const y = b.name.match(/molecule_(\d+)_rubber_band\.itp/);
        if (x === null || y === null)
          throw `Unexpected ITP name error ${a.name} ${b.name}`;
        return parseInt(x[1]) - parseInt(y[1]);
      });
    //debugLog(`[CustomPolymerStash:userStartPolymer] moleculeItps`);
    //debugDir(moleculeItps);
    //debugLog(`[CustomPolymerStash:userStartPolymer] goItps`);
    //debugDir(goItps);
    //debugLog(`[CustomPolymerStash:userStartPolymer] elasticItps`);
    //debugDir(elasticItps);
    if (moleculeItps.length === 0)
      throw `The provided ITP files must be named 'molecule_X.itp', with X consecutive integers`;
    this._userStartModel = {
      gro: gro,
      itps: {
        moleculeITP: moleculeItps,
        goITP: goItps.length === 2 ? [goItps[0], goItps[1]] : undefined,
        elasticITP: elasticItps.length === 0 ? undefined : elasticItps,
      },
    };

    //debugLog(`[CustomPolymerStash:userStartModel] following model loaded`);
    //debugLog(this._userStartModel);
  }
  get userStartPolymer(): NewPolymer | undefined {
    /**
     * Attempt to produce the node/link descritption of the user startup-uploaded molecule from its itp
     * As far as ITP files go, we allow:
     * - one or consecutive molecule_X.itp files [MANDATORY]
     * - a pair go_atomtypes.itp AND go_nbparams.itp [OPTIONAL]
     * - a molecule_X_rubber_band.itp foreach molecule_X.itp [OPTIONAL]
     */
    const newMolecule: SimulationNode[] = [];
    const newLinks: SimulationLink[] = [];
    if (this._userStartModel === undefined) {
      /*console.warn(
        `[CustomPolymerStash:generateNewPolymerFromItp] No model available`,
      );*/
      return undefined;
    }

    // Reading atoms
    // For now we offset other all atoms
    // We will check later if the molecule ihas proper count and resid value for the simulation
    const atomMap = new Map<string, SimulationNode>();
    const moleculeItps = this._userStartModel.itps.moleculeITP;

    const itpAllAtomCounts = new Array(moleculeItps.length).fill(0);
    const emptyOrCommentOrIncludeRegExp = /^[\s]*([;#].*){0,1}$/;
    moleculeItps.forEach((itp: FileFromHttp, itpRank) => {
      const src = ItpFile.readFromString(itp.content);

      const offset = itpAllAtomCounts.reduce((acc, curr) => acc + curr, 0);

      //console.warn(`[CustomPolymerStash:generateNewPolymerFromItp] reading atoms from ${itp.name}`);
      src.atoms.forEach((atom) => {
        const buffer = atom.split(/\s+/);
        const atomNumber: string = `${parseInt(buffer[0]) + offset}`;
        if (atomMap.has(atomNumber))
          console.error("Should not happen:", atomNumber, "already in map");
        if (buffer[4] !== "BB") return;
        const _ = makeNode({
          resname: buffer[3],
          seqid: itpRank,
          id: this.generateID(),
          is_composite: !this.isAtomicElement(buffer[3]),
          category: this.getPolymerCategory(buffer[3]),
          from_itp: extract_from_itp(src),
        });
        atomMap.set(atomNumber, _);
        newMolecule.push(_);
      });
      itpAllAtomCounts[itpRank] = src.atoms.length;

      //console.warn(`[CustomPolymerStash:generateNewPolymerFromItp] reading bonds from ${itp.name}`);
      let bboneBool = false;
      // Connectivity can come from bonds or constraints itp fields.
      [...src.bonds, ...src.constraints].forEach((bond, i) => {
        const m = bond.match(/^; (.*) bonds.*/);
        if (m !== null) {
          bboneBool = m[1] === "Backbone";
          return;
        }
        if (emptyOrCommentOrIncludeRegExp.test(bond)) return;
        if (!bboneBool) return;

        const buffer = bond.split(/\s+/);
        const a1: string = `${parseInt(buffer[0]) + offset}`;
        const a2: string = `${parseInt(buffer[1]) + offset}`;

        if (!(atomMap.has(a1) && atomMap.has(a2)))
          throw `[CustomPolymerStash:generateNewPolymerFromItp] Atom '${a1} (${buffer[0]})' or '${a2} (${buffer[1]})' not found in model`;

        //@ts-ignore
        //debugDir(crossLink(atomMap.get(a1), atomMap.get(a2)));
        //@ts-ignore
        newLinks.push(crossLink(atomMap.get(a1), atomMap.get(a2)));
      });
    });
    //console.warn(`[CustomPolymerStash:generateNewPolymerFromItp] loaded atomMap and links`);

    //debugDir(atomMap);

    return { newMolecule, newLinks };
  }
  get activeLibrary() {
    const ff = this.currentForcefield;
    if (ff !== "") return this.polyPlyLibrary[ff];
    return undefined;
  }
  private isAtomicElement(resname: string): boolean {
    //console.warn("CustomPolymerStash:isAtomicElement", resname);
    if (this.baseLibraryElement?.includes(resname)) return true;
    if (!this.stash.has(resname))
      throw `[CustomPolymerStash:isAtomicElement] Unrecognized element '${resname}'`;

    return (this.stash.get(resname) as CustomPolymer).isAtomic;
  }

  get currentForcefield() {
    return this._ff ?? "";
  }

  setCallbackUI(
    s: (msg: string) => void,
    f: (msg: string) => void,
    w: (msg: string) => void,
  ) {
    this.pushSuccessCallback = s;
    this.pushFailureCallback = f;
    this.pushWarningCallback = w;
  }
  setSimulation(simulation: d3.Simulation<SimulationNode, SimulationLink>) {
    this.simulation = simulation;
  }
  generateID(): string {
    this.availableID++;
    return this.availableID.toString();
  }
  resetID(value?: string) {
    this.availableID = value !== undefined ? parseInt(value) : -1;
  }
  decreaseID(i?: boolean) {
    if (i) this.availableID = -1;
    else this.availableID--;
  }
  getID(): string {
    return this.availableID.toString();
  }
  getPolyPlyLibrary(): Record<
    string,
    Record<string, [string, string, string][]>
  > {
    return this.polyPlyLibrary;
  }

  async parse(input: FileList) {
    try {
      if (!this.polyplyResName)
        throw "[CustomPolymerStash:parse] Unexpected missing polypy resname";

      if (input.length !== 1) throw "Only one file should be provided";
      const file = input[0];
      const currSource = new Source(file.name.split(".").slice(-1)[0]);
      const _ = await currSource.parser(file);
      //  [STASH_REFORGE:to_check] AND ???
    } catch (e) {
      if (this.pushFailureCallback !== undefined)
        this.pushFailureCallback(e as string);
    }
    return;
  }
  setPolyplyTypes(polyPlyLib: any) {
    // Extract resnames of current polyply library
    this.polyplyResName = new Set();
    for (let ff in polyPlyLib) {
      this.polyPlyLibrary[ff] = {};
      for (let cat in polyPlyLib[ff]) {
        this.polyPlyLibrary[ff][cat] = [];
        polyPlyLib[ff][cat].forEach((items: [string, string, string]) => {
          this.polyplyResName?.add(items[2]);
          this.polyPlyLibrary[ff][cat].push(items);
        });
      }
    }
    //console.warn('[CustomPolymerStash:setPolyplyTypes]');
    //debugDir(this.polyplyResName);
  }
  set environments(envs: any) {
    this._environments = { ...envs };
  }
  get environments() {
    return this._environments;
  }

  /*************  ✨ Codeium Command ⭐  *************/
  /**
   * Adds a new custom polymer to the stash.
   *
   * @param title - The title of the custom polymer.
   * @param content - The content representing the custom polymer.
   * @param format - The format of the content (e.g., "json", "fasta", "itp", "ff").
   */
  /******  9cb3dc2b-3575-4a65-abf0-cef2943be655  *******/
  async push(content: string, format: string, title?: string) {
    /*
    Add the content as a new molecule in custom section
  if no title is provided, try to extract it from the content
  We don't make ff correspondance check, ...
  */

    //debugLog(`[CustomPolymerStash:push] :\n${title}\n${format}\n${content}`);
    //debugLog(this);
    const src = new Source(format);

    try {
      const polymers = await src.parser(content);
      if (polymers.length === 0) throw `Your polymer looks empty`;
      if (title !== undefined && polymers.length !== 1)
        throw `A single name was provided for ${polymers.length} polymers to register`;
      //debugLog(polymers);
      polymers.forEach((polymer) => {
        if (polymer.name === "")
          if (title === undefined)
            throw "Can't register polymer without a name";
          else polymer.name = title;

        this.toStash(polymer, format, true);
        // Log non fatal action
        if (
          this.pushSuccessCallback !== undefined &&
          this.pushWarningCallback !== undefined
        ) {
          let msg = "";
          if (polymer.iTopology.nodeNumber > 0)
            msg += `'${polymer.name}' of ${polymer.iTopology.nodeNumber} blocks added to your polymer library!`;
          else
            msg += `'${polymer.name}'(${polymer.atoms.length} atoms, ${polymer.links.filter((t) => !t.startsWith(";")).length} bonds) added to your  polymer library!`;
          if (!polymer.isAtomic) this.pushWarningCallback(`Unsafe ${msg}`);
          else this.pushSuccessCallback(msg);
        }
      });
    } catch (e) {
      console.error(`[CustomPolymeStash:push] ${e}`);
      if (this.pushFailureCallback !== undefined)
        this.pushFailureCallback(e as string);
    }
    // debugLog(this.getPolyPlyLibrary());
  }

  private toStash(polymer: CustomPolymer, format: string, visible?: boolean) {
    /*
    Register CustomPolymer, if visibility is true also add it to the 'library' list
    Again ff compatiblity check is performed
    // isAtomic value is set based on ITP record, should consider JSON
    */
    /*
    console.warn(
      `[CustomPolymeStash:toStash] ${polymer.name} ${format} ${visible}`,
    );
    */

    if (
      this.stash.has(polymer.name) ||
      this.baseLibraryElement?.includes(polymer.name)
    )
      throw `A polymer named '${polymer.name}' is already in the library!`;
    if (format === "json") this.assertPolymerDefinition(polymer);

    //polymer.isAtomic = true; // default is safe
    // Check atomicity of the polymer
    const polymerResSet = new Set();
    polymer.atoms.forEach((atom) => {
      const buff = atom.split(/[\s]+/);
      polymerResSet.add(buff[2]);
    });

    polymer.isAtomic = !(polymerResSet.size > 1); // Empty atom record or a single residue
    this.stash.set(polymer.name, polymer);
    //console.warn("[CustomPolymerStash:toStash] stashing following element");
    //console.warn(polymer);
    if (!visible) return;

    /* Guess peptide status,
      if polymercustom topology is empty, it comes from an ITP,
        we assume it is not a peptide, may not always be true but hey ..
      if custom topology exist we simply check that all its element are AA
    */
    const isPeptide =
      polymer.iTopology.nodeNumber === 0
        ? false
        : polymer.iTopology.iNodes.reduce(
            (acc, node) => acc && fastaConvert(node.resname) !== undefined,
            true,
          );

    // Store representation in approproate submenu
    const opt_category = isPeptide ? "peptides" : "miscellaneous";
    /*console.warn(
      `[CustomPolymerStash:toStash] element being stashed into ${opt_category} menu category`,
    );*/
    let _ = this.polyPlyLibrary[this.currentForcefield];
    if (!_.hasOwnProperty(opt_category)) _[opt_category] = [];

    const libraryEndPoint: [string, string, string][] = _[opt_category];
    libraryEndPoint.push([polymer.name, "n/a", polymer.name]);
  }

  environPipeline(): PipelineEnvironment {
    /*
      For now only provided specs are ITP ones and GRO start model
      Not sure Start model ITP should be included (vsite ??)

      # above is not correct
      Setup JSON, ITP, GRO content require for starting a polyply run.
      If a GRO/ITP as protein was provided init cutom ITP
      Enumerate node / check they are miscel or custom -> append to custom ITP
    */

    const molecules_ITP = this.generateGlobalItp();
    const customLinks_ITP = this.customConnectionRules.reduce(
      (acc, curr, idx) => {
        const [_, itpConnectParagraph] = curr;
        return `${acc}\n;Custom link ${idx}\n${itpConnectParagraph}\n`;
      },
      "; User Custom Link Definitions\n\n",
    );
    const userStartITP = this.userStartModel?.itps ?? undefined;
    const userStartGRO = this.userStartModel?.gro ?? undefined;
    return {
      customITP: {
        customMolecules: molecules_ITP,
        customLinks: customLinks_ITP,
        userStart: userStartITP,
      },
      forcefield: this.currentForcefield,
      userStartGRO,
    };
  }

  private generateGlobalItp(): string | undefined {
    /**
     * generate the required ITP content for a list of custom molecule added to the graph
     * Concatenate itp string represnetaion of all custom/miscellaneous molecules
     * Model provided as JSON topology only are skiped as they hold no ITP/CG definitions
     */
    /*console.warn(
      `[CustomPolymerStash:generateGlobalItp] About to wrap ${this.stash.size} uploaded polymer definitions`,
    );*/
    if (this.stash.size === 0) return undefined;
    let globalITP = "";
    this.stash.forEach((polymer: CustomPolymer, polymerName: string) => {
      if (!polymer.rawItp) {
        /*console.warn(
          `[CustomPolymerStash:globalItp] ${polymer.name} has no itp, skiping it`,
        );*/
      }
      globalITP += "\n;New polymer;\n;\n" + polymer.rawItp;
    });

    return globalITP;
  }

  addConnectionRules(name: string, itpLines: string) {
    this.customConnectionRules.push([name, itpLines]);
  }
  getItpFile(name: string): ItpFile | undefined {
    console.error("[CustomStash:getItpFile] Not implemented");
    //debugLog(this.activeLibrary);
    return undefined;
  }

  checkSetForcefield(forcefield: string): boolean {
    /*
      When no ff has yet been selected the passed force field number is used as a setter.
      When set, the forcefield must be a registered one.
      Once ff has been set, the passed force field number is checked against the current one.
    */
    if (!this.polyPlyLibrary.hasOwnProperty(forcefield))
      throw `[CustomPolymerStash:setForcefield] Forcefield "${forcefield}"not found`;
    if (this.currentForcefield === "") this.currentForcefield = forcefield;

    return this.currentForcefield === forcefield;
  }

  createSimulationLink(id1: string, id2: string): SimulationLink {
    const pair = this.simulation
      ?.nodes()
      .filter((n) => n.id === id1 || n.id === id2);
    if (!pair) throw "Unable to select nodes to link";
    if (pair.length !== 2) {
      throw "Unable to select nodes to link";
    }
    const [n1, n2] = pair;
    let newlink: NewLink = {
      source: n1,
      target: n2,
    };

    // This is fishy
    pair.forEach((n) => {
      if (!n.links) n.links = [];
    });
    n1.links?.push(n2);
    n2.links?.push(n1);

    return newlink;
  }

  private getPolymerCategory(polymerName: string): string | undefined {
    //debugLog("CustomPolymerStash:getPolymerCategory for ", polymerName);
    const activeLibrary = this.activeLibrary;
    //debugLog(activeLibrary);
    if (!activeLibrary) return undefined;
    for (const [cat, mols] of Object.entries(activeLibrary)) {
      if (mols.find((mol) => mol[2] === polymerName)) return cat;
    }
    return undefined;
  }
  private buildNewHomoPolymer = (
    buildingBlockName: string,
    size: number,
  ): NewPolymer => {
    /*  debugLog(
      `[CustomPolymerStash:buildNewHomoPolymer] ${buildingBlockName}`,
    );*/
    let newMolecule: SimulationNode[] = [];
    let newLinks: SimulationLink[] = [];
    for (let i = 0; i < size; i++) {
      /*debugLog(
        `[CustomPolymerStash:buildNewHomoPolymer]: ${buildingBlockName} block ${i}`,
      );*/
      const customPolymer = this.mayExpand(buildingBlockName); // Try to unfold building block as a linear polymer itself
      //debugLog(customPolymer);

      if (customPolymer !== undefined) {
        if (i > 0)
          // Bind current block with previous
          newLinks.push(
            crossLink(
              newMolecule[newMolecule.length - 1],
              customPolymer.newMolecule[0],
            ),
          );
        // Register current block
        newMolecule = newMolecule.concat(customPolymer.newMolecule);
        newLinks = newLinks.concat(customPolymer.newLinks);
        continue;
      }
      //console.error(`Current block '${buildingBlockName}'is non expandale`);
      // Building block is not a stash element, It MUST be a list of atomic
      // components, eg:peptide
      if (!this.isAtomicElement(buildingBlockName))
        throw `The molecule '${buildingBlockName}' is not safe, SHOULD NOT HAPPEN`;

      /* console.warn("CATEGORY ACCESS ?? for " + buildingBlockName);
      console.warn(this.polyPlyLibrary);
      console.warn(this.getPolymerCategory(buildingBlockName));*/

      newMolecule.push(
        makeNode({
          // TODO:GL RESUME ATTACHING CATEGORY
          resname: buildingBlockName,
          seqid: 0,
          id: this.generateID(),
          category: this.getPolymerCategory(buildingBlockName),
          is_composite: false,
          //   from_itp:: undefined //
        }),
      );
      if (i > 0)
        newLinks.push(
          crossLink(
            newMolecule[newMolecule.length - 1],
            newMolecule[newMolecule.length - 2],
          ),
        );
    }
    return { newMolecule, newLinks };
  };
  createSimulationPolymer(toadd: NodeInjectSpec): NewPolymer {
    /*
    Return the Simulation Node and Links representing desired polymer to
    upadate the d3 simulation
    */

    if (toadd.add_to_every_residue) {
      if (!this.simulation) throw "No simulation loaded";
      const anchorNodeList = this.simulation!.nodes().filter(
        (node: SimulationNode) => node.resname === toadd.add_to_every_residue,
      );
      if (anchorNodeList.length === 0)
        throw `The residue '${toadd.add_to_every_residue}' is not present in your current polymer."`;

      /*
      debugLog(
        `[CustomPolymerStash:createSimulationPolymer::add_to_every_residue]`,
      );
      */
      //debugLog(toadd);

      let newMolecule: SimulationNode[] = [];
      let newLinks: NewLink[] = [];
      for (let n of anchorNodeList) {
        const newSubPolymer = this.buildNewHomoPolymer(
          toadd.moleculeToAdd,
          toadd.numberToAdd,
        );
        newLinks.push(crossLink(n, newSubPolymer.newMolecule[0]));
        newMolecule = newMolecule.concat(newSubPolymer.newMolecule);
        newLinks = newLinks.concat(newSubPolymer.newLinks);
      }
      return { newMolecule, newLinks };
    }

    //debugLog(`[CustomPolymerStash:createSimulationPolymer::no anchor]`);
    //debugLog(toadd);
    const { newMolecule, newLinks } = this.buildNewHomoPolymer(
      toadd.moleculeToAdd,
      toadd.numberToAdd,
    );
    //debugLog(`[CustomPolymerStash:createSimulationPolymer] Returning`);
    //debugLog({ newMolecule, newLinks });
    return { newMolecule, newLinks };
  }

  private assertPolymerDefinition(polymer: CustomPolymer): void {
    /** Raise an exception if any constituent of the polymer is not atomic
     *  It is intended to be used on about to stash alement coming from a
     * JSON hierarchy
     * We may have to merge/apply it to itp topology ?
     */

    polymer.iTopology.iNodes.forEach((node) => {
      try {
        const _ = this.isAtomicElement(node.resname);
      } catch (_: any) {
        //console.error("Fatal CustomPolymer Topology check on curretn stash");
        //console.warn(this.stash);
        throw `Polymer '${polymer.name}' contains unknown element '${node.resname}'`;
      }
    });
  }
  private mayExpand(moleculeName: string): NewPolymer | undefined {
    // To be expandable, it must be a peptide or an expandable miscellaneous element
    // We recursively try to expand its elements, if one sinle non atomic element is encountered
    // The top-level polymer is considered non expandable

    //debugLog(`[CustomPolymerStash::mayExpand] ${moleculeName}`);
    //debugLog(this.baseLibraryElement);

    if (this.baseLibraryElement?.includes(moleculeName)) return undefined;
    const customPolymer = this.stash.get(moleculeName);
    if (!customPolymer)
      throw `A polymer named '${moleculeName}' is not in the library!`;
    /*debugLog(
      `[CustomPolymerStash::mayExpand] ${moleculeName} polymer block is`,
    );
    debugLog(customPolymer);
    */
    // This custom polymer doesn't feature components, we just return it
    if (customPolymer.iTopology.nodeNumber == 0)
      return {
        newMolecule: [
          makeNode({
            resname: moleculeName,
            seqid: 0,
            id: this.generateID(),
            is_composite: !customPolymer.isAtomic,
            category: this.getPolymerCategory(moleculeName),
            from_itp: customPolymer?.from_itp,
          }),
        ],
        newLinks: [],
      };

    let newMolecule: SimulationNode[] = [];
    let newLinks: SimulationLink[] = [];

    const backupID = this.availableID.toString(); // memo the currently used ID
    let safe = true;
    let idx = 0;
    customPolymer.iTopology.iNodes.forEach((e) => {
      if (!safe) return;

      if (this.isAtomicElement(e.resname)) {
        newMolecule.push(
          makeNode({
            // TO DO: ATTACH CATEGORY PROPERTY
            resname: e.resname,
            seqid: 0, // This will have to be fixed ? or is it later handled by the simulation ?
            id: this.generateID(),
            is_composite: false,
            category: this.getPolymerCategory(e.resname),
          }),
        );
        if (idx > 0)
          newLinks.push(crossLink(newMolecule[idx - 1], newMolecule[idx]));
        idx += 1;
        return;
      }

      // try to expand this non atomic element
      const _ = this.mayExpand(e.resname);
      if (_ === undefined) {
        safe = false;
        return;
      }

      // it is not atomic and was expanded, we append its compistion to newMolecule
      if (newMolecule.length > 0)
        newLinks.push(
          crossLink(newMolecule[newMolecule.length - 1], _.newMolecule[0]),
        );
      newMolecule /*= newMolecule*/ = newMolecule.concat(_.newMolecule);
      newLinks = newLinks.concat(_.newLinks);
      idx += _.newMolecule.length;
    });
    if (!safe) {
      this.resetID(backupID);
      /*  console.warn(
        `[CustomPolymerStash::mayExpand] ${moleculeName} is returned as not expandable`,
      );
      */
      return undefined;
    }
    // Go through all the node and set ID
    return { newMolecule, newLinks };
  }
}

export default new CustomPolymerStash();
