import Box from '@mui/system/Box';
import { useState } from "react";
import { Stack } from '@mui/material';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

/*
 
Any temporary major information should be written here

*/
interface WBarProps {
    maxHeight: number,
    onClose: () => void,
}
export function WelcomeBar (props:WBarProps) {
    
    const [hide, setHide] = useState(false)


    const message = (
        <p> This is the pre-release version of the new MAD server.  
            Any comments or suggestions will be greatly appreciated and can be sent to 
            <a 
            style={{whiteSpace:'nowrap'}} href="mailto:mad-contacts@ens-lyon.fr"> mad-contacts@ens-lyon.fr </a></p>)
    
    return (
    <Stack style={{ 
        display: hide ? 'none' : 'flex', 
        backgroundColor: '#45ba52', //'forestgreen',      
        marginRight:'0px',
        maxHeight: props.maxHeight,
        overflow:'hidden',  
        justifyContent: 'center',            
        }} 
        direction='row'>
       
        <Box  style={{ 
            paddingLeft: '3rem ',
            paddingRight: '1rem',           
            fontSize: '1.25rem',
            color:'rgba(0, 0,0, 0.75)',
            fontWeight: 200,
         }}>{ message }</Box>

        <Box style= {{                
            display: 'flex',
            paddingRight: '1rem',
            paddingTop: '1rem',
            color:'black',           
            justifyContent: 'flex-end' 
        }}>
            <HighlightOffIcon
                fontSize='large'
                style={{ 'cursor': 'pointer', color:'rgba(0, 0,0, 0.75)' }}
                onClick={() => {             
                    setHide(true);
                    props.onClose();
                }}
            />            
        </Box>
    </Stack>
    )
  }