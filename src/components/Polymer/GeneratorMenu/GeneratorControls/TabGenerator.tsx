import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Paper } from '@mui/material';


export function TabPanel(props:any) {
    const { children, value, index, ...other } = props;
  
    return (
     
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`wrapped-tabpanel-${index}`}
        aria-labelledby={`wrapped-tab-${index}`}
        {...other}
      >
        {value === index && (
          
          children
          
        )}
      </div>      
    );
  }


TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
  };
  
export function a11yProps(index:any) {
    return {
      id: `wrapped-tab-${index}`,
      'aria-controls': `wrapped-tabpanel-${index}`,
    };
  }


export const TabPanelStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.paper, 
      minWidth:'100%', minHeight:500, boxShadow:'1px 2px 2px grey',
      marginBottom:'0.5em'

    },
  }));

