import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import MoleculeAdder from '../MoleculeAdder';
import { TabPanelStyles, a11yProps, TabPanel } from './TabGenerator';
import InfoSection from './InfoSection';
import { Marger } from '../../../../helpers';
import PolymerSourceButtons from '../PolymerSource/PolymerSourceButtons';
import { Box } from '@material-ui/core';
interface PCProps {
    molecules:Record<string, [string, string, string][]>,
    onAddClick:(mol:string, count:number)=>void,
    targetLister:()=>string[]
    handleUpload:(selectorFiles: FileList)=>void
    onAttachClick:(mol:string, count:number, target?:string)=>void,
    customPolymerOptions:[title:string, action:()=>void][]
}
export default function PolymerCreatorControls(props:PCProps) {
    const classes = TabPanelStyles();
    const [value, setValue] = React.useState('one');

    const handleChange = (event:any, newValue:any) => {
        setValue(newValue);
      };
   
return (
    <div className={classes.root}>
      <AppBar position="static"
        style={{ backgroundColor:"rgb(160, 130, 80)",
          boxShadow:'none'
        }}
      >
        <Tabs value={value} onChange={handleChange} aria-label="wrapped label tabs example"
          variant='fullWidth'
        >
          <Tab
            value="one"
            label="Create"
            wrapped
            {...a11yProps('one')}
          />
          <Tab 
            value="two" 
            label="Attach" 
            wrapped
            {...a11yProps('two')} 
          />
          <Tab 
            value="three" 
            label="Upload" 
            wrapped
            {...a11yProps('three')}
            />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index="one">
       <InfoSection
        message = { 
          <div>Here, you may choose building blocks to start creating your own polymer.
            The set of available molecular units correspond to the &nbsp;
            <a href='https://github.com/marrink-lab/polyply_1.0'> 
            polyply library of compounds</a>. This library includes amino acids, 
            carbohydrates and common monomers. Additional molecules may be provided through the right-end 
            &nbsp; <u>UPLOAD A DEFINITON</u> panel.
          </div>
        }
        />       
        <Marger size='3rem'/>
        <MoleculeAdder
          type="injector"                    
          molecules={ props.molecules }
          onAddClick={ props.onAddClick }
            /*(molecule, count) => {  
            this.setState({ want_go_back: false }); 
            this.CheckNewMolecule(molecule, count, undefined) } 
            */                          
        />
      </TabPanel>
      <TabPanel value={value} index="two">

      <InfoSection
        message = { 
          <div>
            Here you can inject several copy of a linear homomultimer into your current polymer.
            You will have to: 
            <ol style={{marginLeft:'-1.8em', marginTop:'-0em'}}>
              <li> Select molecular the unit to attach these polymer, by their types</li>
              <li> Define the building block and the copy number of the homomultimer(s) to inject into your poymer</li>
            </ol>           
          </div>
        }
        />       
        <Marger size='3rem'/>

        <MoleculeAdder
          type="attacher"                   
          molecules={ props.molecules }
          onAddClick={ props.onAttachClick
            /*(molecule, count, target)=> { 
            this.setState({ want_go_back: false }); 
            this.CheckNewMolecule(molecule, count, target); 
          }*/}
          targetLister={ props.targetLister }
        />
      </TabPanel>
      <TabPanel value={value} index="three">
      <InfoSection
        message = { 
          <div>
            If the current library of molecular units doesnt cover your needs, 
            you may upload your own definitions here. They can come in different flavors:
            <ul style={{marginLeft:'-1.8em', marginTop:'-0em'}}>
            <li> Any component of the MAD:Database matching the currently selected forcefield.</li>
            <li> Other molecular building blocks, can be provided under ITP Gromacs format.</li>
            <li> Complex (hetero/branched) polymers can be specified under the <a href=''>polyply JSON format</a></li>
            <li> Linear peptides, can be specified as FASTA sequence or file.</li>           
            </ul>           
          </div>
        }
        />       
        <Marger size='3rem'/>
        <Box textAlign="center">
        <PolymerSourceButtons
          options = { props.customPolymerOptions }
          onClick={ (index:number) =>{  // Just here for current compoenet  
              //setState({ ...state, selIndex:index})
              //console.log("I got this " + index);
              //setState({...state, open: false});
              //liveIndex = index;
              //props.onClick[liveIndex]();
          }}
        />
        { /*
        <CustomMoleculeUploader 
              handleUpload={ props.handleUpload }
        />
        */}
        </Box>
      </TabPanel>
    </div>
  );
}