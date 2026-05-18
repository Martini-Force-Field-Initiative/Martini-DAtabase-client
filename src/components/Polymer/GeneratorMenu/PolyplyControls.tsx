import * as React from 'react';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import UndoIcon from '@mui/icons-material/Undo';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import HandymanIcon from '@mui/icons-material/Handyman';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { styled } from "@mui/system";
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
interface PCProps {
    onUndo: ()=>void;
    onSubmit: ()=>void;   
    onError:boolean;
    onRepairClick:()=>void;
};
// Does not work, must look into dom
const useStyles = makeStyles((theme: Theme) =>
    createStyles({          
      controls: {
        paddingTop:'0em', paddingBottom:'0em'
      },
      leftControls : {
        paddingLeft:'0.em', paddingRight:'30px',
      },
      rightControls : {
        paddingLeft:'1rem', paddingRight:'0rem',
      },
      
    }));

const MuiButton = styled(Button)({
    "&.Mui-disabled": {
      borderColor: "rgba(25, 118, 210, 0.5) transparent rgba(25, 118, 210, 0.5) rgba(25, 118, 210, 0.5)"
    },
    "&.MuiButton-outlined.Mui-disabled": {
      borderColor: "rgba(25, 118, 210, 0.5) transparent rgba(25, 118, 210, 0.5) rgba(25, 118, 210, 0.5)"
    },
    "&.MuiButton-contained.Mui-disabled": {
       borderColor: "rgba(25, 118, 210, 0.5) transparent rgba(25, 118, 210, 0.5) rgba(25, 118, 210, 0.5)"
    }
  });



export default function PolyplyControls(props:PCProps) {
    const classes = useStyles();

  return (
    <ButtonGroup
        size='large'   
        variant='text'
        aria-label="Disabled button group"
    >
        {/*
        <Button 
            onClick={props.onUndo}
            style={{paddingLeft:'1em', paddingRight:'1em',  paddingTop:'1em'}}
        > 
            Cancel <UndoIcon/> 
        </Button>
        */}
        {
            props.onError ? 
            <Button
                className={ `${classes.controls} ${classes.leftControls}` }              
                onClick={ props.onRepairClick }
            >
                Fix a bond <HandymanIcon/>
            </Button>
            :
            <MuiButton
                className={ `${classes.controls} ${classes.leftControls}` }              
                disabled                 
            >
              <HandymanIcon/> Fix a bond 
            </MuiButton>
            
        }


        <Button 
            className={ `${classes.controls} ${classes.rightControls}` }          
            onClick={ ()=>{               
                props.onSubmit() }
            }
        >
            Create Polymer <PlayCircleIcon fontSize="large"/>                
        </Button>

    </ButtonGroup>
  );
}