import React from 'react';
import NglWrapper, { NglComponent, NglRepresentation } from '../NglWrapper';
import PickingProxy from '@mmsb/ngl/declarations/controls/picking-proxy';
import { Vector3 } from 'three';
import { Shape } from '@mmsb/ngl';
import { Typography, Divider, Button, Box, Link, TextField, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Slider } from '@material-ui/core';
import { Marger, FaIcon } from '../../../helpers';
import BallAndStickRepresentation from '@mmsb/ngl/declarations/representation/ballandstick-representation';
import { toast } from '../../Toaster';
import BaseBondsHelper, { BondMember } from '../BaseBondsHelper';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Stack from '@mui/material/Stack';
import ProgressBarLJ from './ProgressBarLJ';
import GoBondsHelper from '../GoBondsHelper';
import ElasticBondsHelper from '../ElasticBondsHelper';
type GoChainLabel=string|number;
interface GoEditorProps {
  stage: NglWrapper;
  cgCmp: NglComponent;  
  onBondCreate(go_atom_1: number, go_atom_2: number, chain_1: GoChainLabel, chain_2: GoChainLabel) : Promise<any>;
  onBondRemove(chain1: GoChainLabel, real_atom_1: number, chain2: GoChainLabel, real_atom_2: number): any;
  onAllBondRemove(chain: GoChainLabel, from_go_atom: number): any;

  onBondCreateFromSet(s1: Set<string>, s2?: Set<string>): any;
  onBondRemoveFromSet(s1: Set<string>, currBonds:[BondMember, BondMember, string][], s2?: Set<string>): any;
  onGoHistoryBack(opacity?: number): any;
  onGoHistoryRevert(opacity?: number): any;
  onHistoryDownload(): any;

  doValidate(restore?:boolean): Promise<any>; 
  onCancel(): any;
  onValidateComment(new_project: boolean, comment: string): any
  onDownload() : any

  onRedrawGoBonds(highlight?: number | [number, number]|[number, number][], opacity?: number, chain?:GoChainLabel|[GoChainLabel, GoChainLabel]|[GoChainLabel, GoChainLabel][]): any;
  setColorForCgRepr(atomColors?: {[atom:string]: string}): any;

  goInstance: BaseBondsHelper;
  mode: "go" | "elastic" | "classic";

  beadRadiusFactor : number; 
  onBeadRadiusChange(_: any, value : number|number[]): any;
}

interface GoEditorState {
  mode: 'idle' | 'add-link';
  selected?: {
    type: 'atom',
    source: number,
    chain: GoChainLabel,
  } | { 
    type: 'link',
    source: number,
    target: number,
    chain_src: GoChainLabel,
    chain_tgt: GoChainLabel 
  } | {
    type: 'selection',
    s1: Set<string>,
    s2?: Set<string>,
    statSelected: [ maxToCreate:number, countDoExist:number ],
    currentBonds:[BondMember, BondMember, string][]
  };
  select_1: string;
  select_2: string;
  show_side_chains: boolean;
  enable_history: boolean;
  want_save_bonds: boolean; 
  save_to_history : boolean; 
  edition_comment: string; 
  want_go_back: boolean; 
  epsilonLJ:number;
  processingLJ:boolean;
}

interface PickedGoBond {
  name: string;
  color: { r: number, g: number, b: number };
  radius: number;
  position1: Vector3;
  position2: Vector3;
  shape: Shape;
}

// Mode idle:
// Click one atom or bond, selected will be filled
// IF ATOM: Remove all bonds from this atom (go atom selected) OR create a new bond from this atom
// IF LINK: Remove this link
// When create bond: Click on a atom, link will be automatically created

const DEFAULT_EPSILON_LJ=9.401;
export default class GoEditor extends React.Component<GoEditorProps, GoEditorState> {
  state: GoEditorState = {
    mode: 'idle',
    select_1: '',
    select_2: '',
    show_side_chains: false,
    enable_history: true,
    want_save_bonds: false,
    save_to_history : false,  
    edition_comment : '',
    want_go_back: false,
    epsilonLJ:DEFAULT_EPSILON_LJ,
    processingLJ:false
  };  

  protected get repr() {
    return this.props.cgCmp.representations[0] as NglRepresentation<BallAndStickRepresentation>;
  }

  protected get can_go_back() {
    return this.props.goInstance.history_length > 0;
  }

  protected get can_go_further() {
    return this.props.goInstance.reverse_history_length > 0;
  }

  protected get selection_suffix() {
    if (this.state.show_side_chains) {
      return ".CA or .SC1 or .BB or .SC2 or .SC3 or .SC4";
    }
    if(this.props.mode === "go") {
      return ".CA or .BB";
    } else if (this.props.mode === "elastic") {
      return ".BB";
    }
    return "";
    
  }
  /*
  Hacking to silent setState call past unmounting
  */
  private _setState?:(arg0:any)=>void
  componentDidMount() {
    if (this._setState === undefined)
      this._setState = this.setState;
    this.setState = this._setState;
    console.log("[GoEditor] Mount..end");
    // @ts-ignore
    window.GoEditor = this;
    this.props.stage.onClick(this.nglClickReciever);
    this.props.stage.removePanOnClick();
    this.repr.applySelection(this.selection_suffix);
    
    
  }

  componentWillUnmount() {
    console.log("[GoEditor] unmounting");
    this.props.stage.removeEvents();
    this.props.onRedrawGoBonds();
    this.props.stage.restoreDefaultMouseEvents();
    this.props.setColorForCgRepr();
    this.repr.applySelection("*");

    this.setState = (state,callback)=>{
      return;
    };
    console.log("[GoEditor] unmounting..end");
  }

  nglClickReciever = (pp?: PickingProxy) => {
  
  /* TRying to restore background click cancel selection on selction mode
  if (this.state.selected?.type === 'selection') {
    return;
  }
  */
    if (!pp) {   
      if(this.state.selected?.type === 'selection') {
        console.log("[GoEditor] airball 1 click");
        console.log(this.state);

        this.setState({selected : undefined, mode:'idle'});
        this.removeBondHighlight();
        this.removeAtomHighlight();
        return;
      }
    };

  //
    console.log(`[GoEditor:NglClickReceiver] picking proxy object (see pp?.object)`);
    console.dir(pp);
    if (!pp) {   
      console.log("[GoEditor] airball 2 click");
      console.log(this.state.selected);
      console.log(this.state.mode);
      // Disable selection. De-highlight all only if not in atom selection
      if (this.state.mode === 'idle') {
        if (this.state.selected?.type === 'link') {
          this.removeBondHighlight();
        }
        if (this.state.selected?.type === 'atom') {
          this.removeAtomHighlight();
        }      
        if(this.state.selected === undefined) {
          this.removeBondHighlight();
          this.removeAtomHighlight();
        }

        this.setState({ 
          selected: undefined,
        });
      }

      return;
    }
    /* atom.chainIndex refers to the actual coordinate in elesatic.
                              to the virtual coordinate in go
    */
    if ((this.props.mode === "go" && pp.atom?.element === "CA") || 
        (this.props.mode === "elastic" && pp.atom?.atomname === "BB")) {
      // GO atom is clicked, convert its 0 based index to realIndex
      console.log(`[GoEditor:NglClickReceiver] GO atom cliked pp.atom.index, pp.atom.chaineIndex are ${pp.atom.index} ${pp.atom.chainIndex}`);
      const chain = pp.atom.chainname;/*this.props.mode === "elastic" ? pp.atom.chainIndex : 
                    pp.atom.chainname;*/
        
      const virtParticuleIndex = pp.atom.index + 1;
      let curr_sel = { 
          type:'atom',
          source: virtParticuleIndex,
          chain
      };
     

      if (this.state.mode === 'add-link' && this.state.selected?.type === 'atom') { 
         console.log(`[GoEditor:NglClickReceiver] 'add-link' && state.selected.type === 'atom'`); 
        // Create the bond if possible
        if (this.state.selected.source !== curr_sel.source || this.state.selected.chain !== curr_sel.chain) {
          console.log(`[GoEditor:NglClickReceiver] props.onBondCreate`);
          const prev_source = this.state.selected.source;
          const prev_chain = this.state.selected.chain;
          this.props.onBondCreate(this.state.selected.source, curr_sel.source, this.state.selected.chain, curr_sel.chain)
            .then(() => {              
              // redraw the bonds for selected atom
              console.log(`[GoEditor:NglClickReceiver] props.onBondCreate.then=> redrawing bond for ${curr_sel.source }, ${curr_sel.chain}`);
              this.highlightBond([curr_sel.source,prev_source], [curr_sel.chain, prev_chain]);
            });
        }

        this.setState({
          mode: 'idle'
        });

        // Stop here
        return;
      }

      // Remove the highlighted bond/the highlighted atom
      if (this.state.selected?.type === 'link') {
        this.removeBondHighlight();
      }
      else {
        this.removeAtomHighlight();
      }

      // Highlight the selected one
      this.highlightAtom(curr_sel.source, curr_sel.chain);

      this.setState({
        selected: {
          type: 'atom',
          source: curr_sel.source,
          chain : curr_sel.chain
        }
      });
    }
    else if (pp.atom === undefined && pp.bond === undefined && (pp.object as PickedGoBond)?.name) {
      if (this.state.mode === 'add-link') {
        // can't select for now
        return;
      }

      // this might be a go bond...
      const obj = pp.object as PickedGoBond;
      console.log(`[GoEditor:nglClickReceiver] assessing if object is a bond based on its name ==>${obj.name}`);
      if (!obj.name.startsWith('[GO]') && !obj.name.startsWith('[ELASTIC]')) {
        return;
      }

      // Remove highlight atom if any
      if (this.state.selected?.type === 'atom') {
        this.removeAtomHighlight();
      }
      
      const m = /^\[GO\] #([^:]+):([0-9]+)-([^:]+):([0-9]+) Bond w\/ atoms ([0-9]+)-([0-9]+)/.exec(obj.name);
      if(!m)
        throw new Error("Something wrong with chain label on bonds ngl cylinder representation")

      const [ _, chain1, resnum1, chain2, resnum2, atom_index1, atom_index2 ] = m.map( (e,i)=> i > 3 ? parseInt(e) : e);
      console.log(`[GoEditor:nglClickReceiver] ckicked bond param extracted ${[ chain1, resnum1, chain2, resnum2, atom_index1, atom_index2 ]}` );
      this.highlightBond([atom_index1 as number, atom_index2 as number], [chain1, chain2]);

        this.setState({
          selected: {
            type: 'link',
            source:atom_index1 as number,
            target:atom_index2 as number,
            chain_src:chain1,
            chain_tgt:chain2 
          }
        });      
      // Highlight the bond
      
    }
  };

  highlightBond(
    target: [virtPartIdx_1:number, virtPartIdx_2:number] | [virtPartIdx_1:number, virtPartIdx_2:number][]|number, 
    chain:[number|string, number|string]|[number|string, number|string][]|number|string) {
    this.props.onRedrawGoBonds(target, 1, chain);
  } 

  removeBondHighlight() {
    this.props.onRedrawGoBonds(undefined, 1);
  }

  highlightAtom(virtPartIndex: number, chain:number|string) {
    const atomColors : { [vpIdx:number] : string} = { }; 
    atomColors[virtPartIndex] = "#ff00ff";
    console.log("[GoEditor::highlightAtom] " + virtPartIndex)
    this.props.setColorForCgRepr(atomColors);
    this.props.onRedrawGoBonds(virtPartIndex, 1, chain);
  }
  highlightGroup(g1_sel : Set<string>, bonds:[BondMember,BondMember, string][],
                 g2_sel?: Set<string>) {
  
    console.log(`[GO-EDITOR:highlightgroup] ${g1_sel} ### ${g2_sel}`);

    //const colorAtoms: {[chainIdx: string]: {[atomIdx:number]:string} } = {};
    const colorAtoms: {[chainIdx: string]: string } = {};
    for (const ch_at_g1 of g1_sel) {
      const serial = ch_at_g1.split(":")[1];
      colorAtoms[serial] = "#9900ff";
    }
    if(g2_sel)
      for (const ch_at_g2 of g2_sel) {
        const serial = ch_at_g2.split(":")[1];
        colorAtoms[serial] = "#ffff00";
      }
    console.log(`[GoEditor:highlightGroup] setting following colorAtom`);
    console.log(colorAtoms);
    this.props.setColorForCgRepr(colorAtoms);
    const a:[number,number][] = bonds.map((b)=>[b[0].realIdx, b[1].realIdx]);
    const c:[number|string,number|string][] = bonds.map((b)=>[b[0].chain, b[1].chain]);

    this.highlightBond(a, c);
  }

  removeAtomHighlight() {
    this.props.setColorForCgRepr();
    this.props.onRedrawGoBonds();
  }

   // EVENTS
  onApplyEpsilonLJ = () => {
    setTimeout( ()=> { 
      this.setState({processingLJ:false, mode:'idle', selected:undefined});
      this.removeBondHighlight();
      this.removeAtomHighlight();
    }, 1500);    
    this.setState({processingLJ:true})

    
    console.log(this.state.epsilonLJ);
    console.log(this.state.selected);
    console.log("onApplyEpsilonLJ done");
    if(this.state.selected?.type === "selection")
      (this.props.goInstance as GoBondsHelper).updateLJ(
        { epsilon:this.state.epsilonLJ},
        this.state?.selected.currentBonds);    
    //this.props.goInstance.matchBonds((s,t,l)=>{
   
  };

  onAddLinkEnable = () => {
    this.setState({ mode: 'add-link' });
  };

  onAddLinkDisable = () => {
    this.setState({ mode: 'idle' });
  };
  
  onRemoveAllBonds = () => {
    const { selected } = this.state;
    if (!selected|| !('source' in selected)) {
      return;
    }
    // GL TO DO HERE
    console.log(`[GoEditor:onRemoveAllBonds]`);
    console.log(selected);
    //@ts-ignore
    this.props.onAllBondRemove(selected.chain, selected.source);
   
    this.removeBondHighlight();
  };

  onRemoveBond = () => {
    /*
    redraw the bonds w/out the clicked one
    store the inforamtion for the efffecive removing at SAVE click    
    */
    const { selected } = this.state;
    if (!selected || selected.type !== 'link') {
      return;
    }

    this.props.onBondRemove(selected.chain_src, selected.source, selected.chain_tgt, selected.target);
    this.removeBondHighlight();

    this.setState({ mode: 'idle', selected: undefined });
  };

  onAddBondWithSet = () => {
    const { selected } = this.state;
    if (!selected || selected.type !== 'selection') {
      return;
    }
    
    this.props.onBondCreateFromSet(selected.s1, selected.s2);
    this.props.onRedrawGoBonds();
    this.setState({ mode: 'idle', selected: undefined });
  };

  onRemoveBondWithSet = () => {
    const { selected } = this.state;
    if (!selected || selected.type !== 'selection') {
      return;
    }

    this.props.onBondRemoveFromSet(selected.s1, selected.currentBonds, selected.s2);
    this.removeBondHighlight();
    this.setState({ mode: 'idle', selected: undefined });
  };

  onSelectionStop = () => {
    this.setState({ selected: undefined });
    this.props.setColorForCgRepr();
    this.removeBondHighlight(); // GLA ADDED
  };

  onSelectionMake = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!e.currentTarget.checkValidity()) {
      toast("You must specify at least the first selection group.", "warning");
      return;
    }
    
    const g1 = this.state.select_1.trim();
    const g2 = this.state.select_2.trim();

    const g1_ch_at_index = new Set<string>();
    let g2_ch_at_index: Set<string> | undefined = undefined; // JS custom object set does not exist yet
    /*
    This could be circumvate by using two sets <string> and <literal> The second being populated according to first
    */
   

    // Get all indexes of go sites for g1, we offset the index so we match the 
    if(this.props.mode === "go") {
      console.log(`g1 ("${g1}") atom selection data`)
      this.repr.iterateOverGoSitesOf(g1, ap => {
        console.log('[g1]', ap.index, ap.number, ap.serial, ap.atomname, ap.chainname, ap.resname, ap.resno);
        const goSiteIndex = ap.index + 1;
        const realIndex   = (this.props.goInstance as GoBondsHelper).goIndexToRealIndex(goSiteIndex);
        //const a_str = `${ap.chainname}:${ap.resno}_${realIndex}`; // serial is not safe as it can be non consecutive
        const a_str = `${ap.chainname}:${realIndex}`;
        g1_ch_at_index?.add(a_str);
      }, this.selection_suffix);
    } 
    else if(this.props.mode === "elastic") {
      this.repr.iterateOverElasticSitesOf(g1, ap => {
        //const a_str = `${ap.chainIndex + 1}_${ap.index + 1}`;
        const a_str = `${ap.chainname}:${ap.index + 1}`;
        g1_ch_at_index.add(a_str);
      }, this.selection_suffix);
    }

    if (g1_ch_at_index.size === 0) {
      toast("Group 1 does not contain any site.", "warning");
      return;
    }

    if (g2) {
      console.log(`g2 ("${g2}") atom selection data`)
      const index_to_residue: { [index: number]: number } = {};
      g2_ch_at_index = new Set();

      // Get all indexes of sites for g2
      if(this.props.mode === "go") {
        this.repr.iterateOverGoSitesOf(g2, ap => { // This loops over CA, only virtualsite       
        console.log('[g2]', ap.index, ap.number, ap.serial, ap.atomname, ap.chainname, ap.resname, ap.resno);
        const goSiteIndex = ap.index + 1;
        const realIndex   = (this.props.goInstance as GoBondsHelper).goIndexToRealIndex(goSiteIndex);
        const a_str = `${ap.chainname}:${realIndex}`;
        g2_ch_at_index?.add(a_str);
         // index_to_residue[ap.index + 1] = ap.resno;
        }, this.selection_suffix);
      } 
      else if(this.props.mode === "elastic") {
        this.repr.iterateOverElasticSitesOf(g2, ap => {
          //const a_str = `${ap.chainIndex + 1}_${ap.index + 1}`;
          console.warn(`[GoEditor] ElasticBond enumerator selector ${g2} curr atom pointer:`);
          console.warn(ap);
          const elSiteIndex = ap.index + 1;
          const realIndex   = (this.props.goInstance as ElasticBondsHelper).goIndexToRealIndex(elSiteIndex);
          const a_str = `${ap.chainname}:${realIndex}`;
          g2_ch_at_index?.add(a_str);
        }, this.selection_suffix);
      }
      const overlaps:string[] = Array.from(g1_ch_at_index).filter( a_str=> g2_ch_at_index?.has(a_str) );
      // Test for overlapping indexes
      if (overlaps.length > 0) {
        const error_msg = overlaps.map(a_str=>`{${a_str.replace("_",',')}}`).join(" and ");
        toast(`Residue${overlaps.length > 1 ? 's' : ''} ${error_msg} overlaps in groups 1 and 2. Please make non-overlapping groups.`, "error");
        return;
      }

      // Error if empty atom list
      if (g2_ch_at_index.size === 0) {
        toast("Group 2 does not contain any site.", "warning");
        return;
      }
    }
    console.log(`[GoEditor:onSelectionMake]G1:G2`)
    console.log(g1_ch_at_index);
    console.log(g2_ch_at_index);

   
    
    
    const predicate = !g2 ? 
      (src:BondMember, tgt:BondMember) => g1_ch_at_index.has(`${src.chain}:${src.realIdx}`) &&
                                          g1_ch_at_index.has(`${tgt.chain}:${tgt.realIdx}`):
      (src:BondMember, tgt:BondMember) => {
        const _ =  ( g1_ch_at_index.has(`${src.chain}:${src.realIdx}`) && 
                     g2_ch_at_index?.has(`${tgt.chain}:${tgt.realIdx}`) ) ||
                   ( g2_ch_at_index?.has(`${src.chain}:${src.realIdx}`) && 
                      g1_ch_at_index.has(`${tgt.chain}:${tgt.realIdx}`) );
        return _ as boolean;
      };

    const groupBonds = this.props.goInstance.matchBonds( predicate );
   
    console.log("Bonds match");
    console.log(groupBonds);
    const maxToCreate = !g2 ? ((g1_ch_at_index.size - 1) * g1_ch_at_index.size)/2 : g1_ch_at_index.size * g2_ch_at_index!.size;
    const countDoExist = groupBonds.length;

    // Make the coloration
    this.highlightGroup(g1_ch_at_index, groupBonds, g2_ch_at_index);

    // Save the selection
    this.setState({
      mode: 'idle',
      selected: {
        type: 'selection',
        s1: g1_ch_at_index,
        s2: g2_ch_at_index,
        statSelected: [ (maxToCreate as number) - countDoExist, countDoExist ],
        currentBonds : groupBonds
      },
      
    });
  };
 
  onSideChainShowChange = (_: any, checked: boolean) => {
    this.setState(
      { show_side_chains: checked }, 
      () => this.repr.applySelection(this.selection_suffix)
    );
  };

  onGoHistoryBack = () => {
    this.props.onGoHistoryBack(1);
  };

  onHistoryChange = (_: any, checked: boolean) => {
    if (!checked) {
      this.props.goInstance.historyClear();
    }

    this.setState({
      enable_history: checked,
    });
  };

  onGoHistoryRevert = () => {
    this.props.onGoHistoryRevert(1);
  };

  onResetEditor = () => {
    console.log("LETS RESTORE GO BONDS STATUS")
    this.props.goInstance.restore('go');
    // setState ??
    // redraw
  }
  renderAtomSelected() {
    if (this.state.selected?.type !== 'atom') {
      return <React.Fragment />;
    }

    return (
      <React.Fragment>
        <Typography variant="h6" align="center">
          Single atom selection
        </Typography>
        <Typography align="center">
          Atom #<strong>{this.state.selected.source +1}</strong> selected.
        </Typography>

        <Marger size="1rem" />

        <Typography variant="body2" align="center">
          You can add a new bond between this atom and another {this.props.mode === 'go' ? "Go virtual site" : 'atom'}, or
          you can remove every {this.props.mode} bond attached to this atom.
        </Typography>
        <Typography variant="body2" align="center">
          To remove a specific bond, just click on it.
        </Typography>

        <Marger size="1rem" />

        <Box alignContent="center" justifyContent="center" width="100%" flexDirection="column">
          <Button 
            style={{ width: '100%' }} 
            color="primary" 
            onClick={this.onAddLinkEnable}
          >
            <FaIcon plus /> <span style={{ marginLeft: '.6rem' }}>Add new {this.props.mode === 'go' ? "Go" : "Elastic"} bond</span>
          </Button>

          <Marger size=".2rem" />

          <Button 
            style={{ width: '100%' }} 
            color="secondary" 
            onClick={this.onRemoveAllBonds}
          >
            <FaIcon trash /> <span style={{ marginLeft: '.6rem' }}>Remove all {this.props.mode === 'go' ? "Go" : "Elastic"} links of atom</span>
          </Button>
        {/* Trying to move this logic to back button
          <Button 
            style={{ width: '100%' , color: 'orange'}} 
            onClick={this.onSelectionStop}
          >
            <FaIcon arrow-left /> 
            <span style={{ marginLeft: '.6rem' }}>Back to Settings</span>
          </Button>
        */}
        </Box>
      </React.Fragment>
    );
  }

  renderWaitingSecondAtomSelection() {
    if (this.state.selected?.type !== 'atom') {
      return <React.Fragment />;
    }

    return (
      <React.Fragment>
        <Typography variant="h6" align="center">
          Single atom selection
        </Typography>
        <Typography align="center">
          Creating a link between atom #<strong>{this.state.selected!.source +1}</strong> and another.
        </Typography>

        <Typography variant="body2" align="center">
          Please select another {this.props.mode === 'go' ? "Go" : ""} atom to create link, or click below to cancel operation.
        </Typography>

        <Marger size="1rem" />

        <Box alignContent="center" justifyContent="center" width="100%" flexDirection="column">
          <Button 
            style={{ width: '100%' }} 
            color="primary" 
            onClick={this.onAddLinkDisable}
          >
            <FaIcon times /> <span style={{ marginLeft: '.6rem' }}>Cancel</span>
          </Button>
        </Box>
      </React.Fragment>
    );
  }

  renderLinkSelected() {
    if (this.state.selected?.type !== 'link') {
      return;
    }

    return (
      <React.Fragment>
        <Typography variant="h6" align="center">
          Link selection
        </Typography>
        <Typography align="center">
          Link between atoms #<strong>{this.state.selected!.source}</strong> and #<strong>{this.state.selected!.target}</strong>.
        </Typography>

        <Typography variant="body2" align="center">
          You can remove this bond by clicking on the button below.
        </Typography>

        <Marger size="1rem" />

        <Box alignContent="center" justifyContent="center" width="100%" flexDirection="column">
          <Button 
            style={{ width: '100%', color:"#ff9800" }}  
            onClick={this.onRemoveBond}
          >
            <FaIcon trash /> <span style={{ marginLeft: '.6rem' }}>Remove</span>
          </Button>
        </Box>
      </React.Fragment>
    );
  }

  renderSelectedGroups() {
    if (this.state.selected?.type !== 'selection') {
      return <React.Fragment />;
    }

    const selection = this.state.selected;

    if (selection.s2) {
      return (
        <React.Fragment>
          <Typography variant="h6" align="center">
          Group selection
        </Typography>
          <Typography variant="h6" align="center">
            First selected group
          </Typography>
          <Typography component="pre">
            <code>{this.state.select_1}</code>
          </Typography>

          <Marger size="1rem" />

          <Typography variant="h6" align="center">
            Second selected group
          </Typography>
          <Typography component="pre">
            <code>{this.state.select_2}</code>
          </Typography>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Typography variant="h6" align="center">
          Group selection
        </Typography>
        <Typography component="pre">
          <code>{this.state.select_1}</code>
        </Typography>
      </React.Fragment>
    );
  } 

  renderSelectionMode() {
    if (this.state.selected?.type !== 'selection') {
      return <React.Fragment />;
    }
    
   

    const selection = this.state.selected;    
    return (
      <React.Fragment>
        {this.renderSelectedGroups()}
        { 
        /*
        <Marger size="1.5rem" />

        <Typography align="center">
          <strong>
            {selection.s1.size + (selection.s2?.size ?? 0)} sites selected.
          </strong>
        </Typography>
        */
        }
        <Marger size="1rem" />

        <Button color="primary" onClick={this.onAddBondWithSet} style={{ width: '100%' }}>
          <FaIcon plus-circle /> 
          <span style={{ marginLeft: '.6rem' }}>Create {this.state.selected?.statSelected[0]} bond{this.state.selected?.statSelected[0] > 1 ? 's' : ''}</span>
        </Button>       
        <Button color="secondary" onClick={this.onRemoveBondWithSet} style={{ width: '100%' }}>
          <FaIcon eraser /> 
          <span style={{ marginLeft: '.6rem' }}>Delete {this.state.selected?.statSelected[1]} bond{this.state.selected?.statSelected[1] > 1 ? 's' : ''}</span>
        </Button>             
        
        { this.props.mode === "go" ?
          ! this.state.processingLJ ?
          <Stack direction='row'>
            <Button style={{color:'darkcyan', width: '100%'}}
            onClick={ this.onApplyEpsilonLJ }
            >
            <FaIcon adjust />             
            <span style={{ marginLeft: '.6rem' }}>Edit {this.state.selected?.statSelected[1]} Go bond{this.state.selected?.statSelected[1] > 1 ? 's' : ''} LJ epsilon</span>              
            </Button>
            <TextField
              onClick = { e=>e.preventDefault()}
              onChange={ e=>{ e.preventDefault();this.setState({ epsilonLJ: parseFloat(e.target.value) }); }}
              defaultValue={DEFAULT_EPSILON_LJ}
              id="standard-number"          
              type="number"
              inputProps={{step:0.001, style: {color:'darkcyan', fontWeight:'bold'}}}
              InputLabelProps={{
                shrink: true,
                style: {color:'darkcyan'}
              }}
              style={{
                width: '5em',
                marginLeft:'0.5em',
                color:'darkcyan'
              }}
            />
          </Stack> :
          <Stack justifyContent='center' direction='row'  style={{width: '100%', color:'darkcyan'}}>
            <Box><FaIcon adjust /></Box>
            <Box width={'15rem'}>
              <ProgressBarLJ classes={{label:'my-label'}} msg='Modifying potentials'/>
            </Box>
          </Stack>
          :<React.Fragment />        
          }        
        
        {/* Trying to move this logic to back
        <Button style={{ color: 'orange', width: '100%' }} onClick={this.onSelectionStop}>
          <FaIcon arrow-left /> 
          <span style={{ marginLeft: '.6rem' }}>Back to Settings</span>
        </Button>
        */}
      </React.Fragment>
    );
  }

  renderNoneSelected() {
    return (
      <React.Fragment>
        <Typography variant="h6" align="center">
          Display settings
        </Typography>

        <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                checked={this.state.show_side_chains} 
                onChange={this.onSideChainShowChange} 
                color="secondary"
              />
            }
            label="Show side chains"
          />

        </Box>

        <Marger size="1.5rem" />

        <Typography gutterBottom>
          Beads radius factor
        </Typography>
        <Slider
          value={this.props.beadRadiusFactor}
          valueLabelDisplay="auto"
          step={0.1}
          marks
          min={0}
          max={1}
          onChange={this.props.onBeadRadiusChange}
          color="secondary"
        />

        <Marger size="1.5rem" />

        <Typography variant="h6" align="center">
          Single atom selection
        </Typography>

        <Typography align="center">
          Please select {this.props.mode === 'go' ? "a virtual Go atom or" : "an atom or Elastic"} bond by clicking on them in the molecule representation.
        </Typography>

        <Marger size=".7rem" />

        <Typography variant="body2" align="center">
        {this.props.mode === 'go' ? "Go atoms and bonds" : "atoms and Elastic bonds"} are highlighted in green.
        </Typography>

        <Marger size="1.5rem" />
        
        <Typography variant="h6" align="center">
          Group selection
        </Typography>

        <Typography align="center">
          Select groups of {this.props.mode} sites using the {" "}
          <strong>
            <Link href="http://nglviewer.org/ngl/api/manual/selection-language.html" target="_blank">
              NGL selection language
            </Link>
          </strong>.

          <br />

          <strong>Select one or two groups, second one is not required</strong>.
        </Typography>

        <Typography variant="body2" align="center">
          By selecting one group, you can link all the selected {this.props.mode} sites together.
          If you select two groups, you can link every site of group 1 to every site of group 2.
        </Typography>

        <Marger size="1.5rem" />
        { 
        // GLA TO RESUME HERE onSelectionMake should update number of existing, to be created or to delete
        }
        <form onSubmit={this.onSelectionMake} style={{ width: '100%' }}>
          <Box width="100%">
            <TextField 
              value={this.state.select_1}
              label="First group"
              onChange={e => this.setState({ select_1: e.target.value })}
              fullWidth
              required
              variant="outlined"
            />
          </Box>

          <Marger size=".5rem" />

          <Box width="100%">
            <TextField 
              value={this.state.select_2}
              label="Second group"
              onChange={e => this.setState({ select_2: e.target.value })}
              fullWidth
              variant="outlined"
            />
          </Box>

          <Marger size="1rem" />
          
          <Button style={{ width: '100%' }} type="submit" color="primary">
            <FaIcon search />
            <span style={{ marginLeft: '.7rem' }}>
              Find
            </span>
          </Button>

        </form>
      </React.Fragment>
    );
  }

  renderModalSaveBonds() {
    return(
    <Dialog open={this.state.want_save_bonds}>
        <DialogTitle>
          Saving current set of bonds
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            You are about update the current job entry. This will erase the previous state from your history. 
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button color="primary" onClick={() => {
            this.setState({want_save_bonds:false})
            //this.props.onCancel(); 
            }}>No</Button>
          <Button color="secondary" onClick={ 
            () => { 
              this.setState({want_save_bonds:false}); 
              this.props.onValidateComment(false, '');
              
            }}
            >Yes</Button>
        </DialogActions>
      </Dialog>
    )
  }

  renderModalSaveToHistory() {    
    return(
      <Dialog open={this.state.save_to_history}>
          <DialogTitle>
            Saving current set of bonds
          </DialogTitle>
  
          <DialogContent>
            <DialogContentText>
              You are about to create a new job entry in your history with this modified molecule. You may add comment to help identify this job. 
            </DialogContentText>
            <TextField fullWidth label="Comment" value = {this.state.edition_comment} variant="outlined" onChange={v => this.setState({ edition_comment: v.target.value })}> </TextField>
          </DialogContent>
      
          <DialogActions>
            <Button color="primary" onClick={() => {
              this.setState({save_to_history:false})
              //this.props.onCancel(); 
              console.log("no")
              }}>Cancel</Button>
            <Button color="secondary" onClick={() => {
              this.setState({save_to_history:false})
              this.props.onValidateComment(true, this.state.edition_comment)}}>Validate</Button>
          </DialogActions>
        </Dialog>
    )
  }

  renderModalBack() {
    return (
      <Dialog open={!!this.state.want_go_back}>
        <DialogTitle>
         Cancel the current Edition
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            You are about to restore the Go/Elastic editor to its orginal state.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button color="primary" onClick={() => this.setState({want_go_back: false})}>Cancel</Button>
          <Button color="secondary" onClick={() => { 
            this.onResetEditor();
            this.setState({want_go_back: false});
          }
          }>Reset Editor</Button>
        </DialogActions>
      </Dialog>
    )
  }

  render() {
    let hist = this.props.goInstance.customBondsGet();
    return (
      <React.Fragment>
        {this.renderModalSaveBonds()}
        {this.renderModalSaveToHistory()}
        {this.renderModalBack()}
        <Marger size="1rem" />

        {/* Theme */}         
        <Typography variant="h5" align="center">
          Edit {this.props.mode === 'go' ? "Go" : "Elastic"} virtual bonds
        </Typography>
        
        <Marger size="1rem" />

        {this.state.mode === 'idle' && this.state.selected?.type === 'atom' && this.renderAtomSelected()}

        {this.state.mode === 'add-link' && this.state.selected?.type === 'atom' && this.renderWaitingSecondAtomSelection()}

        {this.state.mode === 'idle' && this.state.selected?.type === 'link' && this.renderLinkSelected()}

        {this.state.mode === 'idle' && this.state.selected?.type === 'selection' && this.renderSelectionMode()}

        {this.state.mode === 'idle' && !this.state.selected && this.renderNoneSelected()}

        <Marger size="2rem" />

        <Divider style={{ width: '100%' }} />

        <Marger size="1rem" />

        <Box alignContent="center" justifyContent="center" width="100%">
          {this.state.mode === 'idle' && !this.state.selected && <React.Fragment>
            <Button 
              style={{ width: '100%' }} 
              color="primary" 
              onClick={() => { //always doValidate to eventually update itp content 
                this.props.doValidate(false).then( ()=> {
                  console.warn("[GoEditor:props.doValidate aka (Builder:onGoEditorValidate) then clause running ->save_to_history");
                  this.setState({save_to_history: true});} );
              }}
            >
              <FaIcon save /> <span style={{ marginLeft: '.6rem' }}>Save as new project</span>
            </Button>

            <Button 
              style={{ width: '100%' }} 
              color="primary" 
              onClick={() => { //always doValidate to eventually update itp content 
               // this.props.doValidate().then( () =>  {
                  console.warn("This should trigger want_to_save_bonds modal")
                  this.setState({want_save_bonds: true})
               // });
              }}
            >
              <FaIcon recycle /> <span style={{ marginLeft: '.6rem' }}>Update current project</span>
            </Button>

            <Button onClick={() => { //always doValidate to eventually update itp content 
                this.props.doValidate().then ( ()=> this.props.onDownload() );
              }}
               color="primary"  style={{ width: '100%' }} >
              <FaIcon download /> <span style={{ marginLeft: '.6rem' }}>Download CG files</span>
            </Button>

            <Marger size="1rem" />

            <Divider style={{ width: '100%' }} />
          </React.Fragment>}
        </Box>
        
        <Marger size="1rem" />

        <Button disabled style={{ color: this.state.enable_history ? 'rgb(63, 81, 181)' : undefined }}>
          <FaIcon history /> 
          <span style={{ marginLeft: '.6rem' }}>Modifications Log</span>
        </Button>

        <Marger size="1rem" />

        { hist.length === 0 &&
          <Typography style={{color:'orange'}}>
           There are Currently no staged modification
          </Typography>
        ||
        <Box>
        <Box 
        style= {{
          maxHeight:'5em',
          overflow:"hidden",
          overflowY:"scroll"
        }}
        >
        <Typography variant='body2' align='center'>
          {hist.map((link: any, i) => <span key={'bHist_'+i}>{link}<br></br></span>)}
        </Typography>
        </Box>
        <Marger size="1rem" />
        <Typography variant='body1' color='primary'>
          There {hist.length > 1 ? 'are' : 'is'} currently {hist.length} staged modification{hist.length > 1 ? 's' : ''}.
        </Typography>        
        </Box>
        }          
        {/*<Box display="grid" gridTemplateColumns="1fr 1fr">*/}
        <ButtonGroup variant="text" color="primary" style={{marginBottom:'0.5em'}}>          <Button 
            style={{ color: this.can_go_back ? 'orange' : undefined }} 
            onClick={this.onGoHistoryBack}
            disabled={!this.can_go_back || !this.state.enable_history}
            title="Back"
          >
            <FaIcon undo /> 
            <span style={{ marginLeft: '.6rem' }}>Undo</span>
          </Button>

          <Button 
            style={{ color: this.can_go_further ? 'green' : undefined }} 
            onClick={this.onGoHistoryRevert}
            disabled={!this.can_go_further || !this.state.enable_history}
            title="Forward"
          >
            <span style={{ marginRight: '.6rem' }}>Redo</span>
            <FaIcon redo />             
          </Button>
          </ButtonGroup>
        {/*</Box>*/}
        
        {this.state.mode === 'idle' && /*&& !this.state.selected
        && <Box width="100%" justifyContent="space-between" display="flex">*/
          
          <Button variant="outlined" color="secondary" type="button" 
            onClick={ () => this.setState({want_go_back: true})}
            disabled={!this.can_go_back || !this.state.enable_history}
            >
            CANCEL ALL
          </Button>
          /* Option removed 
          <Button variant="outlined" color="primary" type="submit" onClick={this.props.onValidate}>
            Save to ITP
          </Button>
          */
       /*} </Box>*/
      }

      </React.Fragment>
    );
  }
}
