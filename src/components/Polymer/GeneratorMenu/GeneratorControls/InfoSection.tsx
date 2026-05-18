
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import HelpIcon from '@mui/icons-material/Help';
import { Alert } from '@mui/material';
/*
const TabPanelStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.paper, 
      minHeight:500, minWidth:'100%'
    },
  }));
*/

export interface ISProps{
    message: React.ReactNode;
}
const infoSectClass = makeStyles((theme) => ({
    root: {
    //padding:"0.5em",
      flexGrow: 1,     
      //backgroundColor: theme.palette.info.light, 
     /* backgroundColor: theme.palette.background.paper,
      color:'#53536a',
      fontFamily: "Roboto, Helvetica, Arial",
      fontWeight: 400,
      fontSize: '0.8rem',
      lineHeight: '1.5',
      letterSpacing: '0.00938em',*/
      //textAlign:'center',          
    },
  }));

export default function InfoSection(props:ISProps) {
    return (
        <div className= { infoSectClass().root }>
            
        
        <Alert 
            severity="info" 
            style={{ alignItems:"center", paddingTop:'0em'}}
            icon={<HelpIcon fontSize="large" />}
       > {props.message }
        </Alert>      
        </div>
    );
}
