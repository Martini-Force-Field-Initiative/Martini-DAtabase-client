/*
  A module to manage the toplogy of building blocks 
  provided as a graph (usually from a json d3 hierachy).
  Where residue/element type could be:
    - polyply native
    - previously loaded molecule (of the same type or defined with itp)
  And where the topology can be branched or cyclic.
  
  The desired fearture is a the showcase of the building block polymer 
  in the polymer menu and the possiblity to unfold X-copy of it 
  in graphical view just like for linear peptides.

  For the release of 2024-2025, it is decided to represent such polymer as a blob
*/
//Polymer/GeneratorMenu/ModalUploaderToCustomStash/UploadParsers.ts
import { PolyplyNode, PolyplyLink } from '../GeneratorMenu/ModalUploaderToCustomStash/UploadParsers';
export interface CustomPolymerINode {
    resname:string
}

export class CustomPolymerTopology {
  iNodes:CustomPolymerINode[]=[]
  iLinks:[CustomPolymerINode, CustomPolymerINode][]=[]
  
  get nodeNumber(){ return this.iNodes.length }

  constructor(){}

  linear(components:string[]){
  /*
    Store and represent the provided sequence of blocks as a linear chain
    typically used for peptides
  */
    components.forEach( (c, i) => {
      this.iNodes.push({
        resname : c
      })
      if(i > 0) 
        this.iLinks.push([this.iNodes[i-1], this.iNodes[i]])
    })
  }
  any(nodes:PolyplyNode[], links:PolyplyLink[]){
    /*
    Store and represent a free topology, typically provided from 
    a json d3 hierarchy uploaded file
    */
    this.iNodes = nodes.map(
      n => { return { resname : n.resname } }
    );
    this.iLinks = links.map(
      l => { return [this.iNodes[l.source], this.iNodes[l.target]] }
    );    
  }
}

/*
export interface CustomPolymerTopology {
    iNodes:CustomPolymerINode[]
    iLinks:[CustomPolymerINode, CustomPolymerINode][]
}
*/
