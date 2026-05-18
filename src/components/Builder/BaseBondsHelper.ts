import NglWrapper from './NglWrapper';
import { BondsRepresentation } from './BondsRepresentation';
import ReversibleKeyMap from 'reversible-key-map';
import { MoleculeFile, ElasticOrGoBounds } from '../../types/entities'
//import ItpFile from 'itp-parser-forked';
import ItpFile from 'itp_mad_parser';

export type Relations = ReversibleKeyMap<string, string, string> //['chainID:realIndex', 'chainID:realIndex'], line

export interface BaseBondsHelperJSON { // GLA-- NOT checked for syntax yet
  relations: [[string, string], string][];
  chain : number; 
}

export interface BondMember {
  chain:string|number;
  realIdx:number;
};

export default abstract class BaseBondsHelper {

    /**
     * VAtom 1 <> VAtom 2: ITP line
     */
    public relations: Relations = new ReversibleKeyMap();
    protected _frozenRelations: Relations = new ReversibleKeyMap();
    public readonly representation: BondsRepresentation;

    protected history: Relations[] = [];
    protected reverse_history: Relations[] = [];
    protected constructor(stage: NglWrapper) {
        this.representation = new BondsRepresentation(stage);
    }
    protected currentBonds: Array<string> = [];//GLA [''];
    protected customBonds: Array<Array<string>> = [];
    protected lastCustomBonds: Array<Array<string>> = [];
    protected bonds_itps: File[] = []; 
    freeze() {
     /**
      * Create a frozen copy of bonds, used to restore to default  
      * */ 
     if( this._frozenRelations.count !== 0)
        throw new Error("Freezing an intial Go/elastic bond definition into a non empty KeyMap");

     for ( const [[_src, _tgt], line] of  this.relations.entries() )
      this._frozenRelations.set(_src, _tgt, line);

    }
    restoreBonds(){
      this.relations = new ReversibleKeyMap();
      for ( const [[_src, _tgt], line] of  this._frozenRelations.entries() )
        this.relations.set(_src, _tgt, line);
    }
    /**
     * Restore the Go/Elastic bonds collection to its initial state out of martinized ITP.
    */
    restore(mode:'go'|'elastic'){   
      console.log("[BaseBondHelper] Restoring Go/Elastic bonds to initial state");
      this.clearBondRepr()
      this.restoreBonds(); 
      this.historyClear();
      const bondsToDraw = this.bonds; 
      
      this.representation.render(mode, bondsToDraw, 1.); 
    }

    bondForEach(fn:(a1:BondMember, a2:BondMember, data:string)=>any) {
      /**
       * Call callback function on each relation
       */
      for ( const [[_src, _tgt], line] of  this.relations.entries() ) {       
        let _ = _src.split(':');
        const src = { chain: _[0], realIdx:parseInt(_[1]) };
        _ = _tgt.split(':');
        const tgt = { chain: _[0], realIdx:parseInt(_[1]) };
        fn(src, tgt, line);
      }
    }
    /**
     * Remove all representation of bonds currently in relations
     */

    clearBondRepr() {
      this.bondForEach( (s,t,d)=> {     
        console.log(`[BaseBondHelper:clearBonRepr] Trying to remove ${s.chain}:${s.realIdx} - ${t.chain}:${t.realIdx}`);
        this.remove(s.chain, s.realIdx, t.chain, t.realIdx);
      });     
    }
    matchBonds( predicate:(src:BondMember, tgt:BondMember)=>boolean) : [src:BondMember,tgt:BondMember,line:string][] {
      /* Returns the list of [ [atom1, atom2], line ] bonds that satisfies provided predicate
        the predicate will be passed each atom1 and atom2 pairs as BondMember arguments
      */
      const bondMatch:[src:BondMember,tgt:BondMember,line:string][] = [];

      this.bondForEach( (src, tgt, line) => { 
        /*
        console.warn(`[BaseBondHelper:matchBonds] ${line}`);
        console.warn(src);
        console.warn(tgt);
        */

         if ( predicate(src, tgt) )
            bondMatch.push([src, tgt, line]);
      });

      return bondMatch;
    }

    /** Get bonds related to an go atom. */
  findBondsOf(atom_name: number, chain:number|string) : [partner:BondMember, data:string][] {
    const res:[partner:BondMember, data:string][] = [];
    for (  let [p1, data] of this.relations.getAllFrom(`${chain}:${atom_name}`).entries() ) {
      const [c,a] = p1.split(':') as [string, string];
      res.push( [{ chain:c, realIdx:parseInt(a) } as BondMember, data] )
    }
    return res;
  }
  /** Add the chainID of the interacting residue pairs
  */
  stringifyChainIdBonds() {
    //console.log(`[BaseBondHelper:stringifyChainIdBonds]`)
    const chainEditedRelations:Relations = new ReversibleKeyMap();
    for (let [[ch_at_1, ch_at_2], data] of this.relations.entries() ) {
      //console.log("stringifyChainIdBonds: updating ", ch_at_1, ch_at_2, data);
      let [c1, a1] = ch_at_1.split(':');
      let [c2, a2] = ch_at_2.split(':');
      c1 = this.representation.getAtomProxy(parseInt(a1)).chainname;
      c2 = this.representation.getAtomProxy(parseInt(a2)).chainname;
      chainEditedRelations.set(`${c1}:${a1}`,`${c2}:${a2}`, data);
      //console.log(`stringifyChainIdBonds: into ${c1}:${a1},${c2}:${a2}, ${data}`);
    }
    this.relations = chainEditedRelations;
    //console.log(`[BaseBondHelper:stringifyChainIdBonds] relations updated`);
    //console.log(this.relations);
  }

  addCustomBonds(chain1:number|string, atom1: any, chain2:number|string, atom2: any) {
    this.currentBonds.push(`added bond from ${chain1}:${atom1} to ${chain2}:${atom2}`);
  }

  rmCustomBonds(chain1:number|string, atom1:any, chain2?:number|string, atom2?: any) {
    if(atom2){
      this.currentBonds.push(`deleted bond from ${chain1}:${atom1} to ${chain2}:${atom2}`);
    }
    else {
      this.currentBonds.push(`deleted all bonds from ${chain1}:${atom1}`);
    }
    
  }

  bondExists(x:BondMember, y:BondMember) {
    return this.relations.hasCouple(`${x.chain}:${x.realIdx}`, `${y.chain}:${y.realIdx}`);
  }
    /** Access the computed bonds. */
  get bonds() : ElasticOrGoBounds[]{
    const allBonds:ElasticOrGoBounds[] = [];
      
    for (const [chain_atom_1, chain_atom_2] of this.relations.keysCouples()){   
      allBonds.push([chain_atom_1, chain_atom_2])
    }
    
    return allBonds;
  }

  
  abstract render(opacity?: number, hightlight_predicate?: ((atom1_index: number, atom2_index: number, chain1:number|string, chain2:number|string) => boolean) | undefined): void;
  
  abstract filter(predicate: (chain1:number|string, atom1: number, chain2:number|string, atom2: number, line: string) => boolean) : BaseBondsHelper;
  
  /**
   * Modify the actual object through a filter.
   */
  // @ts-ignore
  filterSelf(predicate: (chain1:number|string, atom1: number, chain2:number|string, atom2: number, line: string) => boolean) {
    const new_one = this.filter(predicate);
    this.relations = new_one.relations;

    return this;
  }

  //abstract add(chain: number, line: string): this;
  //abstract add(chain1: number, atom1: number, chain2:number, atom2: number, line: string): this;
  abstract add(chain1: number|string, atom1_or_line: number | string, chain2?:number|string, atom2?: number, line?: string) : this;
  /**
   * Test if bond {atom1}<>{atom2} exists.
   */
   has(chain1_or_src:number|string, atom1_or_tgt: number|string, chain2?:number|string, atom2?: number) {
    if(chain2 !== undefined) // all 4 were provided, we convert to labels ch_at
      return this.relations.hasCouple(`${chain1_or_src}:${atom1_or_tgt}`, `${chain2}:${atom2}`);
    // Only two were provided, we assume these are 2 labels ch_at
    if(typeof(chain1_or_src) !== 'string' || typeof(atom1_or_tgt) !== 'string')
        throw new Error('Irregular has labels');

    return this.relations.hasCouple(chain1_or_src, atom1_or_tgt);
  }

  remove(chain1:number|string, atom1: number, chain2?:number|string, atom2?: number) {
    if (atom2 === undefined) {
      this.relations.deleteAllFrom(`${chain1}:${atom1}`);
    }
    else {
      this.relations.delete(`${chain1}:${atom1}`,`${chain2}:${atom2}`);
    }
    return this;
  }

  abstract createRealLine(atom1: number, atom2: number) : string;

  abstract toOriginalFiles() : Promise<MoleculeFile[]>;

  abstract toJSON () : BaseBondsHelperJSON[];

  abstract clone(): BaseBondsHelper;

    /* HISTORY */

  /** Save the current state in the history. */
  historyPush() {
    //this.history.push(this.relations.map(bonds => new ReversibleKeyMap(bonds.entries())));
    this.history.push( new ReversibleKeyMap(this.relations.entries()));
    this.reverse_history = [];

    this.customBonds.push(Array.from(this.currentBonds));
  }

  historyRevert() {
    const last = this.reverse_history.pop();
    
    if (last) {
      this.history.push(this.relations);
      this.relations = last;

      let cb = this.lastCustomBonds.pop();
      if(cb !== undefined) {
        this.customBonds.push(this.currentBonds);
        this.currentBonds = cb;
      }
    }
  }

  /** Loose the current state and load the last saved state in the history. If the history is empty, nothing happend. */
  historyBack() {
    const last = this.history.pop();

    if (last) {
      // Save this.relations in reverse history
      this.reverse_history.push(this.relations);

      // Overwrite current relations
      this.relations = last;

      let lastcb = this.customBonds.pop();
      if(lastcb !== undefined) {
        this.lastCustomBonds.push(this.currentBonds);
        this.currentBonds = lastcb;
      }
    }
  }

  /** Clear history. */
  historyClear() {
    this.history = [];
    this.reverse_history = [];
    this.customBonds = [];
    this.lastCustomBonds =  [];
    this.currentBonds = [];
  }

  /** Number of saved states. When `.history_length === 0`, `.historyBack()` does nothing. */
  get history_length() {
    return this.history.length;
  }
  
  /** Number of reverse-saved states. When `.history_length === 0`, `.historyRevert()` does nothing. */
  get reverse_history_length() {
    return this.reverse_history.length;
  }

  /** List of history modifications */

  

  customBondsGet() {
    return this.currentBonds;
  }

  getRelationLinesSorted(relations:ReversibleKeyMap<string,string,string>):string[] {
    const bufLines = [];
    for (const lines of relations.values()) {
      bufLines.push(lines);
    }
    const sortedItplines = bufLines.sort((a,b) => { //1   7 1 0.86615 500.0
      const l1 = a.split(ItpFile.BLANK_REGEX);
      const l2 = b.split(ItpFile.BLANK_REGEX);
      const a1 = parseInt(l1[0]);
      const b1 = parseInt(l1[1]);
      const a2 = parseInt(l2[0]);
      const b2 = parseInt(l2[1]);
     // console.log(`|${a1}|${b1}|${a2}|${b2}|`); //a1, b1, a2, b2);
      if(a1 < a2)
        return -1;
      
      if(a1 > a2)
        return 1;
      
      if(b1 < b2)
        return -1;
      
      if(b1 > b2)
        return 1;
      
      return 0;
    });
    return sortedItplines;
  }

}

export function getIdxSortedByChain(indexes:{chain:number, index:number}[]): {[chain:number]:Set<number>}{
  const sortedByChain: {[chain:number]:Set<number>} = {}

  for (const atomObj of indexes){
    if(!(atomObj.chain in sortedByChain)) sortedByChain[atomObj.chain] = new Set()
    sortedByChain[atomObj.chain].add(atomObj.index)
  }

  return sortedByChain
}