import { BufferRepresentation } from '@mmsb/ngl';
import { RepresentationParameters } from '@mmsb/ngl/declarations/representation/representation';
import * as ngl from '@mmsb/ngl';
import NglWrapper, { NglComponent, NglRepresentation } from './NglWrapper';
import { ElasticOrGoBounds } from '../../types/entities';
import AtomProxy from '@mmsb/ngl/declarations/proxy/atom-proxy';
/*
type AtomCoordinates = [number, number, number];
type ChainCoordinates = AtomCoordinates[][]
interface Coordinate  {
  chain:number,
  atom:AtomCoordinates
  index:number,
  chainname?:string
}
*/
//type BondAtomProxy=Partial<AtomProxy>;
interface BondAtomProxy {
  index:number, // The 0 based ngl internal storage
  x:number,
  y:number,
  z:number,
  chainid:string,
  chainname:string,
  resname:string,
  resno:number, 
  altloc:string,
  name:string
  serial:number // The 1st field of the ATOM RECORD not necessarly consecutive !!
}

export class BondsRepresentation {
    static readonly V_BONDS_DEFAULT_COLOR = new ngl.Color(0, 255, 0);
    static readonly V_BONDS_HIGHLIGHT_COLOR = new ngl.Color(255,0,255);
  
    protected virtual_links_cmpt?: NglComponent;
    protected virtual_links_repr?: NglRepresentation<BufferRepresentation>;
    protected atomData:BondAtomProxy[] = [];
    public chainLabels: {[atom_index:string] : string} = {};
    public bonds: ElasticOrGoBounds[] = [];//ElasticOrGoBoundsRegistered = []; 
  
    constructor(public readonly stage: NglWrapper) {}
  
    /* REPRESENTATION */
    
    set(parameters: Partial<RepresentationParameters>) {
      if (this.virtual_links_repr)
        this.virtual_links_repr.set(parameters);
    }
  
    get visible() {
      if (!this.virtual_links_repr) 
        return false;
      return this.virtual_links_repr.visible;
    }
  
    set visible(v: boolean) {
      if (this.virtual_links_repr)
        this.virtual_links_repr.visible = v;
    }
  
    /* COORDINATES */
  
    registerAtomProxy(atomDatum:AtomProxy) {
      this.atomData.push( {
        index:atomDatum.index,        
        x:atomDatum.x,
        y:atomDatum.y,
        z:atomDatum.z,
        chainid:atomDatum.chainid,
        resname:atomDatum.resname,
        resno:atomDatum.resno,
        altloc:atomDatum.altloc,
        chainname:atomDatum.chainname,
        name: atomDatum.atomname,
        serial:atomDatum.serial
      });     
    }
    get coordinateLength(){
      return this.atomData.length;
    }
    getChainID(index:number):string|undefined{
      if(index in this.chainLabels)
        return this.chainLabels[index];
      return undefined;
    }
    getAtomProxy(index:number):BondAtomProxy {
     // console.log(`[BondRepresentation:getAtomProxy] index is (${typeof(index)}) ${index}`);
      if(index < this.atomData.length)
        return this.atomData[index];
      
      throw new Error("Atom number out of bonds")
    }
    getCoordinate(zero_based_index: number):[number, number, number] { 
        if(zero_based_index < this.atomData.length)
          return [this.atomData[zero_based_index].x, this.atomData[zero_based_index].y, this.atomData[zero_based_index].z] as [number, number, number];
        
        throw new Error("Atom number out of bonds")
    }
    
    distanceBetween(atom1: number, atom2: number) {
      console.log(atom1, ' + ', atom2);
      //const c1 = this.getCoordinate(atom1);
      //const c2 = this.getCoordinate(atom2);
      
      // d = ((x2 - x1)^2 + (y2 - y1)^2 + (z2 - z1)^2)^1/2 
      const [x1, y1, z1] = this.getCoordinate(atom1);
      const [x2, y2, z2] = this.getCoordinate(atom2);
  
      return Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2) + ((z2 - z1) ** 2));
    }
  
    protected cleanStage() {
      if (this.virtual_links_cmpt)
        this.stage.remove(this.virtual_links_cmpt);
  
      this.virtual_links_cmpt = undefined;
      this.virtual_links_repr = undefined;
    }
  
    render(
      mode: 'elastic' | 'go' = 'elastic', 
      bonds = this.bonds,  //GoBondHelper or ElasticGoBonf[Ø ??? ]
      opacity = .2, 
      hightlight_predicate?: (atom1_index: number, atom2_index: number, chain1:number|string, chain2:number|string) => boolean
      ) {
      this.bonds = bonds;
//      const coords = this.coordinates;
//      console.log("[BondsRepsentation:render] Starting")
  
      const shape = new ngl.Shape("add-bonds");
      const upper_mode = mode.toLocaleUpperCase();
      
      //console.log(`[BondRepresentation:render] is working with following bonds storage structure:`);
      //console.log(bonds);

      for (const [chain_atom1, chain_atom2 ] of bonds){
        //console.log(`[BondRepresentation:render] processing ${chain_atom1} ${chain_atom2}`);
        const [chain1, atom1] = chain_atom1.split(':').map((e,i)=> i===1 ? parseInt(e) : e);
        const [chain2, atom2] = chain_atom2.split(':').map((e,i)=> i===1 ? parseInt(e) : e);
        //console.log(`[BondRepresentation:render] translated to ${chain1},${atom1} ${chain2},${atom2}`);
      // We ignore the chain, offset in atom count through chain ID coor arrays is handle by getCoordinate                 
        // atom index starts at 1, atom array stats to 0
        if (typeof(atom1) !== 'number' || typeof(atom2) !== 'number'){
          console.error(`[BondRepresentation:render] atom number index extraction failed on ${chain_atom1}, ${chain_atom2}`);
          continue;
        }

        //console.log(`[BondRepresentaion:render] getting proxies of atom1, atom2: ${atom1}, ${atom2}`);
        const ap1 = this.getAtomProxy((atom1 as number) - 1);
        const ap2 = this.getAtomProxy((atom2 as number) - 1);
        //console.log(`[BondRepresentaion:render] ap1 as ${ap1.name} ${ap1.resname} ${ap1.resno}, ${ap1.chainname}`);
        //console.log(`[BondRepresentaion:render] ap2 as ${ap2.name} ${ap2.resname} ${ap2.resno}, ${ap2.chainname}`);
   
        const coor1:[number, number, number] = [ ap1.x, ap1.y, ap1.z ];
        const coor2:[number, number, number] = [ ap2.x, ap2.y, ap2.z ];
        
        if (!ap1 || !ap2) {
          console.error(`[BondRepresentation:render] Not found atom pair -> ${chain_atom1}, ${chain_atom2}`);
          console.warn("Available coords are ")
          console.dir(this.atomData);
          continue;
        }
        // name foramt is critical for pick bond in bond editor !! 
              
        const realIdx1 = ap1.index +1, realIdx2 = ap2.index + 1;
        const name = `[${upper_mode}] #${ap1.chainname}:${ap1.resno}-${ap2.chainname}:${ap2.resno} Bond w/ atoms ${realIdx1}-${realIdx2}`;
        // ap?.index is not to be used as itis zero-based, atom1, atom2 are 1 indexed.
       // console.log("[BondRepresentation:render] lookup ", atom1, atom2, ap1.chainname, ap2.chainname)
        if (hightlight_predicate) {
          if(hightlight_predicate(atom1, atom2, ap1.chainname, ap2.chainname)) { 
            console.log(`[BondsRepsentation:render] Found link to highlight`);
            shape.addCylinder(coor1, coor2, BondsRepresentation.V_BONDS_HIGHLIGHT_COLOR, .1, name);
            continue;
          }
        }
  
        shape.addCylinder(coor1, coor2, BondsRepresentation.V_BONDS_DEFAULT_COLOR, .1, name);              
      
      }

  
      this.cleanStage();
      const component = this.stage.add(shape);
      const representation = component.add<ngl.BufferRepresentation>('buffer', { opacity });
  
      this.virtual_links_cmpt = component;
      this.virtual_links_repr = representation;
    }
  }