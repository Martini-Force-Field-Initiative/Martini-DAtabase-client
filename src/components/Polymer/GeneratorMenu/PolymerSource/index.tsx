import * as React from "react";
import { Grid } from '@material-ui/core';
import PolymerSourceButtons from "./PolymerSourceButtons";

import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';


interface PSProps {
    options:[title:string, action:()=>void][],
    //onClick: [ownMol: () => void, fromMAD: () => void, fromHIST: () => void];
}
export default function PolymerSource(props: PSProps) {
        const [state, setState] = React.useState({ open : true, selIndex:-1 }); 
        let liveIndex = 0;

        return (
            <Box sx={{ width: '100%' }}>
            <Collapse 
            in={state.open}
          
            onExited={  () => {                 
                //props.onClick[liveIndex]();
                } 
            }
            >
            <Alert icon={<QuestionMarkIcon fontSize="inherit" />}
                severity="warning"                
            >
            <Grid container
                direction="column"               
            >
                <Grid item
                    xs={12}
                    style={{ marginBottom: '0.5em'}}
                >
                    Choose the source of the original molecule coordinates to start modifying with polymers
                </Grid>
                <Grid item
                    xs={12}
                >
                    <PolymerSourceButtons
                        options = { props.options }
                        onClick={ (index:number) =>{  // Just here for current compoenet  
                            setState({ ...state, selIndex:index})
                            console.log("I got this " + index);
                            //setState({...state, open: false});
                            liveIndex = index;
                            //props.onClick[liveIndex]();
                        }}
                    />
                </Grid>                    
            </Grid>
                </Alert>
            </Collapse>
        </Box>
        )
    }



    /*
    return (
        <Grid container
            direction='column'
            spacing={2}
            style={{ backgroundColor:"steelblue"}}
        >
            <Grid
                item
                xs={12}
            >
                Load orginal molecule coordinates to start modifying with polymers:
            </Grid>
            <Grid
                item
                xs={12}
            >
                <Grid container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                >
                    <PolymerSourceButtons onClick={props.onClick}></PolymerSourceButtons>
                </Grid>
            </Grid>
        </Grid>
    )
        */ 