import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import LinkCreator from '../LinkCreator';
import { CustomLinkUploader } from '../AdvancedUploaders';
import { TabPanelStyles, a11yProps, TabPanel } from './TabGenerator';
import InfoSection from './InfoSection';
import { Marger } from '../../../../helpers';

interface BECProps {
  handleVermouthFFUpload:(files:FileList)=>void,
  canCreateLink:boolean,
  linksValues:()=>string[],
  onSelectItemEnter:(item:string, show:boolean)=>void,
  onSelectItemLeave:(item:string, show:boolean)=>void,
  onSrcSelect:(item:string)=>void,
  onTgtSelect:(item:string)=>void,
  onAction:(item1?:string, item?:string)=>void
}
export default function BondEditorControls(props:BECProps) {
    const classes = TabPanelStyles();
    const [value, setValue] = React.useState('one');

    const handleChange = (event:any, newValue:any) => {
        setValue(newValue);
      };

return (
    <div className={classes.root}>
      <AppBar position="static"
        style={{ backgroundColor:"rgb(160, 130, 80)",
          boxShadow:'none' }}
      >
        <Tabs value={value} onChange={handleChange} aria-label="wrapped label tabs example"
          variant='fullWidth'
          centered>
          <Tab
            value="one"
            label="Create a link"
            wrapped
            {...a11yProps('one')}
          />
          <Tab 
            value="two"
            label="Upload definitions" 
            wrapped
            {...a11yProps('two')}
            />          
        </Tabs>
      </AppBar>
      <TabPanel value={value} index="one">
      <InfoSection
        message = { 
          <div> For large polymers, the directed click selection of molecular units can be difficult.
            In this panel, you can perform menu based selection of pairs of molecular unit across 
            even the largest polymer.
            <ul>
              <li>Molecular unit are displayed by their abbreviation and abosulte numbering.</li>
              <li>Currently selected molecular units are highlighted in the graphical view.</li>
              <li>You may define the properties during later processing steps</li>
            </ul>    
            This panel will only be active once molecular units are added to the graph.   
          </div>
        }
      />   
      <Marger size='3rem'/>
      <LinkCreator
          disabled={ props.canCreateLink }
          values={ props.linksValues } 
          onSelectItemEnter={ props.onSelectItemEnter }
          onSelectItemLeave={ props.onSelectItemEnter }
          onSrcSelect={ props.onSrcSelect }
          onTgtSelect={ props.onTgtSelect }
          onAction={ props.onAction }
      />      
      </TabPanel>
      <TabPanel value={value} index="two">
      <InfoSection
        message = { 
          <div>
            <p>
             The set molecular links within the MAD:PolymerEditor is limited, 
             your current polymer may required specific bond definitions. 
             In the later processing stage, the MAD:PolymerEditor will prompt you
             if such cases arise to let you interactively fix them, anyway.
             </p>
             <p>
             Still, It may be more appropriate to provide bonds definitions beforehand, 
             especially if many links are involved.
             The MAD:PolymerEditor can process this information under the vermouth&nbsp;
             <a href="https://github.com/marrink-lab/polyply_1.0/wiki/Tutorial:-writing-.ff-input-files"> 
             ff format specified by polyply</a>.
             </p>
          </div>
        }
        />
        <Marger size='1.5rem'/>      
        <CustomLinkUploader
          handleUpload={ props.handleVermouthFFUpload }
        />
      </TabPanel>     
    </div>
  );
}
